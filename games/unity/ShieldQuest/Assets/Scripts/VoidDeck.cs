using System;
using System.Collections.Generic;
using System.Linq;

namespace ShieldQuest
{
    /// Port of src/game/hdbLayout.ts: the pillars, lift core and walls of a walkable void deck, laid out from a block's
    /// map properties (voidDeck, bay, pillarSpacing, lobbyAt, closedSides, deckHeight). Keep the two in step.
    /// The upper-floor modules (src/game/hdbModules.ts) are not built here yet: Unity still shows the block's sprite.
    public static class VoidDeck
    {
        public const float Pillar = .375f;
        const float Wall = .16f;

        public sealed class Layout
        {
            public bool AlongX;
            public float Height;
            public List<Footprint> Pillars = new(), Cores = new(), Walls = new();
            public IEnumerable<Footprint> Solids => Pillars.Concat(Cores).Concat(Walls);
        }

        public static Layout Build(float x, float y, float w, float d, Func<string, string> property, string name = "")
        {
            bool alongX = w >= d;
            float length = alongX ? w : d, depth = alongX ? d : w;
            float Number(string key, float fallback) => float.TryParse(property(key), System.Globalization.NumberStyles.Float, System.Globalization.CultureInfo.InvariantCulture, out var v) ? v : fallback;
            float spacing = Number("pillarSpacing", 2.5f), height = Number("deckHeight", 104), lobbyAt = Number("lobbyAt", .5f), bay = Number("bay", 0);
            var closed = new HashSet<string>((property("closedSides") ?? "").Split(',').Select(s => s.Trim()).Where(s => s.Length > 0));
            Footprint Rect(float t, float u, float lt, float lu, string kind) =>
                alongX ? new Footprint(x + t, y + u, lt, lu, kind, name) : new Footprint(x + u, y + t, lu, lt, kind, name);

            float coreLength = Math.Min(1.8f, length * .25f), coreDepth = Math.Max(.6f, Math.Min(1f, depth - 1));
            float coreAt = Math.Min(Math.Max(lobbyAt * length - coreLength / 2, Pillar + .6f), length - Pillar - .6f - coreLength);
            var core = Rect(coreAt, (depth - coreDepth) / 2, coreLength, coreDepth, "core");
            var layout = new Layout { AlongX = alongX, Height = height };
            layout.Cores.Add(core);

            // On a modular block the pillars stand on every bay line; otherwise they are spread evenly.
            List<float> along;
            if (bay > 0)
                along = Enumerable.Range(0, (int)Math.Round(length / bay, MidpointRounding.AwayFromZero) + 1)
                    .Select(i => Math.Min(Math.Max(i * bay - Pillar / 2, 0), length - Pillar)).ToList();
            else
            {
                int count = Math.Max(2, (int)Math.Round((length - Pillar) / spacing, MidpointRounding.AwayFromZero) + 1);
                along = Enumerable.Range(0, count).Select(i => i * (length - Pillar) / (count - 1)).ToList();
            }
            var across = depth > 3.2f ? new[] { 0, (depth - Pillar) / 2, depth - Pillar } : new[] { 0, depth - Pillar };
            bool Overlaps(Footprint a, Footprint b) => a.X < b.X + b.W && a.X + a.W > b.X && a.Y < b.Y + b.D && a.Y + a.D > b.Y;
            foreach (var t in along)
                foreach (var u in across)
                {
                    var pillar = Rect(t, u, Pillar, Pillar, "pillar");
                    if (!Overlaps(pillar, core)) layout.Pillars.Add(pillar);
                }
            if (closed.Contains("start")) layout.Walls.Add(Rect(0, 0, Wall, depth, "wall"));
            if (closed.Contains("end")) layout.Walls.Add(Rect(length - Wall, 0, Wall, depth, "wall"));
            if (closed.Contains("back")) layout.Walls.Add(Rect(0, 0, length, Wall, "wall"));
            if (closed.Contains("front")) layout.Walls.Add(Rect(0, depth - Wall, length, Wall, "wall"));
            return layout;
        }
    }
}
