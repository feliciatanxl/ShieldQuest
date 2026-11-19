using ShieldQuest.Core;
using UnityEngine;

namespace ShieldQuest
{
    /// <summary>Rigidbody2D top-down movement with a small foot collider; Shift runs.</summary>
    [RequireComponent(typeof(Rigidbody2D), typeof(PlayerInputHandler))]
    public class PlayerController : MonoBehaviour
    {
        public Dir Facing { get; private set; } = Dir.Down;
        public Gait Gait { get; private set; } = Gait.Idle;

        Rigidbody2D body;
        PlayerInputHandler input;
        Vector2 velocity;

        void Awake()
        {
            body = GetComponent<Rigidbody2D>();
            input = GetComponent<PlayerInputHandler>();
            body.gravityScale = 0f;
            body.freezeRotation = true;
            body.interpolation = RigidbodyInterpolation2D.Interpolate;
            body.collisionDetectionMode = CollisionDetectionMode2D.Continuous;
        }

        public void SetFacing(Dir d) => Facing = d;

        void Update()
        {
            var (x, y) = WorldMath.Normalise(input.Move.x, input.Move.y);
            bool moving = x != 0f || y != 0f;
            Gait = !moving ? Gait.Idle : input.Run ? Gait.Run : Gait.Walk;
            if (moving) Facing = WorldMath.Facing(x, -y); // core uses screen-down y
            velocity = new Vector2(x, y) * WorldMath.Speed(Gait);
        }

        void FixedUpdate() => body.linearVelocity = velocity;
    }
}
