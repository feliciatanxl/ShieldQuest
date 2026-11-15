import React, { useEffect, useMemo, useRef } from 'react';
import { useFrame, useLoader } from '@react-three/fiber';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

export interface AvatarPose {
  x: number;
  z: number;
  rotY: number;
  /** 0 = standing, 1 = walking */
  walking: number;
  /** Head yaw (radians) to look at another character. */
  look?: number;
  /** 0..1 talking-gesture strength. */
  gesture?: number;
}

/** Rigged CC0 character from Kenney "Blocky Characters" (see public/models/LICENSES.md). */
interface BlockyCharacterProps {
  /** Letter of the Kenney model file, e.g. "o" → character-o.glb */
  model: string;
  timeRef: React.MutableRefObject<number>;
  pose: (t: number) => AvatarPose;
  /** Gesture clip played while pose.gesture is high. */
  gestureClip?: string;
}

/** Feet-to-shoulders height; the head sits on top (~0.5 more). */
const BODY_HEIGHT = 1.0;
const FADE = 0.35;

export const BlockyCharacter: React.FC<BlockyCharacterProps> = ({ model, timeRef, pose, gestureClip = 'interact-right' }) => {
  const gltf = useLoader(GLTFLoader, `${import.meta.env.BASE_URL}models/characters/character-${model}.glb`);
  const root = useRef<THREE.Group>(null);

  // Normalise size and enable shadows once per model.
  const { scene, head, scale } = useMemo(() => {
    const s = gltf.scene;
    s.traverse((o) => {
      if ((o as THREE.Mesh).isMesh) {
        o.castShadow = true;
        const m = (o as THREE.Mesh).material as THREE.MeshStandardMaterial;
        m.roughness = 0.75;
      }
    });
    // Measure the body without the head: hair and hats vary per model, the rig below the neck doesn't,
    // so every character ends up exactly the same size.
    const head = s.getObjectByName('head') ?? null;
    const box = new THREE.Box3();
    // Measure at unit scale: <primitive scale> writes onto this same cached scene, so a re-run
    // (hot reload, remount) would otherwise measure the already-scaled model and compound the size.
    s.scale.set(1, 1, 1);
    s.updateMatrixWorld(true);
    s.traverse((o) => {
      if (!(o as THREE.Mesh).isMesh) return;
      for (let p: THREE.Object3D | null = o; p; p = p.parent) if (p === head) return;
      // Own geometry only: expandByObject would also pull in child parts (the head hangs off the torso).
      const g = (o as THREE.Mesh).geometry;
      g.computeBoundingBox();
      box.union(g.boundingBox!.clone().applyMatrix4(o.matrixWorld));
    });
    return { scene: s, head, scale: BODY_HEIGHT / (box.max.y - box.min.y) };
  }, [gltf]);

  const mixer = useMemo(() => new THREE.AnimationMixer(scene), [scene]);
  const actions = useMemo(() => {
    const get = (name: string) => {
      const clip = THREE.AnimationClip.findByName(gltf.animations, name);
      return clip ? mixer.clipAction(clip) : null;
    };
    return { idle: get('idle'), walk: get('walk'), gesture: get(gestureClip) };
  }, [gltf, mixer, gestureClip]);

  const current = useRef<THREE.AnimationAction | null>(null);
  const lastT = useRef(0);

  useEffect(() => {
    actions.idle?.play();
    current.current = actions.idle;
    return () => {
      mixer.stopAllAction();
      mixer.uncacheRoot(scene);
    };
  }, [actions, mixer, scene]);

  useFrame(() => {
    const t = timeRef.current;
    const p = pose(t);
    if (!root.current) return;
    root.current.position.set(p.x, 0, p.z);
    root.current.rotation.y = p.rotY;

    // Cross-fade between clips as the choreography changes state.
    const want = p.walking > 0.5 ? actions.walk : (p.gesture ?? 0) > 0.4 ? actions.gesture : actions.idle;
    if (want && want !== current.current) {
      want.reset().play();
      if (current.current) want.crossFadeFrom(current.current, FADE, false);
      current.current = want;
    }
    // Drive the mixer from loop time so pause freezes and replay restarts cleanly.
    const dt = t - lastT.current;
    lastT.current = t;
    mixer.update(dt > 0 && dt < 0.2 ? dt : 0);

    // Eye-line: layer the look-at yaw on top of the clip.
    if (head) head.rotation.y = p.look ?? 0;
  });

  return (
    <group ref={root}>
      <primitive object={scene} scale={scale} />
      {/* soft contact shadow */}
      <mesh rotation-x={-Math.PI / 2} position-y={0.012}>
        <circleGeometry args={[0.38, 24]} />
        <meshBasicMaterial color="#020617" transparent opacity={0.4} depthWrite={false} />
      </mesh>
    </group>
  );
};
