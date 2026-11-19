using UnityEngine;
using UnityEngine.InputSystem;

namespace ShieldQuest
{
    /// <summary>
    /// WASD/arrows + Shift, plus touch: drag on the left half is a floating joystick,
    /// a touch on the right half holds Run. Mirrors PlayerInput in m01.ts.
    /// shortcut: no on-screen joystick graphics yet; add a uGUI overlay before mobile playtests.
    /// </summary>
    public class PlayerInputHandler : MonoBehaviour
    {
        const float JoyRadiusPx = 90f, DeadZone = 0.25f;

        /// <summary>Raw move, y up. Keyboard wins over touch.</summary>
        public Vector2 Move { get; private set; }
        public bool Run { get; private set; }
        public bool InteractPressed { get; private set; }

        int joyId = -1;
        Vector2 joyOrigin;

        void Update()
        {
            var k = Keyboard.current;
            Vector2 move = Vector2.zero;
            bool run = false, interact = false;
            if (k != null)
            {
                move.x = (k.dKey.isPressed || k.rightArrowKey.isPressed ? 1 : 0) - (k.aKey.isPressed || k.leftArrowKey.isPressed ? 1 : 0);
                move.y = (k.wKey.isPressed || k.upArrowKey.isPressed ? 1 : 0) - (k.sKey.isPressed || k.downArrowKey.isPressed ? 1 : 0);
                run = k.leftShiftKey.isPressed || k.rightShiftKey.isPressed;
                interact = k.eKey.wasPressedThisFrame;
            }

            var ts = Touchscreen.current;
            if (ts != null)
            {
                Vector2 joy = Vector2.zero;
                bool joyAlive = false;
                foreach (var t in ts.touches)
                {
                    if (!t.isInProgress) continue;
                    int id = t.touchId.ReadValue();
                    Vector2 pos = t.position.ReadValue();
                    if (id == joyId) { joyAlive = true; joy = Vector2.ClampMagnitude(pos - joyOrigin, JoyRadiusPx) / JoyRadiusPx; }
                    else if (joyId < 0 && pos.x < Screen.width / 2f && t.press.wasPressedThisFrame) { joyId = id; joyOrigin = pos; joyAlive = true; }
                    else if (pos.x >= Screen.width / 2f) run = true;
                }
                if (!joyAlive) joyId = -1;
                if (move == Vector2.zero && joy.magnitude > DeadZone) move = joy;
            }

            Move = move;
            Run = run;
            InteractPressed = interact;
        }
    }
}
