using UnityEngine;

namespace ShieldQuest
{
    static class Bootstrap
    {
        // Any scene (including an empty one) boots into Sunshine Estate unless it already has one.
        [RuntimeInitializeOnLoadMethod(RuntimeInitializeLoadType.AfterSceneLoad)]
        static void Boot()
        {
            if (Object.FindFirstObjectByType<EstateBuilder>() == null) new GameObject("Sunshine Estate").AddComponent<EstateBuilder>();
        }
    }
}
