using System.Collections.Generic;
using System.Linq;
using Newtonsoft.Json.Linq;
using UnityEngine;
namespace ShieldQuest
{
    public class EstateTraffic:MonoBehaviour
    {
        class Route { public JArray Path; public SpriteRenderer Sprite; public float Distance,Total,Wait; public bool Bus,Active; public Vector2 At; public string Heading; public readonly List<float> Stops=new();public readonly HashSet<float> Served=new(); }
        EstateBuilder estate;readonly List<Route> routes=new();readonly Dictionary<string,Sprite> buses=new();
        public void Init(EstateBuilder owner)
        {
            estate=owner;
            foreach(string heading in new[]{"east","west","south","north"}){var t=Resources.Load<Texture2D>("PixelLab/generated/buses/"+heading);buses[heading]=Sprite.Create(t,new Rect(0,0,t.width,t.height),new Vector2(.5f,1-70/120f),32);}
            int busIndex=0;
            foreach(var p in owner.Props.Where(p=>(string)p["kind"]=="walker"||(string)p["kind"]=="busroute")){
                if(p["path"] is not JArray path||path.Count<2)continue;bool bus=(string)p["kind"]=="busroute";
                var r=new Route{Path=path,Bus=bus,Wait=bus?1.5f+busIndex++*6:0,Sprite=owner.SpriteObject(bus?"Bus":"Walker",bus?"objects/bus-shelter":"objects/npc-office",Vector3.zero,bus?1:.42f,1)};
                for(int i=1;i<path.Count;i++)r.Total+=Vector2.Distance(SharedGame.Point(path[i-1]),SharedGame.Point(path[i]));
                if(bus)foreach(var stop in owner.Props.Where(x=>(string)x["kind"]=="bus")){
                    Vector2 center=new((float)stop["x"]+(float)stop["w"]/2,(float)stop["y"]+(float)stop["d"]/2);float along=0;
                    for(int i=1;i<path.Count;i++){var a=SharedGame.Point(path[i-1]);var b=SharedGame.Point(path[i]);var d=b-a;float length=d.magnitude,t=Vector2.Dot(center-a,d)/Mathf.Max(.001f,d.sqrMagnitude);if(t>0&&t<1&&Vector2.Distance(a+d*t,center)<1.8f){r.Stops.Add(along+t*length-.5f);break;}along+=length;}
                }
                r.At=SharedGame.Point(path[0]);r.Sprite.transform.position=Iso.ToWorld(r.At.x,r.At.y);r.Sprite.enabled=!bus;routes.Add(r);
            }
        }
        (Vector2,string) At(Route r,float distance){float rest=distance;for(int i=1;i<r.Path.Count;i++){var a=SharedGame.Point(r.Path[i-1]);var b=SharedGame.Point(r.Path[i]);var d=b-a;float length=d.magnitude;if(rest<=length||i==r.Path.Count-1)return(Vector2.Lerp(a,b,rest/Mathf.Max(.001f,length)),Mathf.Abs(d.x)>Mathf.Abs(d.y)?d.x>0?"east":"west":d.y>0?"south":"north");rest-=length;}return(r.At,"east");}
        public bool Blocks(Vector2 point,Vector2 from)
        {
            if(!enabled)return false;
            bool Hit(Vector2 p)=>routes.Any(r=>r.Bus&&r.Active&&Mathf.Abs(p.x-r.At.x)<(r.Heading=="east"||r.Heading=="west"?1.75f:.57f)&&Mathf.Abs(p.y-r.At.y)<(r.Heading=="east"||r.Heading=="west"?.57f:1.75f));return Hit(point)&&!Hit(from);
        }
        void Update()
        {
            if(estate.Area!="Neighbourhood")return;bool still=(bool)SharedGame.Save["reducedMotion"];
            foreach(var r in routes){if(r.Sprite==null)continue;if(still){r.Active=false;r.Sprite.enabled=!r.Bus;continue;}r.Wait-=Time.deltaTime;if(r.Bus&&r.Distance==0&&r.Wait>0){r.Active=false;r.Sprite.enabled=false;continue;}r.Active=true;
                if(r.Wait<=0){float next=r.Distance+Time.deltaTime*(r.Bus?3.4f:1.15f);bool blocked=Vector2.Distance(At(r,r.Distance+(r.Bus?2.5f:.5f)).Item1,estate.Player.Position)<(r.Bus?1:.7f);
                    if(!blocked){float? stop=r.Stops.Where(s=>!r.Served.Contains(s)&&r.Distance<s&&next>=s).Select(s=>(float?)s).FirstOrDefault();r.Distance=stop??next;if(stop.HasValue){r.Served.Add(stop.Value);r.Wait=3.2f;}}
                }
                if(r.Bus&&r.Distance>=r.Total){r.Distance=0;r.Wait=Random.Range(9,17);r.Served.Clear();r.Active=false;r.Sprite.enabled=false;continue;}
                float along=r.Bus?r.Distance:r.Distance%(r.Total*2);bool back=!r.Bus&&along>r.Total;if(back)along=r.Total*2-along;(r.At,r.Heading)=At(r,along);if(r.Bus)r.Sprite.sprite=buses[r.Heading];else r.Sprite.flipX=back;
                r.Sprite.enabled=true;r.Sprite.transform.position=Iso.ToWorld(r.At.x,r.At.y);r.Sprite.sortingOrder=Iso.Sorting(r.At.x+(r.Bus?1.6f:0),r.At.y+(r.Bus?.42f:0));
            }
        }
        void OnDestroy(){foreach(var s in buses.Values)if(s!=null)Destroy(s);}
    }
}
