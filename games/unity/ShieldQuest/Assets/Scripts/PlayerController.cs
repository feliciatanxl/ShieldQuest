using UnityEngine;

namespace ShieldQuest
{
    /// Isometric WASD movement with the same speeds and collision test as ExplorationScene.ts.
    public class PlayerController : MonoBehaviour
    {
        public const float WalkSpeed = 3.05f, RunSpeed = 5.25f;
        EstateBuilder estate;
        SpriteRenderer body;
        Camera view;
        string message;

        public Vector2 Position { get; private set; }
        public Hotspot? Nearby { get; private set; }
        public string LastInteraction { get; private set; }

        public void Init(EstateBuilder owner, Sprite sprite, Vector2 spawn)
        {
            estate = owner;
            body = gameObject.AddComponent<SpriteRenderer>();
            body.sprite = sprite;
            transform.localScale = Vector3.one * 1.4f;
            view = Camera.main != null ? Camera.main : new GameObject("Main Camera") { tag = "MainCamera" }.AddComponent<Camera>();
            view.orthographic = true;
            view.orthographicSize = 9;
            view.backgroundColor = new Color32(0x6f, 0x9a, 0x52, 255);
            Teleport(Iso.CanStand(spawn, estate.Size, estate.Collisions) ? spawn : EstateBuilder.Start);
        }

        public void Teleport(Vector2 at)
        {
            Position = at;
            Sync();
        }

        /// Moves along a screen-space direction; each axis is tested separately so the player slides along walls.
        public void Step(Vector2 screenDirection, float dt, bool run = false)
        {
            if (screenDirection == Vector2.zero) return;
            var direction = Iso.ScreenToMap(screenDirection.normalized);
            var delta = direction / (direction.magnitude == 0 ? 1 : direction.magnitude) * (run ? RunSpeed : WalkSpeed) * dt;
            var next = Position + new Vector2(delta.x, 0);
            if (Iso.CanStand(next, estate.Size, estate.Collisions)) Position = next;
            next = Position + new Vector2(0, delta.y);
            if (Iso.CanStand(next, estate.Size, estate.Collisions)) Position = next;
            Sync();
        }

        public bool Interact()
        {
            if (Nearby is not { } spot) return false;
            LastInteraction = spot.Id;
            message = spot.Label + " - interiors are still Phaser-only";
            Debug.Log("[ShieldQuest] " + spot.Id);
            return true;
        }

        void Sync()
        {
            transform.position = Iso.ToWorld(Position.x, Position.y);
            body.sortingOrder = Iso.Sorting(Position.x, Position.y) + 1;
            view.transform.position = transform.position + new Vector3(0, 1, -10);
            Nearby = null;
            foreach (var spot in estate.Hotspots)
                if (Vector2.Distance(spot.At, Position) <= spot.Radius) { Nearby = spot; break; }
        }

        void Update()
        {
            var input = new Vector2(Input.GetAxisRaw("Horizontal"), -Input.GetAxisRaw("Vertical"));
            Step(input, Time.deltaTime, Input.GetKey(KeyCode.LeftShift) || Input.GetKey(KeyCode.RightShift));
            if (Input.GetKeyDown(KeyCode.E)) Interact();
        }

        void OnGUI()
        {
            var text = Nearby is { } spot ? "[E] " + spot.Label : message;
            if (!string.IsNullOrEmpty(text)) GUI.Box(new Rect(Screen.width / 2f - 180, Screen.height - 60, 360, 32), text);
        }
    }
}
