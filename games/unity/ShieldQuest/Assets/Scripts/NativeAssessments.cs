using System;
using System.Collections.Generic;
using System.Linq;
using Newtonsoft.Json.Linq;
namespace ShieldQuest
{
    public static class NativeAssessments
    {
        public static readonly string[] Order={"S","H","I","E","L","D"};
        public static bool CanStart(string key)
        {
            int index=Array.IndexOf(Order,key);return index==0?((JArray)SharedGame.Save["investigation"]["clues"]).Count==5:index>0&&SharedGame.Save["shield"][Order[index-1]]!=null;
        }
        public static List<JObject> Questions(string key)
        {
            var spec=SharedGame.Definitions["assessments"][key];var questions=new List<JObject>();
            if(key=="E")foreach(var d in spec["decisions"])foreach(var stage in new[]{"immediate","later"})questions.Add(new JObject{["id"]=$"{d["id"]}-{stage}",["question"]=$"{d["text"]}\n{stage} consequence",["options"]=spec[stage].DeepClone(),["correct"]=spec["key"][(string)d["id"]][stage].DeepClone()});
            else foreach(var item in spec["items"])
            {
                var q=(JObject)item.DeepClone();q["question"]??=q["statement"]??q["title"];
                if(key=="S"){q["options"]=spec["options"].DeepClone();q["correct"]=q["correctResponse"].DeepClone();}
                if(key=="L"||key=="D"){q["options"]=JObject.FromObject((q["fragments"]??q["options"]).ToDictionary(o=>(string)o["id"],o=>(string)o["text"]));q["correct"]=spec["key"].First(k=>(string)k["itemId"]==(string)q["id"])["answer"].DeepClone();}
                questions.Add(q);
            }
            return questions;
        }
        public static JObject Score(string key,Dictionary<string,string> answers)
        {
            var qs=Questions(key);if(qs.Any(q=>!answers.ContainsKey((string)q["id"])||q["options"]?[answers[(string)q["id"]]]==null))return null;
            var responses=new JArray(qs.Select(q=>new JObject{["itemId"]=q["id"],["answer"]=answers[(string)q["id"]]}));
            var correct=new JArray(qs.Select(q=>new JObject{["itemId"]=q["id"],["answer"]=q["correct"]}));
            int count=qs.Count(q=>answers[(string)q["id"]]==(string)q["correct"]);
            var ids=new[]{"spot-the-risk-v1","hold-before-acting-v1","identify-the-influence-v1","evaluate-consequences-v2","lead-the-right-choice-v1","defend-your-community-v1"};
            var result=new JObject{["competency"]=key,["assessmentId"]=ids[Array.IndexOf(Order,key)],["status"]="completed",["submittedAt"]=DateTime.UtcNow.ToString("o"),["itemIds"]=new JArray(qs.Select(q=>q["id"])),["responses"]=responses,["correctResponses"]=correct,["numberCorrect"]=count,["passed"]=count==qs.Count};
            if(key=="S"){int facts=qs.Count(q=>(string)q["correct"]=="verified"&&answers[(string)q["id"]]=="verified"),falseAlarms=qs.Count(q=>(string)q["correct"]!="verified"&&answers[(string)q["id"]]=="verified");result["factualCorrect"]=facts;result["falseAlarms"]=falseAlarms;result["passed"]=facts>=4&&falseAlarms<=1;}
            if(key=="I")result["partCorrect"]=JObject.FromObject(qs.ToDictionary(q=>(string)q["id"],q=>answers[(string)q["id"]]==(string)q["correct"]));
            if(key=="L"||key=="D"){result["assessmentVersion"]=1;result["minimumCorrect"]=3;result["criterionCorrect"]=JObject.FromObject(qs.ToDictionary(q=>(string)q["id"],q=>answers[(string)q["id"]]==(string)q["correct"]));}
            if(key=="E"){
                var spec=SharedGame.Definitions["assessments"][key];var chains=new JArray();
                foreach(var stage in new[]{"immediate","later"})if(spec["decisions"].Select(d=>answers[$"{d["id"]}-{stage}"]).Distinct().Count()!=3)return null;
                foreach(var d in spec["decisions"]){string id=(string)d["id"],immediate=answers[id+"-immediate"],later=answers[id+"-later"];bool a=immediate==(string)spec["key"][id]["immediate"],b=later==(string)spec["key"][id]["later"];chains.Add(new JObject{["decisionId"]=id,["immediate"]=immediate,["later"]=later,["linkCorrect"]=new JObject{["immediate"]=a,["later"]=b},["correct"]=a&&b});}
                result.Remove("itemIds");result.Remove("responses");result.Remove("correctResponses");result["chains"]=chains;result["decisionIds"]=new JArray(spec["decisions"].Select(d=>d["id"]));result["assessmentVersion"]=2;result["minimumCorrectChains"]=2;result["correctChains"]=chains.Count(c=>(bool)c["correct"]);result["passed"]=(int)result["correctChains"]>=2;
            }
            return result;
        }
    }
}
