using System.Collections.Generic;
using ShieldQuest.Core;
using UnityEngine;

namespace ShieldQuest
{
    /// <summary>
    /// Slices the PixelLab sheets at runtime (64px cells). Idle: 8 rotations in one row.
    /// Walk (only where exported): 6 frames x 4 rows (down, up, left, right).
    /// shortcut: runtime Sprite.Create instead of importer slicing/Animator clips; move to Sprite Atlas + clips once art is final.
    /// </summary>
    public sealed class CharacterSprites
    {
        const int Cell = 64;
        const float FeetY = 0.06f; // feet sit ~4px above the bottom of the 64px cell (FEET_Y 0.94 in m01.ts)
        static readonly Dictionary<string, CharacterSprites> Cache = new();

        public readonly Sprite[] Idle;     // 8 rotations
        public readonly Sprite[][] Walk;   // [row][frame] or null when no walk sheet exists
        public bool HasWalk => Walk != null;

        CharacterSprites(Texture2D idle, Texture2D walk)
        {
            Idle = Row(idle, 0, idle.width / Cell);
            if (walk == null) return;
            int rows = walk.height / Cell, cols = walk.width / Cell;
            Walk = new Sprite[rows][];
            for (int r = 0; r < rows; r++) Walk[r] = Row(walk, r, cols);
        }

        /// <summary>id = file prefix in Resources/Characters, e.g. "student" or "poly".</summary>
        public static CharacterSprites Load(string id)
        {
            if (Cache.TryGetValue(id, out var s)) return s;
            var idle = Resources.Load<Texture2D>($"Characters/{id}-idle");
            if (idle == null) { Debug.LogError($"[ShieldQuest] Missing character sheet Characters/{id}-idle"); return null; }
            return Cache[id] = new CharacterSprites(idle, Resources.Load<Texture2D>($"Characters/{id}-walk"));
        }

        public Sprite IdleFor(Dir d) => Idle[WorldMath.IdleFrame(d)];

        static Sprite[] Row(Texture2D tex, int rowFromTop, int count)
        {
            var row = new Sprite[count];
            int y = tex.height - (rowFromTop + 1) * Cell; // texture origin is bottom-left
            for (int i = 0; i < count; i++)
                row[i] = Sprite.Create(tex, new Rect(i * Cell, y, Cell, Cell), new Vector2(0.5f, FeetY), WorldMath.CharPixelsPerUnit);
            return row;
        }
    }
}
