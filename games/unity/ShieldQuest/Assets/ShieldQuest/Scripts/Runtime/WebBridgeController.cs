using System;
using System.Runtime.InteropServices;
using UnityEngine;
using UnityEngine.InputSystem;

namespace ShieldQuest
{
    /// <summary>
    /// The only React <-> Unity channel. React calls SendMessage("WebBridge", "ReceiveHandoff", json);
    /// Unity answers through ShieldQuestBridge.jslib, which dispatches a "shieldquest:unity" DOM event.
    /// </summary>
    public class WebBridgeController : MonoBehaviour
    {
        public const string ObjectName = "WebBridge";
        /// <summary>Raised with every JSON message sent to the page (also used by tests and the Editor).</summary>
        public static event Action<string> SentToPage;

#if UNITY_WEBGL && !UNITY_EDITOR
        [DllImport("__Internal")] static extern void ShieldQuestSendToPage(string json);
#else
        static void ShieldQuestSendToPage(string json) => Debug.Log($"[WebBridge] -> page: {json}");
#endif

        [RuntimeInitializeOnLoadMethod(RuntimeInitializeLoadType.AfterSceneLoad)]
        static void Ensure()
        {
            if (GameObject.Find(ObjectName) != null) return;
            var go = new GameObject(ObjectName, typeof(WebBridgeController));
            DontDestroyOnLoad(go); // SendMessage targets this name, so it must survive scene changes
        }

        /// <summary>Called by React via SendMessage. Invalid payloads are logged and ignored.</summary>
        public void ReceiveHandoff(string json)
        {
            var h = GameStateManager.Parse(json, out var error);
            if (h == null) { Debug.LogWarning($"[WebBridge] rejected handoff: {error}"); return; }
            GameStateManager.Apply(h);
        }

        /// <summary>Ends the mission and returns control to the Phaser neighbourhood.</summary>
        public static void ExitMission(string status, string checkpoint = null)
        {
            var json = JsonUtility.ToJson(GameStateManager.BuildExit(status, checkpoint));
            SentToPage?.Invoke(json);
            ShieldQuestSendToPage(json);
        }

        void Update()
        {
            // shortcut: Esc leaves until the minimart mission has its own exit door.
            if (Keyboard.current != null && Keyboard.current.escapeKey.wasPressedThisFrame && GameStateManager.Current != null)
                ExitMission("exited");
        }
    }
}
