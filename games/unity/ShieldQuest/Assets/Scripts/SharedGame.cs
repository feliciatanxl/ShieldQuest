using System;
using System.IO;
using System.Linq;
using Newtonsoft.Json.Linq;
using UnityEngine;

namespace ShieldQuest
{
    /// Native save adapter for the Phaser version-3 JSON contract. Browser and PlayerPrefs stores are separate.
    public static class SharedGame
    {
        public static JObject Definitions { get; private set; }
        public static JObject Config { get; private set; }
        public static JObject Save { get; private set; }
        public const string SaveKey = "shieldquest.phase1";
        public static string ExportPath => Path.Combine(Application.persistentDataPath, "shieldquest-save.json");
        public static bool Ready => Definitions != null;
        public static void Load()
        {
            if (Ready) return;
            Definitions = JObject.Parse(Resources.Load<TextAsset>("PixelLab/shared-game").text);
            Config = JObject.Parse(Resources.Load<TextAsset>("PixelLab/amk-config").text);
            try { Save = Validate(JObject.Parse(PlayerPrefs.GetString(SaveKey))); } catch { Save = Fresh(); }
            if (Save == null) Save = Fresh();
            if (Save["profile"] is not JObject) Save["profile"] = new JObject { ["bio"] = "Making good choices, one neighbourhood at a time." };
            Save["profile"]["lastLoginAt"] = DateTime.UtcNow.ToString("o");
        }
        public static JObject Fresh()
        {
            var data = (JObject)Definitions["defaultSave"].DeepClone();
            data["profile"] = new JObject { ["bio"] = "Making good choices, one neighbourhood at a time.", ["createdAt"] = DateTime.UtcNow.ToString("o"), ["lastLoginAt"] = DateTime.UtcNow.ToString("o") };
            return data;
        }
        public static JObject Validate(JObject raw)
        {
            if (raw == null || (int?)raw["version"] is not (1 or 2 or 3)) return null;
            var data = Fresh(); foreach (var p in raw.Properties()) data[p.Name] = p.Value.DeepClone();
            if (data["avatar"] is not JObject avatar) return null;
            foreach (var p in ((JObject)Definitions["categories"]).Properties())
                if ((int?)avatar[p.Name] is not int v || v < 0 || v >= ((JArray)p.Value["options"]).Count) return null;
            if ((int?)data["coins"] is not int coins || coins < 0) return null;
            var scene = (string)data["scene"];
            if (scene != "Neighbourhood" && Definitions["interiors"]?[scene] == null) scene = "Neighbourhood";
            data["scene"] = scene;
            if ((string)data["mapRevision"] != (string)Config["revision"] && scene == "Neighbourhood") data["position"] = Config["start"].DeepClone();
            data["mapRevision"] = Config["revision"].DeepClone(); data["version"] = 3;
            var clean = new JObject();
            foreach (var item in (JArray)Definitions["shop"])
            {
                int count = (int?)data["shop"]?[(string)item["id"]] ?? 0;
                if (count > 0 && count <= 999) clean[(string)item["id"]] = item["avatar"] != null ? 1 : count;
            }
            data["shop"] = clean;
            if (data["shield"] is not JObject) data["shield"] = new JObject();
            if (data["collectedGuardians"] is not JArray) data["collectedGuardians"] = new JArray();
            return data;
        }
        public static void Persist()
        {
            if (Save == null) return;
            PlayerPrefs.SetString(SaveKey, Save.ToString(Newtonsoft.Json.Formatting.None)); PlayerPrefs.Save();
        }
        public static string Import(string json)
        {
            try { var candidate = Validate(JObject.Parse(json)); if (candidate == null) return "Invalid save. Current progress kept."; Save = candidate; Persist(); return "Save imported."; }
            catch { return "Invalid JSON. Current progress kept."; }
        }
        public static string Export()
        {
            File.WriteAllText(ExportPath, Save.ToString()); return ExportPath;
        }
        public static bool Buy(string id, int quantity)
        {
            if(!Purchase(Save,id,quantity))return false;Persist();return true;
        }
        public static bool Purchase(JObject state, string id, int quantity)
        {
            var item = ((JArray)Definitions["shop"]).FirstOrDefault(i => (string)i["id"] == id);
            int coins = (int)state["coins"], owned = (int?)state["shop"]?[id] ?? 0;
            if (item == null || quantity < 1 || quantity > 20 || (item["avatar"] != null && (quantity != 1 || owned > 0))) return false;
            int cost = (int)item["price"] * quantity;
            if (coins < cost || owned + quantity > 999) return false;
            state["shop"] ??= new JObject(); state["shop"][id] = owned + quantity; state["coins"] = coins - cost; return true;
        }
        public static Vector2 Point(JToken p) => new((float?)p?["x"] ?? 0, (float?)p?["y"] ?? 0);
        public static JObject Point(Vector2 p) => new() { ["x"] = p.x, ["y"] = p.y };
        public static bool SameAvatar(JToken a, JToken b) => ((JObject)Definitions["categories"]).Properties().All(p => (int?)a?[p.Name] == (int?)b?[p.Name]);
        public static int LookIndex(JToken avatar)
        {
            var looks = (JArray)Definitions["looks"];
            for (int i = 0; i < looks.Count; i++) if (SameAvatar(looks[i]["avatar"], avatar)) return i;
            // Preserve custom fields on import; a matching body-style starter is the visual fallback.
            for (int i = 0; i < looks.Count; i++) if ((int?)looks[i]["avatar"]["style"] == (int?)avatar?["style"]) return i;
            return 0;
        }
    }
}
