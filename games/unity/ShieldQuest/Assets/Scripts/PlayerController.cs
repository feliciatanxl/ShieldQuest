using System;
using System.Linq;
using UnityEngine;

namespace ShieldQuest
{
    public class PlayerController : MonoBehaviour
    {
        public const float WalkSpeed = 3.05f, RunSpeed = 5.25f;
        EstateBuilder estate; SpriteRenderer body; Camera view; Texture2D atlas; Sprite[,] frames; int facing, frame; float walked, checkpoint;
        public Vector2 Position { get; private set; }
        public Hotspot? Nearby { get; private set; }
        public string LastInteraction { get; private set; }
        public Vector2 TouchDirection;
        public void Init(EstateBuilder owner)
        {
            estate = owner; body = gameObject.AddComponent<SpriteRenderer>();
            view = Camera.main != null ? Camera.main : new GameObject("Main Camera") { tag = "MainCamera" }.AddComponent<Camera>();
            view.orthographic = true; view.orthographicSize=11; view.backgroundColor = new Color32(38,59,72,255); RefreshLook();
        }
        public void RefreshLook()
        {
            atlas = Resources.Load<Texture2D>($"PixelLab/generated/avatars/{SharedGame.LookIndex(SharedGame.Save["avatar"])}");
            if (frames != null) foreach (var sprite in frames) if (sprite != null) Destroy(sprite);
            frames = new Sprite[8,13];
            for(int r=0;r<8;r++) for(int c=0;c<13;c++) frames[r,c]=Sprite.Create(atlas,new Rect(c*80,atlas.height-(r+1)*80,80,80),new Vector2(.5f,.1f),32);
            body.sprite=frames[facing,0]; transform.localScale=Vector3.one*(estate.Area=="Neighbourhood"?.42f:1f);
        }
        public void Teleport(Vector2 at) { Position=at; Sync(); }
        public void ResetView(){view.orthographicSize=estate.Area=="Neighbourhood"?11:7;view.transform.position=transform.position+new Vector3(0,1.2f,-10);}
        public void Step(Vector2 screenDirection,float dt,bool run=false)
        {
            if(screenDirection==Vector2.zero){frame=0;if(frames!=null)body.sprite=frames[facing,0];return;}
            var direction=Iso.ScreenToMap(screenDirection.normalized).normalized;
            var delta=direction*(run?RunSpeed:WalkSpeed)*Mathf.Min(dt,.05f);var previous=Position;
            var next=Position+new Vector2(delta.x,0);if(estate.CanStand(next))Position=next;
            next=Position+new Vector2(0,delta.y);if(estate.CanStand(next))Position=next;
            float distance=Vector2.Distance(previous,Position);walked+=distance;
            if(estate.Area=="Neighbourhood")SharedGame.Save["walked"]=Mathf.Min(3,(float)SharedGame.Save["walked"]+distance);
            if(estate.Area=="Minimart")SharedGame.Save["investigation"]["walked"]=Mathf.Min(1.5f,(float)SharedGame.Save["investigation"]["walked"]+distance);
            int sector=(Mathf.RoundToInt(Mathf.Atan2(screenDirection.y,screenDirection.x)/(Mathf.PI/4))+8)%8;
            facing=new[]{3,5,0,4,2,6,1,7}[sector];frame=distance<.0001f?0:(run?7:1)+Mathf.FloorToInt(walked*(run?4.5f:7))%6;body.sprite=frames[facing,frame];Sync();
        }
        public bool Interact()
        {
            if(Nearby is not {} spot)return false;LastInteraction=spot.Id;estate.GetComponent<UnityInterface>().Interact(spot);return true;
        }
        void Sync()
        {
            transform.position=Iso.ToWorld(Position.x,Position.y);body.sortingOrder=Iso.Sorting(Position.x,Position.y)+1;
            Nearby=null;float nearest=float.MaxValue;foreach(var h in estate.Hotspots){float gap=Vector2.Distance(h.At,Position);if(gap<=h.Radius&&gap<nearest){Nearby=h;nearest=gap;}}
            SharedGame.Save["position"]=SharedGame.Point(Position);
        }
        void LateUpdate()
        {
            var ui=estate.GetComponent<UnityInterface>();
            if(estate.Area=="House"){
                SharedGame.Save["escapeRoom"]["position"]=SharedGame.Point(Position);
                if(SharedGame.Save["escapeRoom"]["completedAt"]==null)SharedGame.Save["escapeRoom"]["elapsedMs"]=(long)SharedGame.Save["escapeRoom"]["elapsedMs"]+(long)Math.Round(Time.deltaTime*1000);
            }
            if(!ui.Blocked){var input=TouchDirection!=Vector2.zero?TouchDirection:new Vector2(Input.GetAxisRaw("Horizontal"),-Input.GetAxisRaw("Vertical"));Step(input,Time.deltaTime,Input.GetKey(KeyCode.LeftShift)||Input.GetKey(KeyCode.RightShift));if(Input.GetKeyDown(KeyCode.E))Interact();}
            if(Input.mouseScrollDelta.y!=0&&!ui.Blocked)view.orthographicSize=Mathf.Clamp(view.orthographicSize-Input.mouseScrollDelta.y,4,24);
            float targetSize=estate.Area=="Neighbourhood"?11:7;if(view.orthographicSize<.1f||view.orthographicSize>100)view.orthographicSize=targetSize;
            var target=transform.position+new Vector3(0,1.2f,-10);view.transform.position=Vector3.Lerp(view.transform.position,target,(bool)SharedGame.Save["reducedMotion"]?1:1-Mathf.Exp(-10*Time.deltaTime));
            bool covered=false;
            var feet=Iso.ProjectPx(Position.x,Position.y);foreach(var b in estate.Buildings){bool hidden=Iso.Sorting(Position.x,Position.y)<b.day.sortingOrder&&b.silhouettes.Any(p=>EstateBuilder.Inside(feet,p)||EstateBuilder.Inside(feet-new Vector2(0,12),p));if(hidden)covered=true;var c=b.day.color;c.a=hidden?.65f:1;b.day.color=c;}
            body.sortingOrder=covered?30000:Iso.Sorting(Position.x,Position.y)+1;body.color=new Color(1,1,1,covered?.65f:1);
            checkpoint+=Time.deltaTime;if(checkpoint>=5){SharedGame.Persist();checkpoint=0;}
        }
        void OnApplicationPause(bool pause){if(pause)SharedGame.Persist();}
        void OnApplicationQuit()=>SharedGame.Persist();
    }
}
