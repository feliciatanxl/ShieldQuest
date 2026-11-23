using System;
using System.Collections;
using System.Linq;
using Newtonsoft.Json.Linq;
using UnityEngine;
using UnityEngine.Networking;

namespace ShieldQuest
{
    public class SingaporeEnvironment:MonoBehaviour
    {
        EstateBuilder estate;bool started;float elapsed;
        public string Temperature="—°C",Forecast="Loading…",Station="",Observation="";
        DateTime observedAt,validUntil;
        public DateTime SingaporeNow=>DateTime.UtcNow.AddHours(8);
        public float Darkness {get;private set;}
        public void Init(EstateBuilder owner){estate=owner;if(!started){started=true;StartCoroutine(WeatherLoop());}}
        public static float NightStrength(DateTime utc)
        {
            utc=utc.ToUniversalTime();double hour=utc.TimeOfDay.TotalHours,g=2*Math.PI/365*(utc.DayOfYear-1+(hour-12)/24),r=Math.PI/180;
            double eq=229.18*(.000075+.001868*Math.Cos(g)-.032077*Math.Sin(g)-.014615*Math.Cos(2*g)-.040849*Math.Sin(2*g));
            double dec=.006918-.399912*Math.Cos(g)+.070257*Math.Sin(g)-.006758*Math.Cos(2*g)+.000907*Math.Sin(2*g)-.002697*Math.Cos(3*g)+.00148*Math.Sin(3*g);
            double angle=((hour*60+eq+4*103.8475)%1440/4-180)*r;
            double elevation=Math.Asin(Math.Sin(1.3704*r)*Math.Sin(dec)+Math.Cos(1.3704*r)*Math.Cos(dec)*Math.Cos(angle))/r;
            float t=Mathf.Clamp01((float)((3-elevation)/9));return t*t*(3-2*t);
        }
        public string WeatherLine=>(observedAt!=default&&DateTime.UtcNow-observedAt>TimeSpan.FromMinutes(30)?Temperature+" · DELAYED":Temperature)+" · "+(validUntil>DateTime.UtcNow?Forecast:"Unavailable");
        IEnumerator WeatherLoop(){while(true){yield return Request("air-temperature",true);yield return Request("two-hr-forecast",false);yield return new WaitForSecondsRealtime(300);}}
        IEnumerator Request(string endpoint,bool temperature)
        {
            using var request=UnityWebRequest.Get("https://api-open.data.gov.sg/v2/real-time/api/"+endpoint);request.timeout=10;yield return request.SendWebRequest();
            if(request.result!=UnityWebRequest.Result.Success){if(validUntil<=DateTime.UtcNow)Forecast="Unavailable";yield break;}
            try{
                var json=JObject.Parse(request.downloadHandler.text);if((int?)json["code"]!=0)yield break;var data=json["data"];
                if(temperature){var reading=data["readings"].OrderByDescending(x=>DateTimeOffset.Parse((string)x["timestamp"])).FirstOrDefault();if(reading==null)yield break;var stations=data["stations"].OrderBy(x=>Math.Pow((double)x["location"]["latitude"]-1.3704,2)+Math.Pow((double)x["location"]["longitude"]-103.8475,2));foreach(var station in stations){var value=reading["data"].FirstOrDefault(x=>(string)x["stationId"]==(string)station["id"]&&(double?)x["value"]>=15&&(double?)x["value"]<=45);if(value==null)continue;Temperature=((double)value["value"]).ToString("0.0",System.Globalization.CultureInfo.InvariantCulture)+"°C";Station=(string)station["name"];observedAt=DateTimeOffset.Parse((string)reading["timestamp"]).UtcDateTime;Observation=observedAt.AddHours(8).ToString("h:mm tt");break;}}
                else {var item=data["items"].FirstOrDefault(x=>DateTimeOffset.Parse((string)x["valid_period"]["start"]).UtcDateTime<=DateTime.UtcNow&&DateTimeOffset.Parse((string)x["valid_period"]["end"]).UtcDateTime>DateTime.UtcNow);if(item!=null){Forecast=(string)item["forecasts"].FirstOrDefault(x=>(string)x["area"]=="Ang Mo Kio")?["forecast"]??"Unavailable";validUntil=DateTimeOffset.Parse((string)item["valid_period"]["end"]).UtcDateTime;}}
            }catch(Exception e){Debug.LogWarning("Weather unavailable: "+e.Message);}
        }
        void Update()
        {
            elapsed+=Time.deltaTime;if(elapsed<.5f||estate==null)return;elapsed=0;Darkness=estate.Area=="Neighbourhood"?NightStrength(DateTime.UtcNow):0;
            Color tint=Color.Lerp(Color.white,new Color(.56f,.61f,.73f),Darkness);
            foreach(var b in estate.Buildings){float a=b.day.color.a;b.day.color=new Color(tint.r,tint.g,tint.b,a);b.light.color=new Color(1,.96f,.85f,Darkness*a);}
            foreach(var s in estate.Scenery)if(s!=null)s.color=tint;
            if(estate.GroundMaterial!=null)estate.GroundMaterial.color=tint;
            foreach(var r in estate.GetComponentsInChildren<MeshRenderer>())if(r.sharedMaterial!=null&&r.sharedMaterial.shader.name=="Sprites/Default")r.sharedMaterial.color=tint;
        }
    }
}
