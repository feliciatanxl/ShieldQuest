// Pure C# (no UnityEngine) so it is unit-tested outside the Editor via Tests~/CoreTests.
using System;

namespace ShieldQuest.Core
{
    public enum Dir { Down, Up, Left, Right }
    public enum Gait { Idle, Walk, Run }

    public static class WorldMath
    {
        /// <summary>Tiled map pixels per Unity unit: 1 unit = 1 tile.</summary>
        public const float TilePx = 32f;
        /// <summary>Character sheets: 64px cell drawn 1.6 tiles tall, matching the Phaser CHAR_SCALE/WORLD_SCALE ratio.</summary>
        public const float CharPixelsPerUnit = 40f;
        /// <summary>Phaser speeds (130/220 screen px at WORLD_SCALE 2) converted to tiles per second.</summary>
        public const float WalkSpeed = 130f / 2f / TilePx, RunSpeed = 220f / 2f / TilePx;
        public const float WalkFps = 8f, RunFps = 13f, BobPeriod = 0.14f;
        public const uint GidFlipMask = 0x1FFFFFFF;

        /// <summary>Same rule as m01.ts facingFrom: dominant axis wins, horizontal wins exact diagonals. y is screen-down positive.</summary>
        public static Dir Facing(float x, float yDown) =>
            Math.Abs(x) >= Math.Abs(yDown) ? (x > 0 ? Dir.Right : Dir.Left) : yDown > 0 ? Dir.Down : Dir.Up;

        /// <summary>Idle sheet frame per facing (S=0, E=2, N=4, W=6).</summary>
        public static int IdleFrame(Dir d) => d switch { Dir.Down => 0, Dir.Right => 2, Dir.Up => 4, _ => 6 };

        /// <summary>Walk.png row order is down, up, left, right — the enum order.</summary>
        public static int WalkRow(Dir d) => (int)d;

        /// <summary>Clamps input to length 1 so diagonals are not faster; returns zero under the touch dead zone.</summary>
        public static (float x, float y) Normalise(float x, float y, float deadZone = 0f)
        {
            float len = MathF.Sqrt(x * x + y * y);
            if (len <= deadZone || len == 0f) return (0f, 0f);
            return len > 1f ? (x / len, y / len) : (x, y);
        }

        public static float Speed(Gait g) => g == Gait.Run ? RunSpeed : g == Gait.Walk ? WalkSpeed : 0f;

        /// <summary>Tiled gid -> 0-based tileset index, or -1 for empty. Strips flip flags.</summary>
        public static int TileIndex(uint gid, int firstGid) => (gid & GidFlipMask) == 0 ? -1 : (int)(gid & GidFlipMask) - firstGid;

        /// <summary>Tiled pixel point (y down) -> Unity units (y up).</summary>
        public static (float x, float y) TiledToWorld(float px, float py, int mapHeightTiles) =>
            (px / TilePx, mapHeightTiles - py / TilePx);

        /// <summary>Tiled rect (top-left origin) -> Unity center + size.</summary>
        public static (float cx, float cy, float w, float h) TiledRect(float px, float py, float pw, float ph, int mapHeightTiles) =>
            ((px + pw / 2f) / TilePx, mapHeightTiles - (py + ph / 2f) / TilePx, pw / TilePx, ph / TilePx);
    }
}
