using System.Collections.Generic;
using UnityEngine;

namespace ShieldQuest
{
    /// Port of src/game/isometric.ts. Map units are Tiled cells; 1 Unity unit = PixelsPerUnit pixels.
    public static class Iso
    {
        public const float TileWidth = 64, TileHeight = 32, PixelsPerUnit = 32;
        const float PlayerRadius = .17f;

        public static Vector2 ProjectPx(float x, float y) => new((x - y) * TileWidth / 2, (x + y) * TileHeight / 2);

        public static Vector3 ToWorld(float x, float y)
        {
            var px = ProjectPx(x, y);
            return new Vector3(px.x / PixelsPerUnit, -px.y / PixelsPerUnit, 0);
        }

        /// Screen direction (x right, y down) to map-space direction, as screenMovement() in isometric.ts.
        public static Vector2 ScreenToMap(Vector2 screen) => new(screen.y / TileHeight + screen.x / TileWidth, screen.y / TileHeight - screen.x / TileWidth);

        /// Same ordering as depthAt(); larger draws in front.
        public static int Sorting(float x, float y) => Mathf.RoundToInt((x + y) * TileHeight / 2 * 4);

        public static float HotspotDistance(Hotspot spot,Vector2 at)
        {
            float distance=Vector2.Distance(spot.At,at);if(spot.Approach==null)return distance;
            if(EstateBuilder.Inside(at,spot.Approach))return Mathf.Min(distance,.45f);
            for(int i=0;i<spot.Approach.Count;i++){var a=SharedGame.Point(spot.Approach[i]);var b=SharedGame.Point(spot.Approach[(i+1)%spot.Approach.Count]);var d=b-a;float t=Mathf.Clamp01(Vector2.Dot(at-a,d)/Mathf.Max(.00001f,d.sqrMagnitude));distance=Mathf.Min(distance,Vector2.Distance(at,a+d*t)+.45f);}return distance;
        }
        public static bool CanStand(Vector2 p, Vector2 size, IReadOnlyList<Footprint> scenery)
        {
            if (p.x < PlayerRadius || p.y < PlayerRadius || p.x > size.x - PlayerRadius || p.y > size.y - PlayerRadius) return false;
            foreach (var r in scenery)
                if (p.x + PlayerRadius > r.X && p.x - PlayerRadius < r.X + r.W && p.y + PlayerRadius > r.Y && p.y - PlayerRadius < r.Y + r.D) return false;
            return true;
        }
    }

    public struct Footprint
    {
        public float X, Y, W, D;
        public string Kind, Name;
        public Footprint(float x, float y, float w, float d, string kind = "", string name = "") { X = x; Y = y; W = w; D = d; Kind = kind; Name = name; }
    }

    public struct Hotspot
    {
        public string Id, Label;
        public Vector2 At;
        public float Radius;
        public Newtonsoft.Json.Linq.JArray Approach;
        public Newtonsoft.Json.Linq.JObject Building;
        public Hotspot(string id, string label, Vector2 at, float radius, Newtonsoft.Json.Linq.JArray approach=null, Newtonsoft.Json.Linq.JObject building=null) { Id = id; Label = label; At = at; Radius = radius; Approach=approach;Building=building; }
    }
}
