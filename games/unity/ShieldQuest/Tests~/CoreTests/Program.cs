using System;
using System.IO;
using System.Linq;
using System.Text.Json;
using ShieldQuest.Core;

int fails = 0;
void Check(bool ok, string what) { if (!ok) { fails++; Console.WriteLine("FAIL " + what); } }

Check(WorldMath.Facing(1, 1) == Dir.Right, "diagonal prefers horizontal");
Check(WorldMath.Facing(0, -1) == Dir.Up && WorldMath.Facing(0, 1) == Dir.Down && WorldMath.Facing(-1, 0) == Dir.Left, "facing axes");
Check(WorldMath.IdleFrame(Dir.Down) == 0 && WorldMath.IdleFrame(Dir.Right) == 2 && WorldMath.IdleFrame(Dir.Up) == 4 && WorldMath.IdleFrame(Dir.Left) == 6, "idle frames match m01.ts");
var n = WorldMath.Normalise(1, 1);
Check(Math.Abs(MathF.Sqrt(n.x * n.x + n.y * n.y) - 1) < 1e-5, "diagonal normalised");
Check(WorldMath.Normalise(0.2f, 0, 0.25f) == (0f, 0f), "dead zone");
Check(WorldMath.Normalise(0.5f, 0) == (0.5f, 0f), "analog under 1 kept");
Check(WorldMath.RunSpeed > WorldMath.WalkSpeed && WorldMath.Speed(Gait.Idle) == 0, "speeds");
Check(WorldMath.TileIndex(0, 1) == -1 && WorldMath.TileIndex(5, 1) == 4 && WorldMath.TileIndex(0x80000005, 1) == 4, "gid decode");
Check(WorldMath.TiledToWorld(656, 624, 30) == (20.5f, 10.5f), "spawn conversion");
Check(WorldMath.TiledRect(64, 64, 640, 256, 30) == (12f, 24f, 20f, 8f), "rect conversion");

// The real map must parse with the shape the Unity loader expects.
var dir = AppContext.BaseDirectory;
while (!Directory.Exists(Path.Combine(dir, "Assets"))) dir = Path.GetDirectoryName(dir);
var map = JsonDocument.Parse(File.ReadAllText(Path.Combine(dir, "Assets/ShieldQuest/Resources/Maps/singapore-neighbourhood.json"))).RootElement;
Check(map.GetProperty("width").GetInt32() == 40 && map.GetProperty("height").GetInt32() == 30, "map 40x30");
var layers = map.GetProperty("layers").EnumerateArray().ToArray();
foreach (var name in new[] { "Ground", "Paths", "Buildings", "Decoration" })
    Check(layers.Any(l => l.GetProperty("name").GetString() == name && l.GetProperty("data").GetArrayLength() == 1200), "layer " + name);
var objs = layers.First(l => l.GetProperty("name").GetString() == "Gameplay Objects").GetProperty("objects").EnumerateArray().ToArray();
Check(objs.Count(o => o.GetProperty("type").GetString() == "spawn") == 1, "one spawn");
Check(objs.Count(o => o.GetProperty("type").GetString() == "collision") == 26, "26 colliders");

Console.WriteLine(fails == 0 ? "ALL CORE TESTS PASSED" : $"{fails} FAILED");
return fails == 0 ? 0 : 1;
