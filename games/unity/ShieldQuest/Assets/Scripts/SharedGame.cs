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
            try{return ValidateParsed(raw);}catch{return null;}
        }
        static JObject ValidateParsed(JObject raw)
        {
            if (raw == null || (int?)raw["version"] is not (1 or 2 or 3)) return null;
            var data = Fresh(); foreach (var p in raw.Properties()) data[p.Name] = p.Value.DeepClone();
            if (data["avatar"] is not JObject avatar) return null;
            bool legacyGlasses=avatar["glasses"]==null&&(int?)avatar["accessory"]==2;
            foreach(string key in new[]{"topStyle","bottomStyle","shoeStyle","glasses"})avatar[key]??=0;
            if(legacyGlasses){avatar["glasses"]=1;avatar["accessory"]=0;}
            foreach (var p in ((JObject)Definitions["categories"]).Properties())
                if (avatar[p.Name]?.Type!=JTokenType.Integer || (int?)avatar[p.Name] is not int v || v < 0 || v >= ((JArray)p.Value["options"]).Count) return null;
            if (data["coins"]?.Type!=JTokenType.Integer || (int?)data["coins"] is not int coins || coins < 0) return null;
            double walked=(double)data["walked"];if(double.IsNaN(walked)||double.IsInfinity(walked)||walked<0||walked>3||data["reducedMotion"]?.Type!=JTokenType.Boolean)return null;
            if(!new[]{"active","done","skipped"}.Contains((string)data["tutorial"]))return null;
            if((int)raw["version"]==1){data["scene"]="Neighbourhood";data["investigation"]=Definitions["defaultSave"]["investigation"].DeepClone();}
            var scene = (string)data["scene"];
            if (scene != "Neighbourhood" && Definitions["interiors"]?[scene] == null) scene = "Neighbourhood";
            data["scene"] = scene;
            if ((string)data["mapRevision"] != (string)Config["revision"] && scene == "Neighbourhood") data["position"] = Config["start"].DeepClone();
            data["mapRevision"] = Config["revision"].DeepClone(); data["version"] = 3;
            if(data["position"] is not JObject position||position["x"]?.Type is not (JTokenType.Integer or JTokenType.Float)||position["y"]?.Type is not (JTokenType.Integer or JTokenType.Float))return null;
            double x=(double)position["x"],y=(double)position["y"];if(double.IsNaN(x)||double.IsNaN(y)||double.IsInfinity(x)||double.IsInfinity(y))return null;
            if(data["investigation"] is not JObject investigation||investigation["clues"] is not JArray clues||investigation["entered"]?.Type!=JTokenType.Boolean||investigation["spokeToJun"]?.Type!=JTokenType.Boolean)return null;
            double explored=(double)investigation["walked"];if(double.IsNaN(explored)||double.IsInfinity(explored)||explored<0||explored>1.5||clues.Any(c=>c.Type!=JTokenType.String||Definitions["clues"][(string)c]==null)||clues.Values<string>().Distinct().Count()!=clues.Count)return null;
            if(investigation["choice"]?.Type!=JTokenType.Null&&Definitions["choices"][(string)investigation["choice"]]==null)return null;
            if(data["profile"] is not JObject)data["profile"]=Fresh()["profile"].DeepClone();
            string bio=(string)data["profile"]["bio"]??"";data["profile"]["bio"]=bio.Substring(0,Math.Min(160,bio.Length));
            var clean = new JObject();
            foreach (var item in (JArray)Definitions["shop"])
            {
                int count = (int?)data["shop"]?[(string)item["id"]] ?? 0;
                if (count > 0 && count <= 999) clean[(string)item["id"]] = item["avatar"] != null ? 1 : count;
            }
            data["shop"] = clean;
            var shield=new JObject();if((int)raw["version"]==3&&data["shield"] is JObject stored)foreach(var key in NativeAssessments.Order){var result=stored[key];if(result is JObject&&(string)result["competency"]==key&&(string)result["status"]=="completed"&&result["passed"]?.Type==JTokenType.Boolean&&result["numberCorrect"]?.Type==JTokenType.Integer&&DateTimeOffset.TryParse((string)result["submittedAt"],out _))shield[key]=result.DeepClone();}data["shield"]=shield;
            var collected=data["collectedGuardians"] as JArray??new JArray();data["collectedGuardians"]=new JArray(Definitions["guardians"].Where(g=>shield[(string)g["competency"]]!=null&&collected.Any(id=>(string)id==(string)g["id"])).Select(g=>g["id"]));
            if(data["escapeRoom"] is not JObject escape||escape["inventory"] is not JArray||escape["puzzleStates"] is not JObject||escape["hints"] is not JObject||escape["drawerUnlocked"]?.Type!=JTokenType.Boolean||escape["exitUnlocked"]?.Type!=JTokenType.Boolean||escape["elapsedMs"]?.Type!=JTokenType.Integer||((long?)escape["elapsedMs"]??-1)<0)data["escapeRoom"]=Definitions["defaultSave"]["escapeRoom"].DeepClone();
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
