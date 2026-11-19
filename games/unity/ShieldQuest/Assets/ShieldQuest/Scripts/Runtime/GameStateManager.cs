using System;
using System.Linq;
using System.Text.RegularExpressions;
using UnityEngine;

namespace ShieldQuest
{
    // C# mirror of packages/shared/src/gameState.ts. Keep field names identical (JsonUtility is name-based).
    [Serializable] public class ReturnLocation { public string scene; public float x, y; public string facing; }
    [Serializable] public class AvatarConfig { public string characterId; }
    [Serializable] public class GameHandoff
    {
        public int v; public string sessionId; public AvatarConfig avatar; public string engine;
        public string missionId; public string checkpoint; public string[] completedObjectives; public ReturnLocation returnTo;
    }
    [Serializable] public class MissionExit
    {
        public int v = GameStateManager.Version; public string missionId; public string status; public string checkpoint; public string[] completedObjectives;
    }

    /// <summary>Presentation-side mission state for the current Unity session. Trusted records stay on the server.</summary>
    public static class GameStateManager
    {
        public const int Version = 1;
        static readonly string[] Missions = { "minimart-clue" };
        static readonly string[] Avatars = { "student", "worker", "poly", "rider", "cafe", "hijab" };
        static readonly Regex Id = new("^[A-Za-z0-9_-]{1,64}$");

        public static GameHandoff Current { get; private set; }
        public static event Action<GameHandoff> HandoffReceived;

        /// <summary>Same rules as parseHandoff in TypeScript. Returns null (and the reason) when invalid.</summary>
        public static GameHandoff Parse(string json, out string error)
        {
            GameHandoff h = null;
            try { h = JsonUtility.FromJson<GameHandoff>(json); } catch (ArgumentException) { }
            error = h == null ? "not JSON"
                : h.v != Version ? $"unsupported handoff version {h.v}"
                : !IsId(h.sessionId) ? "invalid sessionId"
                : h.avatar == null || !Avatars.Contains(h.avatar.characterId) ? "invalid avatar"
                : !Missions.Contains(h.missionId) ? "unknown missionId"
                : !IsId(h.checkpoint) ? "invalid checkpoint"
                : h.completedObjectives == null || h.completedObjectives.Length > 64 || !h.completedObjectives.All(IsId) ? "invalid completedObjectives"
                : h.returnTo == null || h.returnTo.scene != "neighbourhood" ? "invalid returnTo"
                : null;
            return error == null ? h : null;
        }

        public static bool Apply(GameHandoff h)
        {
            if (h == null) return false;
            Current = h;
            HandoffReceived?.Invoke(h);
            return true;
        }

        public static MissionExit BuildExit(string status, string checkpoint = null) => new()
        {
            missionId = Current?.missionId ?? Missions[0],
            status = status,
            checkpoint = checkpoint ?? Current?.checkpoint ?? "start",
            completedObjectives = Current?.completedObjectives ?? Array.Empty<string>(),
        };

        static bool IsId(string s) => s != null && Id.IsMatch(s);
    }
}
