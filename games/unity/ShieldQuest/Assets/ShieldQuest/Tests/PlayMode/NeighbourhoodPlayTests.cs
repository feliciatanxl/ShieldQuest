using System.Collections;
using System.Linq;
using NUnit.Framework;
using ShieldQuest.Core;
using UnityEngine;
using UnityEngine.InputSystem;
using UnityEngine.InputSystem.LowLevel;
using UnityEngine.SceneManagement;
using UnityEngine.TestTools;
using UnityEngine.Tilemaps;

namespace ShieldQuest.Tests
{
    /// <summary>Loads the real scene and drives a virtual keyboard through the Input System.</summary>
    public class NeighbourhoodPlayTests
    {
        Keyboard kb;
        Transform player;

        IEnumerator LoadWorld()
        {
            SceneManager.LoadScene("Neighbourhood");
            yield return null;
            yield return new WaitForFixedUpdate();
            player = Object.FindAnyObjectByType<PlayerController>().transform;
            kb = InputSystem.AddDevice<Keyboard>(); // virtual keyboard; batchmode has no real one
            kb.MakeCurrent();
#if UNITY_EDITOR
            // batchmode has no focused Game View, which the Editor otherwise requires for input
            InputSystem.settings.editorInputBehaviorInPlayMode = InputSettings.EditorInputBehaviorInPlayMode.AllDeviceInputAlwaysGoesToGameView;
#endif
            InputSystem.settings.backgroundBehavior = InputSettings.BackgroundBehavior.IgnoreFocus;
        }

        IEnumerator Hold(float seconds, params Key[] keys)
        {
            InputSystem.QueueStateEvent(kb, new KeyboardState(keys));
            yield return new WaitForSeconds(seconds);
            InputSystem.QueueStateEvent(kb, new KeyboardState());
            yield return new WaitForFixedUpdate();
            yield return null;
        }

        [TearDown]
        public void RemoveKeyboard() { if (kb != null) InputSystem.RemoveDevice(kb); }

        [UnityTest]
        public IEnumerator MapBuildsFromTiled()
        {
            yield return LoadWorld();
            var maps = Object.FindObjectsByType<Tilemap>().ToDictionary(t => t.name);
            Assert.That(maps.Keys, Is.SupersetOf(new[] { "Ground", "Paths", "Buildings", "Decoration" }));
            maps["Ground"].CompressBounds();
            Assert.AreEqual(new Vector3Int(40, 30, 1), maps["Ground"].size, "Ground covers the 40x30 map");
            Assert.AreEqual(26 + 4, GameObject.Find("Collision").transform.childCount, "26 Tiled colliders + 4 map edges");
            Assert.That(Vector2.Distance(player.position, new Vector2(20.5f, 10.5f)), Is.LessThan(0.01f), "player at Tiled spawn");
            Assert.AreEqual(Dir.Up, player.GetComponent<PlayerController>().Facing, "spawn facing property applied");
            Assert.IsNotNull(player.GetComponentInChildren<SpriteRenderer>().sprite, "M01 sprite assigned");
        }

        [UnityTest]
        public IEnumerator WalkRunAndFacing()
        {
            yield return LoadWorld();
            var pc = player.GetComponent<PlayerController>();

            float x0 = player.position.x;
            yield return Hold(1f, Key.D);
            float walked = player.position.x - x0;
            Assert.AreEqual(Dir.Right, pc.Facing);
            Assert.That(walked, Is.EqualTo(WorldMath.WalkSpeed).Within(0.35f), "walk ~2 tiles/s");

            float x1 = player.position.x;
            yield return Hold(1f, Key.D, Key.LeftShift);
            float ran = player.position.x - x1;
            Assert.That(ran / walked, Is.EqualTo(WorldMath.RunSpeed / WorldMath.WalkSpeed).Within(0.25f), "Shift runs faster");

            yield return Hold(0.3f, Key.LeftArrow);
            Assert.AreEqual(Dir.Left, pc.Facing, "arrow keys work");
            Assert.AreEqual(Gait.Idle, pc.Gait, "idle after release");
        }

        [UnityTest]
        public IEnumerator ShelterPostBlocksPlayer()
        {
            yield return LoadWorld();
            // Shelter post at Tiled (640,512,32,32) spans y 13..14 in world units, straight above the spawn.
            yield return Hold(2.5f, Key.W);
            Assert.That(player.position.y, Is.LessThan(13f), "feet collider stops under the post");
            Assert.That(player.position.y, Is.GreaterThan(12f), "player did move up to it");
        }
    }
}

namespace ShieldQuest.Tests
{
    public class WebBridgeTests
    {
        const string Valid = "{\"v\":1,\"sessionId\":\"abc-123\",\"avatar\":{\"characterId\":\"student\"},\"engine\":\"unity\",\"missionId\":\"minimart-clue\",\"checkpoint\":\"start\",\"completedObjectives\":[\"enter-shop\"],\"returnTo\":{\"scene\":\"neighbourhood\",\"x\":1700,\"y\":900,\"facing\":\"up\"}}";

        [Test]
        public void RejectsInvalidHandoffs()
        {
            Assert.IsNull(GameStateManager.Parse("{nope", out var e1)); Assert.AreEqual("not JSON", e1);
            Assert.IsNull(GameStateManager.Parse(Valid.Replace("\"v\":1", "\"v\":2"), out var e2)); Assert.AreEqual("unsupported handoff version 2", e2);
            Assert.IsNull(GameStateManager.Parse(Valid.Replace("minimart-clue", "verify-message"), out var e3)); Assert.AreEqual("unknown missionId", e3);
            Assert.IsNull(GameStateManager.Parse(Valid.Replace("abc-123", "../x"), out var e4)); Assert.AreEqual("invalid sessionId", e4);
        }

        [UnityTest]
        public IEnumerator HandoffRoundTripMatchesSharedContract()
        {
            SceneManager.LoadScene("Neighbourhood");
            yield return null;
            var bridge = GameObject.Find(WebBridgeController.ObjectName);
            Assert.IsNotNull(bridge, "WebBridge exists so React's SendMessage has a target");
            LogAssert.Expect(LogType.Warning, "[WebBridge] rejected handoff: invalid avatar");
            bridge.SendMessage("ReceiveHandoff", Valid.Replace("student", "dragon"));

            bridge.SendMessage("ReceiveHandoff", Valid);
            Assert.AreEqual("minimart-clue", GameStateManager.Current.missionId);
            Assert.AreEqual(1700f, GameStateManager.Current.returnTo.x);

            string sent = null;
            System.Action<string> grab = s => sent = s;
            WebBridgeController.SentToPage += grab;
            WebBridgeController.ExitMission("completed", "ripple");
            WebBridgeController.SentToPage -= grab;
            Assert.AreEqual("{\"v\":1,\"missionId\":\"minimart-clue\",\"status\":\"completed\",\"checkpoint\":\"ripple\",\"completedObjectives\":[\"enter-shop\"]}", sent);
        }
    }
}
