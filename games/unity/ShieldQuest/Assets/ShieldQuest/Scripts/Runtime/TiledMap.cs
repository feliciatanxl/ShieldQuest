using System;
using System.Linq;
using UnityEngine;

namespace ShieldQuest
{
    // JsonUtility mirror of the Tiled .tmj fields we use. Unknown fields are ignored.
    [Serializable] public class TiledProperty { public string name; public string type; public string value; }
    [Serializable] public class TiledObject
    {
        public int id; public string name; public string type; public float x, y, width, height;
        public TiledProperty[] properties;
        public string Prop(string key) => properties?.FirstOrDefault(p => p.name == key)?.value;
    }
    [Serializable] public class TiledLayer { public string name; public string type; public long[] data; /* long: flip flags set bit 31 */ public TiledObject[] objects; }
    [Serializable] public class TiledTilesetRef { public int firstgid; public string name; public int columns; public int tilecount; public int tilewidth; public int tileheight; }
    [Serializable] public class TiledMap
    {
        public int width, height, tilewidth, tileheight;
        public string orientation;
        public TiledLayer[] layers;
        public TiledTilesetRef[] tilesets;

        public static TiledMap Parse(string json)
        {
            var map = JsonUtility.FromJson<TiledMap>(json);
            if (map == null || map.layers == null || map.tilesets == null || map.tilesets.Length == 0)
                throw new InvalidOperationException("Tiled map JSON is missing layers or tilesets");
            if (map.orientation != "orthogonal") throw new InvalidOperationException($"Unsupported Tiled orientation: {map.orientation}");
            return map;
        }

        public TiledLayer Layer(string name) =>
            layers.FirstOrDefault(l => l.name == name) ?? throw new InvalidOperationException($"Missing Tiled layer: {name}");
    }
}
