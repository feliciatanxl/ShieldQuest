using System;
using ShieldQuest.Core;
using UnityEngine;
using UnityEngine.Tilemaps;

namespace ShieldQuest
{
    /// <summary>
    /// Rebuilds the Phaser neighbourhood from the original Tiled JSON: 4 tile layers,
    /// collision rects, spawn, NPCs and mission zones, then spawns M01 and the camera.
    /// Any scene becomes playable: if none is present, Bootstrap adds one.
    /// </summary>
    public class NeighbourhoodBuilder : MonoBehaviour
    {
        public string mapResource = "Maps/singapore-neighbourhood";
        public string tilesetResource = "Maps/neighbourhood-tiles";
        public string playerCharacter = "student"; // PLAYER in m01.ts; "poly" has a real walk cycle

        static readonly string[] TileLayers = { "Ground", "Paths", "Buildings", "Decoration" };
        // Tiled NPC sprite ids -> character sheets (NPC_SPRITES in neighbourhood.ts).
        static string NpcSheet(string id) => id == "F04" ? "worker" : id == "M06" ? "rider" : null;

        public TiledMap Map { get; private set; }
        public Transform Player { get; private set; }

        [RuntimeInitializeOnLoadMethod(RuntimeInitializeLoadType.AfterSceneLoad)]
        // shortcut: bootstraps into every scene; gate by scene name once the minimart scene exists.
        static void Bootstrap()
        {
            if (FindAnyObjectByType<NeighbourhoodBuilder>() == null) new GameObject("Neighbourhood").AddComponent<NeighbourhoodBuilder>();
        }

        void Awake()
        {
            var json = Resources.Load<TextAsset>(mapResource);
            var sheet = Resources.Load<Texture2D>(tilesetResource);
            if (json == null || sheet == null) { Debug.LogError($"[ShieldQuest] Missing map or tileset resource ({mapResource}, {tilesetResource})"); return; }
            Map = TiledMap.Parse(json.text);
            BuildTiles(sheet);
            BuildObjects();
        }

        void BuildTiles(Texture2D sheet)
        {
            var ts = Map.tilesets[0];
            var tiles = new Tile[ts.tilecount];
            int rows = ts.tilecount / ts.columns;
            for (int i = 0; i < ts.tilecount; i++)
            {
                int c = i % ts.columns, r = i / ts.columns;
                tiles[i] = ScriptableObject.CreateInstance<Tile>();
                tiles[i].sprite = Sprite.Create(sheet, new Rect(c * ts.tilewidth, (rows - 1 - r) * ts.tileheight, ts.tilewidth, ts.tileheight),
                    new Vector2(0.5f, 0.5f), WorldMath.TilePx, 0, SpriteMeshType.FullRect);
            }

            var grid = new GameObject("Grid", typeof(Grid)).transform;
            grid.SetParent(transform, false);
            for (int li = 0; li < TileLayers.Length; li++)
            {
                var layer = Map.Layer(TileLayers[li]);
                var go = new GameObject(layer.name, typeof(Tilemap), typeof(TilemapRenderer));
                go.transform.SetParent(grid, false);
                go.GetComponent<TilemapRenderer>().sortingOrder = -32000 + li; // always under characters, like Phaser depth
                var tm = go.GetComponent<Tilemap>();
                for (int i = 0; i < layer.data.Length; i++)
                {
                    int idx = WorldMath.TileIndex((uint)layer.data[i], ts.firstgid);
                    if (idx < 0 || idx >= tiles.Length) continue;
                    tm.SetTile(new Vector3Int(i % Map.width, Map.height - 1 - i / Map.width, 0), tiles[idx]);
                }
            }
        }

        void BuildObjects()
        {
            var objects = Map.Layer("Gameplay Objects").objects;
            var solids = new GameObject("Collision").transform;
            solids.SetParent(transform, false);
            TiledObject spawn = null;

            foreach (var o in objects)
            {
                switch (o.type)
                {
                    case "collision": AddBox(solids, o.name, o, false); break;
                    case "mission": AddBox(transform, $"Mission {o.Prop("missionId")}", o, true); break;
                    case "npc": AddNpc(o); break;
                    case "spawn": spawn = o; break;
                }
            }
            if (spawn == null) throw new InvalidOperationException("Tiled map is missing its player spawn");

            // Map edges, so the player can never leave the neighbourhood.
            float w = Map.width, h = Map.height;
            AddEdge(solids, new Vector2(w / 2, -0.5f), new Vector2(w + 2, 1));
            AddEdge(solids, new Vector2(w / 2, h + 0.5f), new Vector2(w + 2, 1));
            AddEdge(solids, new Vector2(-0.5f, h / 2), new Vector2(1, h + 2));
            AddEdge(solids, new Vector2(w + 0.5f, h / 2), new Vector2(1, h + 2));

            var (sx, sy) = WorldMath.TiledToWorld(spawn.x, spawn.y, Map.height);
            Player = SpawnPlayer(new Vector2(sx, sy), spawn.Prop("facing"));
            SetupCamera(new Rect(0, 0, w, h));
        }

        void AddBox(Transform parent, string name, TiledObject o, bool trigger)
        {
            var (cx, cy, bw, bh) = WorldMath.TiledRect(o.x, o.y, o.width, o.height, Map.height);
            var go = new GameObject(name);
            go.transform.SetParent(parent, false);
            go.transform.position = new Vector2(cx, cy);
            var box = go.AddComponent<BoxCollider2D>();
            box.size = new Vector2(bw, bh);
            box.isTrigger = trigger;
        }

        static void AddEdge(Transform parent, Vector2 center, Vector2 size)
        {
            var go = new GameObject("Map edge");
            go.transform.SetParent(parent, false);
            go.transform.position = center;
            go.AddComponent<BoxCollider2D>().size = size;
        }

        void AddNpc(TiledObject o)
        {
            var sheetId = NpcSheet(o.Prop("sprite"));
            var sprites = sheetId == null ? null : CharacterSprites.Load(sheetId);
            if (sprites == null) { Debug.LogWarning($"[ShieldQuest] NPC \"{o.name}\" has no sprite asset for \"{o.Prop("sprite")}\""); return; }
            var (x, y) = WorldMath.TiledToWorld(o.x, o.y, Map.height);
            var go = new GameObject($"NPC {o.name}");
            go.transform.SetParent(transform, false);
            go.transform.position = new Vector2(x, y);
            var sr = go.AddComponent<SpriteRenderer>();
            sr.sprite = sprites.IdleFor(Dir.Down);
            sr.sortingOrder = -(int)(y * 100);
            // shortcut: NPC dialogue/interaction not wired yet; dialogue string stays in the Tiled property.
        }

        Transform SpawnPlayer(Vector2 at, string facing)
        {
            var root = new GameObject("M01 Player", typeof(Rigidbody2D), typeof(PlayerInputHandler), typeof(PlayerController));
            root.transform.position = at;
            var feet = root.AddComponent<BoxCollider2D>();
            feet.size = new Vector2(18f, 8f) / WorldMath.CharPixelsPerUnit; // Phaser foot hitbox 18x8 sprite px
            feet.offset = new Vector2(0f, feet.size.y / 2f);
            if (Enum.TryParse<Dir>(facing, true, out var d)) root.GetComponent<PlayerController>().SetFacing(d);

            var visual = new GameObject("Sprite", typeof(SpriteRenderer));
            visual.transform.SetParent(root.transform, false);
            visual.AddComponent<PlayerAnimationController>().characterId = playerCharacter;
            return root.transform;
        }

        void SetupCamera(Rect bounds)
        {
            var cam = Camera.main;
            if (cam == null) cam = new GameObject("Main Camera", typeof(Camera)) { tag = "MainCamera" }.GetComponent<Camera>();
            cam.backgroundColor = new Color32(0x1d, 0x2b, 0x2a, 0xff);
            if (!cam.TryGetComponent<CameraFollowController>(out var follow)) follow = cam.gameObject.AddComponent<CameraFollowController>();
            follow.target = Player;
            follow.bounds = bounds;
            follow.SnapToTarget();
        }
    }
}
