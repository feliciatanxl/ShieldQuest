using ShieldQuest.Core;
using UnityEngine;

namespace ShieldQuest
{
    /// <summary>
    /// Plays the walk cycle when the character has a Walk sheet (run = same frames, faster).
    /// Characters with only idle rotations face the right way and bob — no fake walk cycle.
    /// </summary>
    [RequireComponent(typeof(SpriteRenderer))]
    public class PlayerAnimationController : MonoBehaviour
    {
        public string characterId = "student";

        SpriteRenderer sr;
        PlayerController player;
        CharacterSprites sprites;
        float clock;
        Gait lastGait;
        Transform visual;

        void Awake()
        {
            sr = GetComponent<SpriteRenderer>();
            player = GetComponentInParent<PlayerController>();
            visual = transform;
            sprites = CharacterSprites.Load(characterId);
        }

        void LateUpdate()
        {
            if (sprites == null || player == null) return;
            var gait = player.Gait;
            if (gait != lastGait) { clock = 0f; lastGait = gait; }
            clock += Time.deltaTime;

            float bob = 0f;
            if (gait != Gait.Idle && sprites.HasWalk)
            {
                var row = sprites.Walk[WorldMath.WalkRow(player.Facing)];
                float fps = gait == Gait.Run ? WorldMath.RunFps : WorldMath.WalkFps;
                sr.sprite = row[(int)(clock * fps) % row.Length];
            }
            else
            {
                sr.sprite = sprites.IdleFor(player.Facing);
                float period = gait == Gait.Run ? WorldMath.BobPeriod * 0.65f : WorldMath.BobPeriod;
                if (gait != Gait.Idle) bob = Mathf.Abs(Mathf.Sin(clock / period)) * 2f / WorldMath.CharPixelsPerUnit;
            }
            visual.localPosition = new Vector3(0f, bob, 0f);
            sr.sortingOrder = -(int)(player.transform.position.y * 100); // lower on screen draws in front
        }
    }
}
