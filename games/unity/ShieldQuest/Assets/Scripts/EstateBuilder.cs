using System;
using System.Collections.Generic;
using System.Linq;
using Newtonsoft.Json.Linq;
using UnityEngine;

namespace ShieldQuest
{
    /// Builds Sunshine Estate from the same neighbourhood.tmj and PixelLab sprites the Phaser game uses.
    /// Sprite-selection rules mirror src/game/pixellabArt.ts; door positions mirror src/game/locations.ts.
    public class EstateBuilder : MonoBehaviour
    {
        public const string ResourceRoot = "PixelLab/";
        const int Margin = 14;

        public Vector2 Size { get; private set; }
        public readonly List<Footprint> Collisions = new();
        public readonly List<Hotspot> Hotspots = new();
        public readonly List<string> MissingSprites = new();
        public int GroundTiles { get; private set; }
        public PlayerController Player { get; private set; }

        public static readonly Vector2 Start = new(10.6f, 10.55f);
        public static readonly Dictionary<string, (string label, Vector2 at, float radius)> Doors = new()
        {
            ["enter"] = ("Enter Sunshine Minimart", new Vector2(13.24f, 9.64f), .82f),
            ["house-entrance"] = ("Visit The Mysterious House", new Vector2(23.56f, 10.14f), .93f),
            ["house-h-entrance"] = ("Enter Freeze Frame House", new Vector2(28.5f, 8.5f), .95f),
            ["house-i-entrance"] = ("Enter Whisper Network House", new Vector2(14.5f, 26.5f), .95f),
        };
        static readonly Dictionary<string, string> Residents = new() { ["may"] = "Talk to Auntie May", ["amir"] = "Talk to Amir" };
        static readonly HashSet<string> NonSolid = new() { "shelter", "bus", "linkway", "sign", "bougainvillea", "road", "crossing", "detail", "walker", "busroute" };

        void Awake() => Build();

        public void Build()
        {
            var source = Resources.Load<TextAsset>(ResourceRoot + "neighbourhood");
            if (source == null) throw new InvalidOperationException("Missing Resources/PixelLab/neighbourhood.json - open the project in the Editor so PixelLabSync copies it from src/game.");
            var map = JObject.Parse(source.text);
            int width = (int)map["width"], height = (int)map["height"];
            float unit = (float)map["tileheight"];
            Size = new Vector2(width, height);
            var layers = (JArray)map["layers"];
            var tiles = layers.First(l => (string)l["type"] == "tilelayer")["data"].Select(t => (int)t).ToArray();
            BuildGround(tiles, width, height);

            foreach (var o in layers.Where(l => (string)l["type"] == "objectgroup").SelectMany(l => l["objects"]))
            {
                var props = (o["properties"] as JArray)?.ToDictionary(p => (string)p["name"], p => p["value"]) ?? new Dictionary<string, JToken>();
                var p = new Prop((string)o["type"], (string)o["name"], (float)o["x"] / unit, (float)o["y"] / unit, (float)o["width"] / unit, (float)o["height"] / unit, props);
                PlaceProp(p);
                if (Residents.TryGetValue(p.Kind, out var label))
                {
                    Hotspots.Add(new Hotspot(p.Kind, label, new Vector2(p.X, p.Y), .95f));
                    Collisions.Add(new Footprint(p.X - .13f, p.Y - .13f, .26f, .26f, "npc", p.Kind));
                    Renderer(p.Name, Sprite("objects/npc-" + p.Kind), Iso.ToWorld(p.X, p.Y), 1, Iso.Sorting(p.X, p.Y));
                }
                // A block with a void deck is walkable underneath: only its pillars, lift core and walls are solid.
                var deck = VoidDeckOf(p);
                if (deck != null) Collisions.AddRange(deck.Solids);
                else if (p.W > 0 && p.D > 0 && !NonSolid.Contains(p.Kind)) Collisions.Add(new Footprint(p.X, p.Y, p.W, p.D, p.Kind, p.Name));
                if (p.Kind is "shelter" or "bus")
                    foreach (var x in new[] { p.X, p.X + p.W - .13f })
                        foreach (var y in new[] { p.Y, p.Y + p.D - .13f }) Collisions.Add(new Footprint(x, y, .13f, .13f, p.Kind, p.Name));
            }
            foreach (var (id, door) in Doors) Hotspots.Add(new Hotspot(id, door.label, door.at, door.radius));

            Player = new GameObject("Player").AddComponent<PlayerController>();
            Player.Init(this, Sprite("objects/player"), Start);
        }

        void BuildGround(int[] tiles, int width, int height)
        {
            var root = new GameObject("Ground").transform;
            root.SetParent(transform);
            for (var y = -Margin; y < height + Margin; y++)
                for (var x = -Margin; x < width + Margin; x++)
                {
                    // Past the edge a road keeps going with a pavement kerb either side; everything else is verge
                    // (mirrors groundTiles in src/game/pixellabArt.ts).
                    var inside = x >= 0 && y >= 0 && x < width && y < height;
                    int Kind(int ex, int ey) { var t = tiles[Mathf.Clamp(ey, 0, height - 1) * width + Mathf.Clamp(ex, 0, width - 1)]; return t == 0 ? -1 : (t - 1) >> 2; }
                    var tile = inside ? tiles[y * width + x] : 0;
                    if (!inside)
                    {
                        var sideways = x < 0 || x >= width;
                        var kerb = sideways ? Kind(x, y - 1) == 2 || Kind(x, y + 1) == 2 : Kind(x - 1, y) == 2 || Kind(x + 1, y) == 2;
                        var kind = Kind(x, y) == 2 ? 2 : kerb ? 1 : 0;
                        tile = 1 + kind * 4 + ((x * 7 + y * 13) & 3);
                    }
                    if (tile == 0) continue;
                    var r = new GameObject().AddComponent<SpriteRenderer>();
                    r.transform.SetParent(root);
                    r.sprite = Sprite($"ground/tile_{tile - 1}");
                    r.transform.position = Iso.ToWorld(x + .5f, y + .5f);
                    r.sortingOrder = -30000;
                    if (inside) GroundTiles++;
                }
        }

        static VoidDeck.Layout VoidDeckOf(Prop p) =>
            p.Kind == "block" && p.Properties.TryGetValue("voidDeck", out var on) && on.Type == JTokenType.Boolean && (bool)on
                ? VoidDeck.Build(p.X, p.Y, p.W, p.D, key => p.Properties.TryGetValue(key, out var v) ? v.ToString() : null, p.Name)
                : null;

        sealed class Prop
        {
            public readonly string Kind, Name;
            public readonly float X, Y, W, D;
            public readonly Dictionary<string, JToken> Properties;
            public Prop(string kind, string name, float x, float y, float w, float d, Dictionary<string, JToken> properties)
            { Kind = kind; Name = name; X = x; Y = y; W = w; D = d; Properties = properties; }
        }

        static string FittedSprite(Prop p) => p.Kind switch
        {
            "block" => (string)p.Properties.GetValueOrDefault("sprite") ?? new[] { "hdb-teal", "hdb-mondrian", "hdb-yellow" }[(int)char.GetNumericValue(((string)p.Properties.GetValueOrDefault("number") ?? "0").Last()) % 3],
            "shop" => "minimart", "kopi" => "kopi", "play" => "playground", "garden" => "garden", "planter" => "planter",
            "shelter" or "linkway" => "linkway", "bus" => "bus-shelter",
            "hawker" => "hawker-centre", "fitness" => "fitness-corner", "pavilion" => "pavilion", "pond" => "pond",
            "building" => (string)p.Properties.GetValueOrDefault("sprite"),
            "house" => p.Name.Contains("Freeze Frame") || p.Name.Contains("House H") ? "house-h"
                : p.Name.Contains("Whisper Network") || p.Name.Contains("House I") ? "house-i" : "house-mysterious",
            _ => null,
        };

        static (string sprite, float scale)? FixedSprite(Prop p) => p.Kind switch
        {
            "tree" => (p.Properties.ContainsKey("palm") ? "rain-tree" : Mathf.RoundToInt(p.X * 7 + p.Y * 3) % 5 == 0 ? "frangipani" : "angsana", .9f),
            "npc" => ((string)p.Properties.GetValueOrDefault("sprite"), 1f),
            "lamp" => ("lamp", 1.05f), "trafficLight" => ("traffic-light", .95f), "sign" => ("street-sign", 1.05f),
            "bench" => ("bench", 1.25f), "bin" => ("bin", 1.1f), "kopitiam" => ("kopitiam-table", 1.15f), "bougainvillea" => ("planter", 1.2f),
            "chess" => ("chess-table", 1f), "recycle" => ("recycling-bins", 1f), "bikes" => ("bikes", 1.1f),
            _ => null,
        };

        static (string text, float at, Color plate)? Sign(Prop p) => p.Kind switch
        {
            "block" => ($"BLK {p.Properties.GetValueOrDefault("number")}", .16f, new Color32(0x1f, 0x3b, 0x4d, 255)),
            "shop" => ("SUNSHINE MINIMART", .3f, new Color32(0x1d, 0x6b, 0x45, 255)),
            "kopi" => ("KOPI CORNER", .38f, new Color32(0x7c, 0x2a, 0x22, 255)),
            "building" => (((string)p.Properties.GetValueOrDefault("sign") ?? p.Name).Replace("|", " ").ToUpperInvariant(), .2f, new Color32(0x26, 0x36, 0x4b, 255)),
            "house" => (p.Name.Contains("Freeze") ? "FREEZE FRAME" : p.Name.Contains("Whisper") ? "WHISPER NETWORK" : "MYSTERY HOUSE", .12f, new Color32(0x2b, 0x22, 0x38, 255)),
            _ => null,
        };

        void PlaceProp(Prop p)
        {
            var order = Iso.Sorting(p.X + p.W, p.Y + p.D);
            var fitted = FittedSprite(p);
            if (fitted != null)
            {
                var sprite = Sprite("objects/" + fitted);
                if (sprite == null) return;
                var scale = (p.W + p.D) * Iso.TileWidth / 2 / sprite.rect.width;
                var bottom = Iso.ProjectPx(p.X + p.W, p.Y + p.D).y + 2;
                var centre = Iso.ProjectPx(p.X + p.W / 2, p.Y + p.D / 2).x;
                var r = Renderer(p.Name, sprite, new Vector3(centre / Iso.PixelsPerUnit, -bottom / Iso.PixelsPerUnit), scale, order);
                // The facade stands on its void deck. Pillars, lift core and see-through window are Phaser-only for now.
                if (VoidDeckOf(p) is { } deck) r.transform.position += Vector3.up * (deck.Height / Iso.PixelsPerUnit);
                // Walkways and slab blocks are drawn running along y, so they mirror when laid along x (as in pixellabArt.ts).
                r.flipX = (p.Kind is "shelter" or "linkway" or "bus" || fitted is "hdb-teal" or "hdb-mondrian") && p.W > p.D;
                if (Sign(p) is { } s) Label(s.text, s.plate, r.transform.position + Vector3.up * (sprite.rect.height * scale / Iso.PixelsPerUnit * (1 - s.at)), order + 1);
                return;
            }
            if (FixedSprite(p) is { } f)
            {
                var size = p.Properties.TryGetValue("large", out var large) && (bool)large ? 1.2f : 1f;
                var at = Iso.ToWorld(p.X + p.W / 2, p.Y + p.D / 2) + Vector3.down * (4 / Iso.PixelsPerUnit);
                Renderer(p.Name, Sprite("objects/" + f.sprite), at, f.scale * size, order);
            }
        }

        SpriteRenderer Renderer(string name, Sprite sprite, Vector3 at, float scale, int order)
        {
            var r = new GameObject(name).AddComponent<SpriteRenderer>();
            r.transform.SetParent(transform);
            r.sprite = sprite;
            r.transform.position = at;
            r.transform.localScale = Vector3.one * scale;
            r.sortingOrder = order;
            return r;
        }

        void Label(string text, Color plate, Vector3 at, int order)
        {
            var go = new GameObject("Sign " + text);
            go.transform.SetParent(transform);
            go.transform.position = at;
            var mesh = go.AddComponent<TextMesh>();
            mesh.text = text;
            mesh.font = Resources.GetBuiltinResource<Font>("LegacyRuntime.ttf");
            mesh.GetComponent<MeshRenderer>().sharedMaterial = mesh.font.material;
            mesh.GetComponent<MeshRenderer>().sortingOrder = order + 1;
            mesh.fontSize = 48; mesh.characterSize = .045f; mesh.anchor = TextAnchor.MiddleCenter; mesh.color = new Color(1f, .96f, .85f);
            var back = new GameObject("Plate").AddComponent<SpriteRenderer>();
            back.transform.SetParent(go.transform, false);
            back.sprite = UnityEngine.Sprite.Create(Texture2D.whiteTexture, new Rect(0, 0, 4, 4), new Vector2(.5f, .5f), 4);
            back.color = plate;
            back.transform.localScale = new Vector3(text.Length * .26f + .4f, .55f, 1);
            back.sortingOrder = order;
        }

        Sprite Sprite(string name)
        {
            var sprite = Resources.Load<Sprite>(ResourceRoot + name);
            if (sprite == null && !MissingSprites.Contains(name)) MissingSprites.Add(name);
            return sprite;
        }
    }
}
