using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Reflection;
using Newtonsoft.Json.Linq;
using ShieldQuest;

class Program
{
    static int checks;
    static void Check(bool condition,string text){if(!condition)throw new Exception(text);checks++;}
    static void Set(string property,JObject value)=>typeof(SharedGame).GetProperty(property).SetValue(null,value);
    static void Main(string[] args)
    {
        var root=args[0];var resources=Path.Combine(root,"games/unity/ShieldQuest/Assets/Resources/PixelLab");
        Set("Definitions",JObject.Parse(File.ReadAllText(Path.Combine(resources,"shared-game.json"))));
        Set("Config",JObject.Parse(File.ReadAllText(Path.Combine(resources,"amk-config.json"))));
        Set("Save",SharedGame.Fresh());var saves=new JArray();
        foreach(string key in NativeAssessments.Order){
            var qs=NativeAssessments.Questions(key);var answers=qs.ToDictionary(q=>(string)q["id"],q=>(string)q["correct"]);
            var result=NativeAssessments.Score(key,answers);Check(result!=null&&(bool)result["passed"],key+" correct answers must pass");
            SharedGame.Save["shield"][key]=result;saves.Add(result.DeepClone());
            var wrong=qs.ToDictionary(q=>(string)q["id"],q=>((JObject)q["options"]).Properties().First(p=>p.Name!=(string)q["correct"]).Name);
            if(key=="E")foreach(string stage in new[]{"immediate","later"}){var links=qs.Where(q=>((string)q["id"]).EndsWith("-"+stage)).ToArray();for(int i=0;i<links.Length;i++)wrong[(string)links[i]["id"]]=(string)links[(i+1)%links.Length]["correct"];}
            var failed=NativeAssessments.Score(key,wrong);Check(failed!=null&&!(bool)failed["passed"],key+" incorrect answers must fail");saves.Add(failed.DeepClone());
            answers.Remove((string)qs[0]["id"]);Check(NativeAssessments.Score(key,answers)==null,key+" incomplete must be rejected");
            answers[(string)qs[0]["id"]]="invalid";Check(NativeAssessments.Score(key,answers)==null,key+" unknown option must be rejected");
        }
        var consequence=NativeAssessments.Questions("E").ToDictionary(q=>(string)q["id"],q=>(string)q["correct"]);
        consequence["decline-immediate"]=consequence["agree-immediate"];Check(NativeAssessments.Score("E",consequence)==null,"E may not reuse an option");
        var state=SharedGame.Fresh();Check(SharedGame.Purchase(state,"park-bench",2),"bench purchase");Check((int)state["coins"]==180&&(int)state["shop"]["park-bench"]==2,"purchase amount");
        string before=state.ToString();foreach(int quantity in new[]{-1,0,21,100})Check(!SharedGame.Purchase(state,"park-bench",quantity),"invalid quantity");Check(before==state.ToString(),"rejected purchase changed save");
        state["coins"]=0;Check(!SharedGame.Purchase(state,"park-bench",1),"insufficient coins");Check(!SharedGame.Purchase(state,"missing-item",1),"unknown item");
        var outfit=SharedGame.Definitions["shop"].First(x=>x["avatar"]!=null);state["coins"]=9999;Check(SharedGame.Purchase(state,(string)outfit["id"],1),"outfit purchase");Check(!SharedGame.Purchase(state,(string)outfit["id"],1),"duplicate outfit");
        Check(!NativeEscape.Safe((string)NativeEscape.Data["safeCode"]),"safe prerequisite");Check(!NativeEscape.Drawer((string)NativeEscape.Data["drawerCode"]),"drawer prerequisite");
        foreach(var id in ((JObject)NativeEscape.Data["housePickups"]).Properties()){Check(NativeEscape.Collect(id.Name),"pickup "+id.Name);Check(!NativeEscape.Collect(id.Name),"duplicate pickup");}
        Check(NativeEscape.Submit("letter",NativeEscape.Sequence("letter")),"letter sequence");Check(!NativeEscape.Submit("cipher",NativeEscape.Sequence("cipher").Reverse()),"wrong cipher");Check(NativeEscape.Submit("cipher",NativeEscape.Sequence("cipher")),"cipher sequence");
        Check(!NativeEscape.Drawer("000"),"wrong drawer code");Check(NativeEscape.Drawer((string)NativeEscape.Data["drawerCode"]),"drawer code");Check(NativeEscape.Submit("timeline",NativeEscape.Sequence("timeline")),"timeline sequence");Check(NativeEscape.Review(),"evidence board");Check(NativeEscape.Safe((string)NativeEscape.Data["safeCode"]),"safe code");Check(NativeEscape.Exit(),"exit key");
        Check(NativeEscape.Progress["completedAt"]!=null,"completion timestamp");
        Check(SharedGame.Validate(SharedGame.Save)!=null,"valid save");var corrupt=(JObject)SharedGame.Save.DeepClone();corrupt["coins"]=-1;Check(SharedGame.Validate(corrupt)==null,"negative coins rejected");
        corrupt=SharedGame.Fresh();corrupt["coins"]=3.5;Check(SharedGame.Validate(corrupt)==null,"fractional coins rejected");
        corrupt=SharedGame.Fresh();corrupt["avatar"]["skin"]=.5;Check(SharedGame.Validate(corrupt)==null,"fractional avatar option rejected");
        corrupt=SharedGame.Fresh();corrupt["position"]["x"]="NaN";Check(SharedGame.Validate(corrupt)==null,"invalid coordinate rejected");
        corrupt=SharedGame.Fresh();corrupt["investigation"]["walked"]=-1;Check(SharedGame.Validate(corrupt)==null,"invalid investigation rejected");
        var legacy=SharedGame.Fresh();legacy["version"]=1;foreach(string added in new[]{"glasses","topStyle","bottomStyle","shoeStyle"})((JObject)legacy["avatar"]).Remove(added);legacy["avatar"]["accessory"]=2;var upgraded=SharedGame.Validate(legacy);Check(upgraded!=null&&(int)upgraded["avatar"]["glasses"]==1&&(int)upgraded["avatar"]["accessory"]==0,"legacy glasses migration");
        var buildingSave=SharedGame.Fresh();buildingSave["scene"]="Building";buildingSave["position"]=SharedGame.Definitions["locations"]["BUILDING_SPAWN"].DeepClone();
        var entry=SharedGame.Definitions["entrances"].First(e=>(string)e["building"]?["name"]=="BBQ Box (AMK Hub)");var visit=(JObject)entry["building"].DeepClone();visit["returnAt"]=entry["at"].DeepClone();buildingSave["building"]=visit;
        var restored=SharedGame.Validate(buildingSave);Check(restored!=null&&(string)restored["scene"]=="Building","native building save");Check(JToken.DeepEquals(restored["building"],visit),"native building return point");
        var payload=new JObject{["assessments"]=saves,["save"]=SharedGame.Save.DeepClone(),["buildingSave"]=buildingSave};File.WriteAllText(args[1],payload.ToString());
        Console.WriteLine($"Passed {checks} native C# checks. Exported results for Phaser validation.");
    }
}
