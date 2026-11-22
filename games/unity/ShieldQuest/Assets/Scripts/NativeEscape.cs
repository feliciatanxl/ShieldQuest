using System;
using System.Collections.Generic;
using System.Linq;
using Newtonsoft.Json.Linq;

namespace ShieldQuest
{
    // The same prerequisite/reward graph as state/escapeRoom.ts; data comes from missingEvidence.ts.
    public static class NativeEscape
    {
        public static JObject Data => (JObject)SharedGame.Definitions["evidence"];
        public static JObject Progress => (JObject)SharedGame.Save["escapeRoom"];
        static readonly Dictionary<string,string[]> Rewards = new()
        {
            ["letter"]=new[]{"letter"}, ["cipher"]=new[]{"cipher-rubbing"},
            ["timeline"]=new[]{"timeline-reference"}, ["board"]=new[]{"safe-instructions"},
            ["study-safe"]=new[]{"house-key","final-evidence"}
        };
        public static bool Has(string id)=>((JArray)Progress["inventory"]).Any(x=>(string)x==id);
        public static string State(string id)=>(string)Progress["puzzleStates"][id]=="completed"?"completed":Data["puzzles"][id]["required"].All(x=>Has((string)x))?"available":"locked";
        static void Award(params string[] items){foreach(var id in items)if(!Has(id))((JArray)Progress["inventory"]).Add(id);}
        public static bool Collect(string objectId)
        {
            string item=(string)Data["housePickups"][objectId];
            if(item==null||Has(item)||Progress["completedAt"]!=null)return false;
            Award(item);return true;
        }
        static bool Finish(string puzzle){if(State(puzzle)!="available")return false;Progress["puzzleStates"][puzzle]="completed";Award(Rewards[puzzle]);return true;}
        public static string[] Sequence(string id)=>id=="letter"?Data["letterOrder"].Values<string>().ToArray():id=="cipher"?Data["bookOrder"].Values<string>().ToArray():Data["timeline"].Select(x=>(string)x["id"]).ToArray();
        public static bool Submit(string id,IEnumerable<string> sequence)=>Sequence(id).SequenceEqual(sequence)&&Finish(id);
        public static bool Drawer(string code)
        {
            if((bool)Progress["drawerUnlocked"]||State("cipher")!="completed"||code!=(string)Data["drawerCode"])return false;
            Progress["drawerUnlocked"]=true;Award("incident-report","witness-note","partial-reference");return true;
        }
        public static bool Review()=>Finish("board");
        public static bool Safe(string code)=>code==(string)Data["safeCode"]&&Finish("study-safe");
        public static bool Exit()
        {
            if((bool)Progress["exitUnlocked"]||State("study-safe")!="completed"||!Has("house-key"))return false;
            Progress["exitUnlocked"]=true;Progress["completedAt"]=DateTime.UtcNow.ToString("o");return true;
        }
        public static string Hint(string id)
        {
            int count=(int?)Progress["hints"][id]??0;var hints=(JArray)Data["puzzles"][id]["hints"];
            if(Progress["completedAt"]==null&&State(id)!="completed"&&count<hints.Count){count++;Progress["hints"][id]=count;}
            return count>0?(string)hints[Math.Min(count,hints.Count)-1]:"Puzzle completed.";
        }
    }
}
