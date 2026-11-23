using System.Collections;
using System.Linq;
using Newtonsoft.Json.Linq;
using NUnit.Framework;
using UnityEngine;
using UnityEngine.TestTools;
namespace ShieldQuest.Tests
{
    public class EstateTests
    {
        EstateBuilder estate;string backup;
        [OneTimeSetUp]public void PreserveSave(){backup=PlayerPrefs.GetString(SharedGame.SaveKey,"");}
        [OneTimeTearDown]public void RestoreSave(){if(backup=="")PlayerPrefs.DeleteKey(SharedGame.SaveKey);else PlayerPrefs.SetString(SharedGame.SaveKey,backup);PlayerPrefs.Save();}
        [UnitySetUp]public IEnumerator Boot(){
            SharedGame.Load();SharedGame.Import(SharedGame.Fresh().ToString());
            estate=Object.FindAnyObjectByType<EstateBuilder>();if(estate==null)estate=new GameObject("Test estate").AddComponent<EstateBuilder>();else estate.Build();
            estate.GetComponent<UnityInterface>().Open("");yield return null;
        }
        [UnityTearDown]public IEnumerator Clear(){if(estate!=null)Object.Destroy(estate.gameObject);yield return null;}
        [Test]public void BuildsCurrentGeographicMap(){
            Assert.That(estate.Size,Is.EqualTo(new Vector2(167,144)));Assert.That(estate.GroundTiles,Is.EqualTo(167*144));Assert.That(estate.BuildingCount,Is.EqualTo(167));Assert.That(estate.MissingSprites,Is.Empty);
            CollectionAssert.IsSubsetOf(new[]{"enter","house-entrance","house-h-entrance","house-i-entrance","may","amir"},estate.Hotspots.Select(h=>h.Id).ToList());
            Assert.That(estate.CanStand(EstateBuilder.Start),Is.True);
        }
        [Test]public void GeographicPillarsRemainSolid(){var pillars=estate.Collisions.Where(c=>c.Kind=="pillar").ToArray();Assert.That(pillars.Length,Is.GreaterThan(20));foreach(var p in pillars)Assert.That(Iso.CanStand(new Vector2(p.X+p.W/2,p.Y+p.D/2),estate.Size,estate.Collisions),Is.False,p.Name);}
        [Test]public void AllPlayableBuildingsHaveEntrances(){Assert.That(estate.Hotspots.Count(h=>h.Approach!=null),Is.EqualTo(117));Assert.That(estate.Hotspots.Count(h=>h.Building!=null),Is.EqualTo(113));}
        [Test]public void EveryEntranceLoadsItsInteriorAndReturns(){
            foreach(var (id,door) in EstateBuilder.Doors){Assert.That(estate.CanStand(door.at),Is.True,id+" blocked");estate.Player.Teleport(door.at);Assert.That(estate.Player.Nearby?.Id,Is.EqualTo(id));Assert.That(estate.Player.Interact(),Is.True);Assert.That(estate.Area,Is.Not.EqualTo("Neighbourhood"));Assert.That(estate.CanStand(estate.Player.Position),Is.True);Assert.That(estate.MissingSprites,Is.Empty);estate.Travel("Neighbourhood",EstateBuilder.Start);}
        }
        [Test]public void PlayerMovesAndNeverCrossesStaticCollisions(){
            float best=0;foreach(var direction in new[]{Vector2.right,Vector2.left,Vector2.up,Vector2.down}){estate.Player.Teleport(EstateBuilder.Start);for(int i=0;i<40;i++){estate.Player.Step(direction,1/30f,true);Assert.That(estate.CanStand(estate.Player.Position),Is.True);}best=Mathf.Max(best,Vector2.Distance(estate.Player.Position,EstateBuilder.Start));}Assert.That(best,Is.GreaterThan(.3f));
        }
        [Test]public void WardrobeRefreshChangesMapTexture(){var renderer=estate.Player.GetComponent<SpriteRenderer>();var before=renderer.sprite.texture;SharedGame.Save["avatar"]=SharedGame.Definitions["looks"][0]["avatar"].DeepClone();if(SharedGame.LookIndex(SharedGame.Save["avatar"])==SharedGame.LookIndex(SharedGame.Definitions["defaultSave"]["avatar"]))SharedGame.Save["avatar"]=SharedGame.Definitions["looks"][2]["avatar"].DeepClone();estate.Player.RefreshLook();Assert.That(renderer.sprite.texture,Is.Not.SameAs(before));}
        [Test]public void CluesUnlockFirstAssessment(){estate.Travel("Minimart",SharedGame.Point(SharedGame.Definitions["locations"]["SHOP_SPAWN"]));foreach(var clue in ((JObject)SharedGame.Definitions["clues"]).Properties())estate.GetComponent<UnityInterface>().Interact(estate.Hotspots.First(h=>h.Id==clue.Name));Assert.That(NativeAssessments.CanStart("S"),Is.True);Assert.That(((JArray)SharedGame.Save["investigation"]["clues"]).Count,Is.EqualTo(5));}
        [Test]public void SolarLightingUsesSingaporeDayAndNight(){Assert.That(SingaporeEnvironment.NightStrength(new System.DateTime(2026,11,22,4,0,0,System.DateTimeKind.Utc)),Is.LessThan(.05f));Assert.That(SingaporeEnvironment.NightStrength(new System.DateTime(2026,11,22,16,0,0,System.DateTimeKind.Utc)),Is.GreaterThan(.95f));}
    }
}
