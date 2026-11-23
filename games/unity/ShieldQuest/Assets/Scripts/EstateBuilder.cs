using System;
using System.Collections.Generic;
using System.Linq;
using Newtonsoft.Json.Linq;
using UnityEngine;
using UnityEngine.Rendering;

namespace ShieldQuest
{
    public class EstateBuilder : MonoBehaviour
    {
        public const string ResourceRoot = "PixelLab/";
        public Vector2 Size { get; private set; }
        public readonly List<Footprint> Collisions = new();
        public readonly List<Hotspot> Hotspots = new();
        public readonly List<string> MissingSprites = new();
        public readonly List<JObject> Props = new();
        public readonly List<(SpriteRenderer day, SpriteRenderer light, JObject prop, List<JArray> silhouettes)> Buildings = new();
        public readonly List<SpriteRenderer> Scenery = new();
        public PlayerController Player { get; private set; }
        public string Area { get; private set; } = "Neighbourhood";
        public int GroundTiles { get; private set; }
        public int BuildingCount => Buildings.Count;
        public Material GroundMaterial { get; private set; }
        public static Vector2 Start { get { SharedGame.Load(); return SharedGame.Point(SharedGame.Config["start"]); } }
        public static Dictionary<string, (string label, Vector2 at, float radius)> Doors
        {
            get
            {
                SharedGame.Load(); var e = SharedGame.Config["entrances"];
                return new() { ["enter"] = ("Enter Sunshine Minimart", SharedGame.Point(e["shop"]), .82f), ["house-entrance"] = ("Visit The Mysterious House", SharedGame.Point(e["house"]), .93f), ["house-h-entrance"] = ("Enter Freeze Frame House", SharedGame.Point(e["houseH"]), .95f), ["house-i-entrance"] = ("Enter Whisper Network House", SharedGame.Point(e["houseI"]), .95f) };
            }
        }
        Transform content;
        readonly List<UnityEngine.Object> owned = new();
        void ClearOwned(){foreach(var asset in owned)if(asset!=null)Destroy(asset);owned.Clear();GroundMaterial=null;}
        void OnDestroy()=>ClearOwned();
        static readonly HashSet<string> NonSolid = new() { "geoBuilding", "geoRoad", "geoPath", "geoGreen", "entry", "shelter", "bus", "linkway", "sign", "bougainvillea", "road", "crossing", "detail", "walker", "busroute", "parking" };
        void Awake() { SharedGame.Load(); Build(); }
        public void Build()
        {
            ClearOwned();
            if (content != null) { content.gameObject.SetActive(false); Destroy(content.gameObject); }
            Collisions.Clear(); Hotspots.Clear(); Props.Clear(); Buildings.Clear(); Scenery.Clear(); MissingSprites.Clear(); GroundTiles = 0;
            string savedScene = (string)SharedGame.Save["scene"];
            var savedPosition = SharedGame.Point(SharedGame.Save["position"]);
            if (GetComponent<EstateTraffic>() is {} oldTraffic) {oldTraffic.enabled=false;Destroy(oldTraffic);}
            Area = "Neighbourhood"; content = new GameObject("Editable geographic world").transform; content.SetParent(transform);
            var map = JObject.Parse(Resources.Load<TextAsset>(ResourceRoot + "neighbourhood").text);
            Size = new Vector2((int)map["width"], (int)map["height"]);
            int[] tiles = map["layers"].First(l => (string)l["type"] == "tilelayer")["data"].Select(t => (int)t).ToArray();
            BuildGround(tiles, (int)Size.x, (int)Size.y);
            var exports = ((JArray)SharedGame.Definitions["buildings"]).ToDictionary(e => (long)e["osmId"]);
            foreach (var o in map["layers"].Where(l => (string)l["type"] == "objectgroup").SelectMany(l => l["objects"]))
            {
                var p = new JObject { ["kind"] = o["type"], ["name"] = o["name"], ["x"] = (float)o["x"] / 32, ["y"] = (float)o["y"] / 32, ["w"] = (float)o["width"] / 32, ["d"] = (float)o["height"] / 32, ["properties"] = JObject.FromObject(o["properties"].ToDictionary(v => (string)v["name"], v => v["value"])) };
                if (o["polyline"] is JArray path) p["path"] = new JArray(path.Select(v => new JObject { ["x"] = ((float)o["x"] + (float)v["x"]) / 32, ["y"] = ((float)o["y"] + (float)v["y"]) / 32 }));
                if (o["polygon"] is JArray polygon) p["polygon"] = new JArray(polygon.Select(v => new JObject { ["x"] = ((float)o["x"] + (float)v["x"]) / 32, ["y"] = ((float)o["y"] + (float)v["y"]) / 32 }));
                Props.Add(p);
                string kind = (string)p["kind"], name = (string)p["name"]; float x = (float)p["x"], y = (float)p["y"], w = (float)p["w"], d = (float)p["d"];
                if (kind == "geoBuilding")
                {
                    long id = (long)p["properties"]["osmId"]; var art = exports[id];
                    var day = Image($"Building {id} · {name}", $"generated/buildings/{id}", (float)art["x"], (float)art["y"], Mathf.RoundToInt((float)art["depth"] * 4));
                    var light = Image("Windows " + id, $"generated/lights/{id}", (float)art["x"], (float)art["y"], day.sortingOrder + 1); light.color = new Color(1, 1, 1, 0);
                    Buildings.Add((day, light, p, Silhouettes(p))); AddBuildingCollisions(p);
                    if (!name.StartsWith("Building ")) Label(name == "Ang Mo Kio Hub" ? "AMK HUB · BUS INTERCHANGE" : name == "Ang Mo Kio" ? "ANG MO KIO MRT" : name, new Vector2(x + w / 2, y + d / 2), (float)p["properties"]["levels"] * 30 + 42, day.sortingOrder + 2);
                }
                else if (kind == "geoRoad" || kind == "geoPath") BuildRoad(p);
                else if (kind == "may" || kind == "amir")
                {
                    Hotspots.Add(new Hotspot(kind, "Talk to " + (kind == "may" ? "Auntie May" : "Amir"), new Vector2(x, y), .95f)); Collisions.Add(new Footprint(x - .13f, y - .13f, .26f, .26f, "npc", name));
                    var r = SpriteObject(name, "objects/npc-" + kind, Iso.ToWorld(x, y), .42f, Iso.Sorting(x, y)); Scenery.Add(r);
                }
                else if (kind == "entry") Label("◆ SHIELD", new Vector2(x, y), 26, 29000);
                else if (kind is "tree" or "bus" or "notice")
                {
                    string asset = kind == "tree" ? "angsana" : kind == "bus" ? "bus-shelter" : "street-sign";
                    float scale = kind == "tree" ? .45f : kind == "bus" ? (w + d) * 32 / 256 : .5f;
                    Scenery.Add(SpriteObject(name, "objects/" + asset, Iso.ToWorld(x + w / 2, y + d / 2), scale, Iso.Sorting(x + w, y + d)));
                    if (kind == "tree" || kind == "notice") Collisions.Add(new Footprint(x, y, w, d, kind, name));
                    if (kind == "bus") foreach (var xx in new[] { x, x + w - .13f }) foreach (var yy in new[] { y, y + d - .13f }) Collisions.Add(new Footprint(xx, yy, .13f, .13f, "pillar", name));
                }
            }
            foreach (var (id, door) in Doors) Hotspots.Add(new Hotspot(id, door.label, door.at, door.radius));
            var ui = GetComponent<UnityInterface>() ?? gameObject.AddComponent<UnityInterface>(); ui.Init(this);
            var climate = GetComponent<SingaporeEnvironment>() ?? gameObject.AddComponent<SingaporeEnvironment>(); climate.Init(this);
            if (Player == null) { Player = new GameObject("Player").AddComponent<PlayerController>(); Player.transform.SetParent(transform); Player.Init(this); }
            Player.Teleport(CanStand(SharedGame.Point(SharedGame.Save["position"])) ? SharedGame.Point(SharedGame.Save["position"]) : Start);
            Player.RefreshLook(); Player.ResetView();
            gameObject.AddComponent<EstateTraffic>().Init(this);
            if (savedScene != "Neighbourhood" && SharedGame.Definitions["interiors"]?[savedScene] != null) Travel(savedScene, savedPosition);
        }
        public void Travel(string area, Vector2 spawn)
        {
            SharedGame.Save["scene"] = area;
            if (area == "Neighbourhood") Build();
            else
            {
                var data = SharedGame.Definitions["interiors"][area]; if (data == null) return;
                ClearOwned();
                if (content != null) { content.gameObject.SetActive(false); Destroy(content.gameObject); }
                content = new GameObject(area + " · shared Phaser layers").transform; content.SetParent(transform);
                Collisions.Clear(); Hotspots.Clear(); Buildings.Clear(); Scenery.Clear(); Props.Clear(); Area = area;
                Size = SharedGame.Point(data["size"]);
                foreach (var r in data["layers"]) Image(area + " layer " + r["id"], $"generated/interiors/{area}/{r["id"]}", (float)r["x"], (float)r["y"], Mathf.Clamp(Mathf.RoundToInt((float)r["depth"] * 4), -30000, 28000));
                foreach (var r in data["collisions"]) Collisions.Add(new Footprint((float)r["x"], (float)r["y"], (float)r["w"], (float)r["d"]));
                foreach (var h in data["hotspots"]) Hotspots.Add(new Hotspot((string)h["id"], (string)h["label"], SharedGame.Point(h["at"]), (float)h["radius"]));
                var traffic = GetComponent<EstateTraffic>(); if (traffic != null) {traffic.enabled=false;Destroy(traffic);}
            }
            SharedGame.Save["scene"] = area; Player.Teleport(CanStand(spawn) ? spawn : SharedGame.Point(SharedGame.Definitions["locations"][area == "House" ? "HOUSE_SPAWN" : area == "HouseH" ? "HOUSE_H_SPAWN" : area == "HouseI" ? "HOUSE_I_SPAWN" : "SHOP_SPAWN"]));
            if (area == "Minimart") SharedGame.Save["investigation"]["entered"] = true;
            Player.RefreshLook(); Player.ResetView(); SharedGame.Persist();
        }
        public bool CanStand(Vector2 at) => Iso.CanStand(at, Size, Collisions) && !(Area=="Neighbourhood" && Player!=null && GetComponent<EstateTraffic>() is {} traffic && traffic.Blocks(at,Player.Position));
        public static bool Inside(Vector2 at, JArray points)
        {
            bool yes = false;
            for (int i = 0, j = points.Count - 1; i < points.Count; j = i++) { var a = SharedGame.Point(points[i]); var b = SharedGame.Point(points[j]); if ((a.y > at.y) != (b.y > at.y) && at.x < (b.x - a.x) * (at.y - a.y) / (b.y - a.y) + a.x) yes = !yes; }
            return yes;
        }
        static List<JArray> Silhouettes(JObject p)
        {
            float z=(bool?)p["properties"]["residential"]==true?38:0,height=(float)p["properties"]["levels"]*30+z;var points=(JArray)p["polygon"];var result=new List<JArray>();
            JObject Project(JToken a,float lift)=>SharedGame.Point(Iso.ProjectPx((float)a["x"],(float)a["y"])-new Vector2(0,lift));
            result.Add(new JArray(points.Select(a=>Project(a,height))));
            for(int i=0;i<points.Count;i++){var a=points[i];var b=points[(i+1)%points.Count];result.Add(new JArray(Project(a,z),Project(b,z),Project(b,height),Project(a,height)));}return result;
        }
        void AddBuildingCollisions(JObject p)
        {
            var points = (JArray)p["polygon"]; float x = (float)p["x"], y = (float)p["y"], w = (float)p["w"], d = (float)p["d"]; string name = (string)p["name"];
            if ((bool?)p["properties"]["residential"] == true)
            {
                for (int i = 0; i < points.Count; i++) { var a = SharedGame.Point(points[i]); var b = SharedGame.Point(points[(i + 1) % points.Count]); float length = Vector2.Distance(a, b); for (float n = 0; n < length; n += 2.5f) { var at = Vector2.Lerp(a, b, n / length); Collisions.Add(new Footprint(at.x, at.y, .22f, .22f, "pillar", name)); } }
                var center = new Vector2(x + w / 2, y + d / 2); if (Inside(center, points)) Collisions.Add(new Footprint(center.x, center.y, .5f, .5f, "core", name));
            }
            else for (float yy = y; yy < y + d; yy += .5f) for (float xx = x; xx < x + w; xx += .5f) if (Inside(new Vector2(xx + .25f, yy + .25f), points)) Collisions.Add(new Footprint(xx, yy, .5f, .5f, "geoBuilding", name));
        }
        readonly List<Vector3> vertices = new(); readonly List<int> triangles = new(); readonly List<Vector2> uv = new(); readonly List<Color> colors = new();
        void Quad(Vector2 a, Vector2 b, Vector2 c, Vector2 d, Color color)
        {
            int n = vertices.Count; foreach (var p in new[] { a, b, c, d }) { vertices.Add(Iso.ToWorld(p.x, p.y)); uv.Add(Vector2.zero); colors.Add(color); } triangles.AddRange(new[] { n, n + 1, n + 2, n, n + 2, n + 3 });
        }
        void MeshObject(string name, Material material, int order)
        {
            if (vertices.Count == 0) return; var mesh = new Mesh { indexFormat = IndexFormat.UInt32 }; owned.Add(mesh);if(!owned.Contains(material))owned.Add(material);mesh.SetVertices(vertices); mesh.SetUVs(0, uv); mesh.SetColors(colors); mesh.SetTriangles(triangles, 0); mesh.RecalculateBounds();
            var go = new GameObject(name); go.transform.SetParent(content); go.AddComponent<MeshFilter>().sharedMesh = mesh; var r = go.AddComponent<MeshRenderer>(); r.sharedMaterial = material; r.sortingOrder = order;
            vertices.Clear(); uv.Clear(); colors.Clear(); triangles.Clear();
        }
        void BuildGround(int[] tiles, int width, int height)
        {
            GroundMaterial = new Material(Shader.Find("Sprites/Default")) { mainTexture = Resources.Load<Texture2D>(ResourceRoot + "generated/ground-atlas") };
            for (int cy = -14; cy < height + 14; cy += 24) for (int cx = -14; cx < width + 14; cx += 24)
            {
                for (int y = cy; y < Mathf.Min(cy + 24, height + 14); y++) for (int x = cx; x < Mathf.Min(cx + 24, width + 14); x++)
                {
                    bool inside = x >= 0 && y >= 0 && x < width && y < height; int tile = tiles[Mathf.Clamp(y, 0, height - 1) * width + Mathf.Clamp(x, 0, width - 1)] - 1; if (tile < 0) continue; if (inside) GroundTiles++;
                    var p = Iso.ProjectPx(x + .5f, y + .5f); int n = vertices.Count; float xx = p.x / 32, yy = -p.y / 32;
                    vertices.AddRange(new[] { new Vector3(xx - 1, yy - 1), new Vector3(xx + 1, yy - 1), new Vector3(xx + 1, yy + 1), new Vector3(xx - 1, yy + 1) });
                    float u = tile % 4 / 4f, v = (3 - tile / 4) / 4f;
                    uv.AddRange(new[] { new Vector2(u, v), new Vector2(u + .25f, v), new Vector2(u + .25f, v + .25f), new Vector2(u, v + .25f) }); colors.AddRange(Enumerable.Repeat(Color.white, 4)); triangles.AddRange(new[] { n, n + 1, n + 2, n, n + 2, n + 3 });
                }
                MeshObject($"Ground chunk {cx},{cy}", GroundMaterial, -30000);
            }
        }
        void BuildRoad(JObject p)
        {
            if (p["path"] is not JArray path) return; float width = (float)p["properties"]["width"]; bool road = (string)p["kind"] == "geoRoad";
            for (int i = 1; i < path.Count; i++) { var a = SharedGame.Point(path[i - 1]); var b = SharedGame.Point(path[i]); var direction = b - a; if (direction.magnitude < .001f) continue; var normal = new Vector2(-direction.y, direction.x).normalized; if (road) { Quad(a - normal * (width / 2 + .2f), b - normal * (width / 2 + .2f), b + normal * (width / 2 + .2f), a + normal * (width / 2 + .2f), Hex("#b8bcaf")); Quad(a - normal * width / 2, b - normal * width / 2, b + normal * width / 2, a + normal * width / 2, Hex("#62696a")); if((bool?)p["properties"]["oneway"]!=true) for (float t = 0; t < direction.magnitude; t += 1.5f) { var from = a + direction.normalized * t; var to = a + direction.normalized * Mathf.Min(t + .65f, direction.magnitude); Quad(from, to, to + normal * .045f, from + normal * .045f, Hex("#e1dbc4")); } } else if((bool?)p["properties"]["covered"]==true) Quad(a-normal*.2f,b-normal*.2f,b+normal*.2f,a+normal*.2f,Hex("#a9b8ad")); }
            var material = new Material(Shader.Find("Sprites/Default")) { mainTexture = Texture2D.whiteTexture }; MeshObject((string)p["name"], material, -29990);
        }
        static Color Hex(string value) { ColorUtility.TryParseHtmlString(value, out var c); return c; }
        public SpriteRenderer SpriteObject(string name, string asset, Vector3 at, float scale, int order)
        {
            var r = new GameObject(name).AddComponent<SpriteRenderer>(); r.transform.SetParent(content); r.sprite = Resources.Load<Sprite>(ResourceRoot + asset); if (r.sprite == null && !MissingSprites.Contains(asset)) MissingSprites.Add(asset); r.transform.position = at; r.transform.localScale = Vector3.one * scale; r.sortingOrder = order; return r;
        }
        SpriteRenderer Image(string name, string asset, float left, float top, int order)
        {
            var texture = Resources.Load<Texture2D>(ResourceRoot + asset); var r = new GameObject(name).AddComponent<SpriteRenderer>(); r.transform.SetParent(content); if (texture == null) { MissingSprites.Add(asset); return r; }
            r.sprite = Sprite.Create(texture, new Rect(0, 0, texture.width, texture.height), new Vector2(0, 1), 32,0,SpriteMeshType.FullRect);owned.Add(r.sprite);r.transform.position = new Vector3(left / 32, -top / 32); r.sortingOrder = order; return r;
        }
        void Label(string text, Vector2 at, float lift, int order)
        {
            var go = new GameObject(text); go.transform.SetParent(content); go.transform.position = Iso.ToWorld(at.x, at.y) + Vector3.up * lift / 32; var label = go.AddComponent<TextMesh>(); label.text = text; label.font = Resources.Load<Font>(ResourceRoot + "fonts/Body"); label.fontSize = 40; label.characterSize = .035f; label.anchor = TextAnchor.MiddleCenter; label.color = new Color(1, .94f, .8f); var r = go.GetComponent<MeshRenderer>(); r.sharedMaterial = label.font.material; r.sortingOrder = order;
        }
    }
}
