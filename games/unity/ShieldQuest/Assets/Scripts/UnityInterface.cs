using System;
using System.Collections.Generic;
using System.Linq;
using Newtonsoft.Json.Linq;
using UnityEngine;
namespace ShieldQuest
{
    /// Native IMGUI counterpart of the shared Friends/Guardians modal language.
    public class UnityInterface:MonoBehaviour
    {
        EstateBuilder estate;string panel="",message="",selected="park-bench",tab="Front page",search="",quantity="1",bio="",playerName="",assessment="";bool editBio,retryAssessment; string inspectId="",puzzleId="",code=""; readonly List<string> sequence=new();
        Vector2 scroll;Rect window;GUIStyle label,title,card,button,small,heading;Texture2D cream,navy,paper,teal;bool styled;
        readonly Dictionary<string,string> answers=new();
        public bool Blocked=>panel!="";
        public string Panel=>panel;
        public void Init(EstateBuilder owner){estate=owner;}
        public void Open(string value){panel=value;scroll=Vector2.zero;message="";editBio=false;bio=(string)SharedGame.Save["profile"]?["bio"]??"";playerName=(string)SharedGame.Save["name"]??"Player";}
        Texture2D ColorTexture(Color color){var t=new Texture2D(1,1);t.SetPixel(0,0,color);t.Apply();return t;}
        void Style()
        {
            if(styled)return;styled=true;cream=ColorTexture(new Color32(255,247,232,255));navy=ColorTexture(new Color32(37,54,75,255));paper=ColorTexture(new Color32(248,236,211,255));teal=ColorTexture(new Color32(41,156,145,255));
            var font=Resources.Load<Font>("PixelLab/fonts/Body");var pixel=Resources.Load<Font>("PixelLab/fonts/Pixel");
            label=new GUIStyle(GUI.skin.label){font=font,fontSize=14,wordWrap=true,normal={textColor=new Color32(38,54,75,255)}};
            small=new GUIStyle(label){fontSize=11};heading=new GUIStyle(label){fontSize=17,fontStyle=FontStyle.Bold};title=new GUIStyle(label){font=pixel,fontSize=13,padding=new RectOffset(5,5,5,5)};
            card=new GUIStyle(GUI.skin.box){normal={background=cream,textColor=label.normal.textColor},padding=new RectOffset(16,16,13,13)};
            button=new GUIStyle(GUI.skin.button){font=font,fontSize=13,wordWrap=true,padding=new RectOffset(10,10,8,8),normal={background=paper,textColor=label.normal.textColor},hover={background=teal,textColor=Color.white},active={background=teal,textColor=Color.white}};
            GUI.skin.font=font;GUI.skin.label=label;GUI.skin.textField.font=font;GUI.skin.textArea.font=font;
        }
        bool Click(string text)=>GUILayout.Button(text,button,GUILayout.MinHeight(40));
        void Text(string text)=>GUILayout.Label(text??"",label);
        void Note(string text)=>GUILayout.Label(text??"",small);
        void OnGUI()
        {
            if(!SharedGame.Ready||estate?.Player==null)return;Style();float scale=Mathf.Clamp(Screen.width/1100f,.7f,1.3f);GUI.matrix=Matrix4x4.Scale(Vector3.one*scale);float w=Screen.width/scale,h=Screen.height/scale;
            var save=SharedGame.Save;var climate=estate.GetComponent<SingaporeEnvironment>();
            GUI.enabled=panel=="";
            GUI.DrawTexture(new Rect(12,12,220,68),navy);GUI.color=Color.white;
            if(GUI.Button(new Rect(12,12,220,68),$"{save["name"]}\nLEVEL 01  ·  {Mathf.RoundToInt((float)save["walked"]/3*20)}/100 XP",button))Open("User profile");
            if(GUI.Button(new Rect(w/2-140,12,95,44),$"◉ {save["coins"]}",button))Open("Sunshine Shop");
            if(GUI.Button(new Rect(w/2-41,12,95,44),"Wardrobe",button))Open("Wardrobe");if(GUI.Button(new Rect(w/2+58,12,75,44),"Pack",button))Open("Your pack");
            GUI.Box(new Rect(w-280,12,268,55),$"{climate.SingaporeNow:h:mm tt} SGT  ·  {climate.SingaporeNow:ddd}\n{climate.WeatherLine}",card);
            if(GUI.Button(new Rect(w-280,73,84,35),"Settings",button))Open("Settings");if(GUI.Button(new Rect(w-190,73,84,35),"Area map",button))Open("Area map");if(GUI.Button(new Rect(w-100,73,88,35),"Menu",button))Open("Menu");
            if(estate.Player.Nearby is {} spot&&panel==""&&GUI.Button(new Rect(w/2-185,h-62,370,42),"E · "+spot.Label,button))estate.Player.Interact();
            GUI.enabled=true;
            if(Event.current.type==EventType.KeyDown&&Event.current.keyCode==KeyCode.Escape){panel="";estate.Player.TouchDirection=Vector2.zero;Event.current.Use();}
            if(panel!=""){
                estate.Player.TouchDirection=Vector2.zero;var previous=GUI.color;GUI.color=new Color(.08f,.15f,.23f,.78f);GUI.DrawTexture(new Rect(0,0,w,h),Texture2D.whiteTexture);GUI.color=previous;
                float width=Mathf.Min(panel=="Sunshine Shop"?880:panel=="Area map"?700:680,w-32),height=Mathf.Min(720,h-36);window=new Rect((w-width)/2,(h-height)/2,width,height);GUI.Box(window,GUIContent.none,card);
                GUILayout.BeginArea(new Rect(window.x+16,window.y+12,width-32,height-24));GUILayout.BeginHorizontal();GUILayout.Label("SUNSHINE ESTATE",small);GUILayout.FlexibleSpace();if(GUILayout.Button("×",button,GUILayout.Width(36)))panel="";GUILayout.EndHorizontal();GUILayout.Label(panel,title);GUILayout.Space(8);scroll=GUILayout.BeginScrollView(scroll);
                switch(panel){case "House object":HouseInspect();break;case "House puzzle":HousePuzzle();break;case "User profile":Profile();break;case "Sunshine Shop":Shop();break;case "Wardrobe":Wardrobe();break;case "Friends":Friends();break;case "Guardians":Guardians();break;case "Area map":AreaMap(width-65);break;case "Settings":Settings();break;case "Your pack":case "Evidence board":Evidence();break;case "Missions":Missions();break;case "Assessment":Assessment();break;case "Menu":Menu();break;case "Jun":Jun();break;default:Text(message);break;}
                GUILayout.EndScrollView();if(message!="")GUILayout.Label(message,small);GUILayout.EndArea();
            }
            if(panel==""&&(Application.isMobilePlatform||Input.touchSupported)){
                Vector2 direction=Vector2.zero;if(GUI.RepeatButton(new Rect(30,h-170,50,45),"↑",button))direction+=Vector2.up*-1;if(GUI.RepeatButton(new Rect(30,h-70,50,45),"↓",button))direction+=Vector2.up;if(GUI.RepeatButton(new Rect(0,h-120,50,45),"←",button))direction+=Vector2.left;if(GUI.RepeatButton(new Rect(60,h-120,50,45),"→",button))direction+=Vector2.right;estate.Player.TouchDirection=direction;
            }
        }
        void Profile()
        {
            GUILayout.BeginHorizontal();DrawAvatar(SharedGame.Save["avatar"],100);GUILayout.BeginVertical();GUILayout.Label((string)SharedGame.Save["name"]+"  ·  LEVEL 01",heading);Text((string)SharedGame.Save["profile"]?["bio"]);if(Click(editBio?"Cancel edit":"Edit bio"))editBio=!editBio;GUILayout.EndVertical();GUILayout.EndHorizontal();
            if(editBio){bio=GUILayout.TextArea(bio,160);if(Click("Save bio")){SharedGame.Save["profile"]["bio"]=bio.Trim();SharedGame.Persist();editBio=false;}}
            Text("Location: Sunshine Estate");Text("Last login: "+(string)SharedGame.Save["profile"]?["lastLoginAt"]);
            string code=PlayerPrefs.GetString("shieldquest.friendCode","");if(code==""){code=Guid.NewGuid().ToString("N").Substring(0,8).ToUpperInvariant();PlayerPrefs.SetString("shieldquest.friendCode",code);}GUILayout.BeginHorizontal();Text("Friend code: "+code);if(Click("Copy"))GUIUtility.systemCopyBuffer=code;GUILayout.EndHorizontal();
            GUILayout.Space(12);GUILayout.Label("Your SHIELD journey",heading);Text(((JObject)SharedGame.Save["shield"]).Count+" of 6 completed");Text($"Coins: {SharedGame.Save["coins"]} · Guardians: {((JArray)SharedGame.Save["collectedGuardians"]).Count}");
            if(Click("View friends"))Open("Friends");if(Click("Guardian collection"))Open("Guardians");if(Click("Area map"))Open("Area map");
        }
        void DrawAvatar(JToken avatar,float size)
        {
            var t=Resources.Load<Texture2D>($"PixelLab/generated/avatars/{SharedGame.LookIndex(avatar)}");var rect=GUILayoutUtility.GetRect(size,size*1.25f,GUILayout.Width(size));GUI.DrawTextureWithTexCoords(rect,t,new Rect(0,7/8f,1/13f,1/8f));
        }
        void Wardrobe()
        {
            Text("Choose an everyday look.");playerName=GUILayout.TextField(playerName,24);
            GUILayout.BeginHorizontal();int n=0;foreach(var look in SharedGame.Definitions["looks"]){if(n>0&&n%3==0){GUILayout.EndHorizontal();GUILayout.BeginHorizontal();}GUILayout.BeginVertical(card);DrawAvatar(look["avatar"],75);if(Click((string)look["name"])){SharedGame.Save["avatar"]=look["avatar"].DeepClone();if(!string.IsNullOrWhiteSpace(playerName))SharedGame.Save["name"]=playerName.Trim();estate.Player.RefreshLook();SharedGame.Persist();message="Look saved and updated on the map.";}GUILayout.EndVertical();n++;}GUILayout.EndHorizontal();
        }
        void Shop()
        {
            GUILayout.BeginHorizontal();foreach(var t in new[]{"Front page","Furniture","Clothing","Your collection"})if(Click(t)){tab=t;search="";}GUILayout.EndHorizontal();Text("Balance: "+SharedGame.Save["coins"]+" coins");
            if(tab=="Front page"){GUILayout.Label("Make yourself at home.",heading);Text("Discover furniture and curated outfits for your collection.");if(Click("Browse furniture"))tab="Furniture";if(Click("Shop clothing"))tab="Clothing";return;}
            search=GUILayout.TextField(search);var catalog=(JArray)SharedGame.Definitions["shop"];var items=catalog.Where(i=>(tab=="Your collection"?(int?)SharedGame.Save["shop"]?[(string)i["id"]]>0:tab=="Clothing"?i["avatar"]!=null:i["avatar"]==null)&&((string)i["name"]).IndexOf(search,StringComparison.OrdinalIgnoreCase)>=0).ToList();
            if(items.Count==0){Text("No items found in this collection.");return;}if(!items.Any(x=>(string)x["id"]==selected))selected=(string)items[0]["id"];
            GUILayout.BeginHorizontal();GUILayout.BeginVertical(GUILayout.Width(Mathf.Min(320,window.width*.4f)));foreach(var item in items)if(Click($"{item["name"]} · {item["price"]} coins"))selected=(string)item["id"];GUILayout.EndVertical();GUILayout.BeginVertical(card);var chosen=catalog.First(i=>(string)i["id"]==selected);if(chosen["avatar"]!=null)DrawAvatar(chosen["avatar"],100);else{var t=Resources.Load<Texture2D>("PixelLab/objects/"+chosen["asset"]);GUILayout.Label(t,GUILayout.Height(130));}GUILayout.Label((string)chosen["name"],heading);Text((string)chosen["description"]);int owned=(int?)SharedGame.Save["shop"]?[selected]??0;Text("Owned: "+owned);
            if(chosen["avatar"]!=null&&owned>0){if(Click("Wear this look")){SharedGame.Save["avatar"]=chosen["avatar"].DeepClone();estate.Player.RefreshLook();SharedGame.Persist();message="Outfit equipped.";}}
            else{GUILayout.Label("Quantity",small);quantity=GUILayout.TextField(quantity,2);if(Click("Buy with coins")){int.TryParse(quantity,out var q);message=SharedGame.Buy(selected,q)?"Added to your collection.":"Purchase unavailable. Check balance and quantity.";}}
            GUILayout.EndVertical();GUILayout.EndHorizontal();
        }
        void Friends()
        {
            Note("Local friend list. Starter entries are estate neighbours, not live network presence.");foreach(var person in new[]{"Jun","Amir","Auntie May"})GUILayout.Box(person+" · Estate neighbour",card);Text("Add friend code");search=GUILayout.TextField(search,8);if(Click("Add friend")){if(search.Length!=8){message="Enter an 8-character code.";return;}var list=JArray.Parse(PlayerPrefs.GetString("shieldquest.friends","[]"));if(!list.Any(f=>(string)f["code"]==search.ToUpperInvariant()))list.Add(new JObject{["name"]="Friend "+search.ToUpperInvariant(),["code"]=search.ToUpperInvariant()});PlayerPrefs.SetString("shieldquest.friends",list.ToString());search="";}foreach(var f in JArray.Parse(PlayerPrefs.GetString("shieldquest.friends","[]")))Text((string)f["name"]);
        }
        void Guardians()
        {
            Text(((JArray)SharedGame.Save["collectedGuardians"]).Count+" of 6 collected");foreach(var g in SharedGame.Definitions["guardians"]){GUILayout.BeginHorizontal(card);GUILayout.Label(Resources.Load<Texture2D>("PixelLab/generated/guardians/"+g["id"]),GUILayout.Width(64),GUILayout.Height(64));GUILayout.BeginVertical();GUILayout.Label((string)g["name"],heading);Text((string)g["challenge"]);bool unlocked=SharedGame.Save["shield"][(string)g["competency"]]!=null,owned=((JArray)SharedGame.Save["collectedGuardians"]).Any(x=>(string)x==(string)g["id"]);if(unlocked&&!owned){if(Click("Collect")){((JArray)SharedGame.Save["collectedGuardians"]).Add((string)g["id"]);SharedGame.Persist();}}else Note(owned?"Collected":"Locked");GUILayout.EndVertical();GUILayout.EndHorizontal();}
        }
        void Settings()
        {
            bool motion=GUILayout.Toggle((bool)SharedGame.Save["reducedMotion"],"Reduced motion");if(motion!=(bool)SharedGame.Save["reducedMotion"]){SharedGame.Save["reducedMotion"]=motion;SharedGame.Persist();}Text("WASD / arrows: move · Shift: run · E: interact · mouse wheel: zoom");Note("Singapore time; live NEA / data.gov.sg temperature and Ang Mo Kio forecast.");if(Click("Export save JSON"))message=SharedGame.Export();Text("Import save JSON (paste a version-3 Phaser/Unity save):");search=GUILayout.TextArea(search,GUILayout.Height(80));if(Click("Import save")){message=SharedGame.Import(search);estate.Build();}
        }
        void Menu(){foreach(var target in new[]{"Missions","Friends","Guardians","Wardrobe","Your pack","Area map","Settings","User profile","Sunshine Shop"})if(Click(target))Open(target);if(estate.Area!="Neighbourhood"&&Click("Return to Sunshine Estate")){estate.Travel("Neighbourhood",EstateBuilder.Start);panel="";}if(Click("Save checkpoint")){SharedGame.Persist();message="Checkpoint saved.";}if(Click("Resume"))panel="";}
        void Evidence()
        {
            if(estate.Area=="House"||((JArray)NativeEscape.Progress["inventory"]).Count>0){GUILayout.Label("House evidence & documents",heading);foreach(var item in NativeEscape.Progress["inventory"]){var info=NativeEscape.Data["items"][(string)item];GUILayout.BeginVertical(card);GUILayout.Label((string)info["name"],heading);Text((string)info["description"]);GUILayout.EndVertical();}}
            foreach(var clue in ((JObject)SharedGame.Definitions["clues"]).Properties()){bool found=((JArray)SharedGame.Save["investigation"]["clues"]).Any(c=>(string)c==clue.Name);GUILayout.BeginVertical(card);GUILayout.Label(found?(string)clue.Value["title"]:"Undiscovered clue",heading);if(found){Text("Verified: "+clue.Value["observed"]);Text("Unknown: "+clue.Value["unknown"]);Text("Assumption: "+clue.Value["assumption"]);}GUILayout.EndVertical();}if(Click("SHIELD challenges"))Open("Missions");
        }
        void Missions()
        {
            Text("Explore Sunshine Estate, visit the Minimart at Block 702 and inspect all five clues.");foreach(var key in NativeAssessments.Order){bool ready=NativeAssessments.CanStart(key);GUI.enabled=ready;var result=SharedGame.Save["shield"][key];if(Click(key+" · "+SharedGame.Definitions["assessments"][key]["title"]+(result!=null?" · Completed":""))){assessment=key;answers.Clear();retryAssessment=false;Open("Assessment");}GUI.enabled=true;}
        }
        void Assessment()
        {
            GUILayout.Label((string)SharedGame.Definitions["assessments"][assessment]["title"],heading);var existing=SharedGame.Save["shield"][assessment];
            if(existing!=null&&!retryAssessment){Text("Completed · "+existing["numberCorrect"]+" correct · "+((bool)existing["passed"]?"Passed":"Keep practising"));if(Click("Try again")){retryAssessment=true;answers.Clear();}return;}
            foreach(var q in NativeAssessments.Questions(assessment)){GUILayout.BeginVertical(card);Text((string)q["question"]);foreach(var option in ((JObject)q["options"]).Properties()){string text=option.Value.Type==JTokenType.Object?(string)option.Value["text"]:option.Value.ToString();bool active=answers.TryGetValue((string)q["id"],out var answer)&&answer==option.Name;if(Click((active?"✓ ":"")+text))answers[(string)q["id"]]=option.Name;}GUILayout.EndVertical();}
            if(Click("Submit answers")){var result=NativeAssessments.Score(assessment,answers);if(result==null){message="Answer every question. In Evaluate Consequences each option is used once per stage.";return;}SharedGame.Save["shield"][assessment]=result;retryAssessment=false;SharedGame.Persist();message="Result saved.";}
        }
        void Jun(){Text("Jun asks you to watch the shop entrance. How do you respond?");foreach(var choice in ((JObject)SharedGame.Definitions["choices"]).Properties())if(Click((string)choice.Value["label"])){SharedGame.Save["investigation"]["spokeToJun"]=true;SharedGame.Save["investigation"]["choice"]=choice.Name;SharedGame.Persist();message=(string)choice.Value["consequence"];}if(Click("SHIELD challenges"))Open("Missions");}
        public void Interact(Hotspot spot)
        {
            string id=spot.Id;
            if(spot.Building!=null){var visit=(JObject)spot.Building.DeepClone();visit["returnAt"]=SharedGame.Point(estate.Player.Position);SharedGame.Save["building"]=visit;estate.Travel("Building",SharedGame.Point(SharedGame.Definitions["locations"]["BUILDING_SPAWN"]));panel="";return;}
            if(id=="building-exit"){estate.Travel("Neighbourhood",SharedGame.Point(SharedGame.Save["building"]?["returnAt"]));panel="";return;}
            if(estate.Area=="House"&&SharedGame.Definitions["houseObjects"].Any(x=>(string)x["id"]==id)){inspectId=id;code="";sequence.Clear();Open("House object");return;}var loc=SharedGame.Definitions["locations"];
            var enter=new Dictionary<string,(string,string)>{{"enter",("Minimart","SHOP_SPAWN")},{"house-entrance",("House","HOUSE_SPAWN")},{"house-h-entrance",("HouseH","HOUSE_H_SPAWN")},{"house-i-entrance",("HouseI","HOUSE_I_SPAWN")},{"freeze-station",("FreezeFrame","FREEZE_FRAME_SPAWN")}};
            if(enter.TryGetValue(id,out var room)){estate.Travel(room.Item1,SharedGame.Point(loc[room.Item2]));panel="";return;}
            if(id.StartsWith("exit")||id=="house-exit"){if(id=="exit-freeze-frame")estate.Travel("HouseH",SharedGame.Point(loc["HOUSE_H_SPAWN"]));else{string key=estate.Area=="House"?"house-entrance":estate.Area=="HouseH"?"house-h-entrance":estate.Area=="HouseI"?"house-i-entrance":"enter";estate.Travel("Neighbourhood",EstateBuilder.Doors[key].at);}panel="";return;}
            if(SharedGame.Definitions["clues"][id]!=null){var clues=(JArray)SharedGame.Save["investigation"]["clues"];if(!clues.Any(c=>(string)c==id))clues.Add(id);SharedGame.Persist();Open("Evidence board");return;}
            if(id=="jun"||id=="ff-jun"){Open("Jun");return;}
            if(id.StartsWith("whisper")||id.StartsWith("ff-")){Open("Missions");message="Explore the SHIELD challenges at this station.";return;}
            Open(spot.Label);message=id=="may"?"Find the SHIELD entrance at Block 702. Sunshine Minimart is waiting.":id=="amir"?"Explore the town centre and look out for your neighbours.":"Inspect the surroundings, collect facts and avoid jumping to conclusions.";
        }
        void HouseInspect()
        {
            var item=SharedGame.Definitions["houseObjects"].First(x=>(string)x["id"]==inspectId);
            GUILayout.Label((string)item["name"],heading);Text((string)item["description"]);
            if(item["pickup"]!=null&&Click((string)item["pickup"]["label"])){message=NativeEscape.Collect(inspectId)?"Added to your inventory.":"Already collected.";SharedGame.Persist();}
            if(inspectId=="house-drawer"){code=GUILayout.TextField(code,3);if(Click("Unlock drawer")){message=NativeEscape.Drawer(code)?"Drawer opened. Three case documents collected.":"The drawer stays locked. Check your bookshelf findings.";SharedGame.Persist();}}
            if(inspectId=="house-front-door"&&Click("Use exit key")){message=NativeEscape.Exit()?"Case complete. Well done!":"Find the final evidence file and exit key first.";SharedGame.Persist();}
            if(item["puzzleId"]!=null&&Click("Open puzzle")){puzzleId=(string)item["puzzleId"];sequence.Clear();code="";Open("House puzzle");}
            if(Click("Read inventory & documents"))Open("Your pack");
        }
        void HousePuzzle()
        {
            var spec=NativeEscape.Data["puzzles"][puzzleId];GUILayout.Label((string)spec["title"],heading);string state=NativeEscape.State(puzzleId);Text(state=="locked"?"Find the required evidence first.":state=="completed"?"Puzzle completed.":"Review the evidence and make your selection.");
            if(state=="available"){
                if(puzzleId=="letter"||puzzleId=="cipher"||puzzleId=="timeline"){
                    var ids=NativeEscape.Sequence(puzzleId);foreach(var id in ids.OrderBy(x=>x)){
                        string text=puzzleId=="letter"?(string)NativeEscape.Data["items"][id]["description"]:puzzleId=="cipher"?NativeEscape.Data["books"].First(x=>(string)x["id"]==id)["label"].ToString():NativeEscape.Data["timeline"].First(x=>(string)x["id"]==id)["label"].ToString();
                        GUI.enabled=!sequence.Contains(id);if(Click(text))sequence.Add(id);GUI.enabled=true;
                    }
                    Text("Selected: "+string.Join(" → ",sequence));if(Click("Clear selection"))sequence.Clear();if(Click("Check sequence")){message=NativeEscape.Submit(puzzleId,sequence)?"Correct. Reward added to your inventory.":"Check the order against the source documents.";SharedGame.Persist();}
                }else if(puzzleId=="board"){foreach(var c in NativeEscape.Data["evidenceCards"])Text(NativeEscape.Data["evidenceBins"][(string)c["bin"]]+": "+c["text"]);if(Click("Finish evidence review")){NativeEscape.Review();SharedGame.Persist();message="Safe code worksheet collected.";}}
                else{foreach(var digit in NativeEscape.Data["safeDigits"])Text((string)digit["clue"]);code=GUILayout.TextField(code,4);if(Click("Open safe")){message=NativeEscape.Safe(code)?"Final evidence file and exit key collected.":"Check each source for its digit.";SharedGame.Persist();}}
            }
            if(Click("Reveal next hint")){message=NativeEscape.Hint(puzzleId);SharedGame.Persist();}if(Click("Read inventory & documents"))Open("Your pack");
        }
        void AreaMap(float width)
        {
            float height=Mathf.Min(420,width*.86f);var rect=GUILayoutUtility.GetRect(width,height);GUI.DrawTexture(rect,paper);
            if(estate.Area!="Neighbourhood"){Note("Interior map · use the marked exit to return to the estate.");return;}
            Vector2 Point(JToken p)=>new(rect.x+(float)p["x"]/estate.Size.x*rect.width,rect.y+(float)p["y"]/estate.Size.y*rect.height);
            foreach(var p in estate.Props){if(p["polygon"] is JArray poly)for(int i=0;i<poly.Count;i++)Line(Point(poly[i]),Point(poly[(i+1)%poly.Count]),new Color(.42f,.58f,.45f),1);if(p["path"] is JArray route&&(string)p["kind"]=="geoRoad")for(int i=1;i<route.Count;i++)Line(Point(route[i-1]),Point(route[i]),new Color(.4f,.46f,.44f),2);}
            var at=Point(SharedGame.Point(estate.Player.Position));GUI.DrawTexture(new Rect(at.x-4,at.y-4,8,8),teal);Note("You · Sunshine Estate · north ↑");
        }
        void Line(Vector2 a,Vector2 b,Color c,float thickness){var matrix=GUI.matrix;var color=GUI.color;GUI.color=c;GUIUtility.RotateAroundPivot(Mathf.Atan2(b.y-a.y,b.x-a.x)*Mathf.Rad2Deg,a);GUI.DrawTexture(new Rect(a.x,a.y,Vector2.Distance(a,b),thickness),Texture2D.whiteTexture);GUI.matrix=matrix;GUI.color=color;}
        void OnDestroy(){foreach(var texture in new[]{cream,navy,paper,teal})if(texture!=null)Destroy(texture);}
    }
}
