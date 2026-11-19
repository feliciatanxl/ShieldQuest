using UnityEngine;

namespace ShieldQuest
{
    /// <summary>Smooth orthographic follow, clamped to the map so the void never shows.</summary>
    [RequireComponent(typeof(Camera))]
    public class CameraFollowController : MonoBehaviour
    {
        public Transform target;
        public Rect bounds;               // world units
        public float smoothTime = 0.12f;
        public float viewTilesTall = 11f; // ~ Phaser's view of the 2x map

        Camera cam;
        Vector3 vel;

        void Awake()
        {
            cam = GetComponent<Camera>();
            cam.orthographic = true;
        }

        void LateUpdate()
        {
            if (target == null) return;
            cam.orthographicSize = Mathf.Min(viewTilesTall / 2f, bounds.height / 2f);
            float halfH = cam.orthographicSize, halfW = halfH * cam.aspect;
            Vector3 goal = target.position;
            goal.x = bounds.width > halfW * 2 ? Mathf.Clamp(goal.x, bounds.xMin + halfW, bounds.xMax - halfW) : bounds.center.x;
            goal.y = Mathf.Clamp(goal.y, bounds.yMin + halfH, bounds.yMax - halfH);
            goal.z = -10f;
            transform.position = Vector3.SmoothDamp(transform.position, goal, ref vel, smoothTime);
        }

        public void SnapToTarget()
        {
            if (target == null) return;
            vel = Vector3.zero;
            transform.position = new Vector3(target.position.x, target.position.y, -10f);
            LateUpdate();
            transform.position = new Vector3(transform.position.x, transform.position.y, -10f);
        }
    }
}
