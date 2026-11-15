import React, { useEffect, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export interface AvatarPose {
  x: number;
  z: number;
  rotY: number;
  /** 0 = standing, 1 = full walk cycle */
  walking: number;
}

interface PlayerAvatarProps {
  timeRef: React.MutableRefObject<number>;
  pose: (t: number) => AvatarPose;
  hoodie: string;
  pants: string;
  hair: string;
  skin?: string;
  backpack?: string;
  /** Phase offset so background characters don't move in lockstep. */
  offset?: number;
}

const flat = (color: string) => new THREE.MeshStandardMaterial({ color, roughness: 0.8, flatShading: true });

/** Stylised low-poly articulated character: hoodie, backpack, swinging limbs. */
export const PlayerAvatar: React.FC<PlayerAvatarProps> = ({
  timeRef,
  pose,
  hoodie,
  pants,
  hair,
  skin = '#E8B48A',
  backpack,
  offset = 0,
}) => {
  const root = useRef<THREE.Group>(null);
  const body = useRef<THREE.Group>(null);
  const legL = useRef<THREE.Group>(null);
  const legR = useRef<THREE.Group>(null);
  const armL = useRef<THREE.Group>(null);
  const armR = useRef<THREE.Group>(null);
  const head = useRef<THREE.Group>(null);

  const m = useMemo(
    () => ({
      hoodie: flat(hoodie),
      pants: flat(pants),
      hair: flat(hair),
      skin: flat(skin),
      shoe: flat('#F1F5F9'),
      pack: flat(backpack ?? '#1E293B'),
      eye: new THREE.MeshBasicMaterial({ color: '#0F172A' }),
    }),
    [hoodie, pants, hair, skin, backpack],
  );
  // Imperatively created materials aren't auto-disposed by R3F.
  useEffect(() => () => Object.values(m).forEach((mat) => mat.dispose()), [m]);

  useFrame(() => {
    const t = timeRef.current;
    const p = pose(t);
    if (!root.current) return;
    root.current.position.set(p.x, 0, p.z);
    root.current.rotation.y = p.rotY;
    const cycle = Math.sin((t + offset) * 8);
    const swing = cycle * 0.6 * p.walking;
    legL.current!.rotation.x = swing;
    legR.current!.rotation.x = -swing;
    armL.current!.rotation.x = -swing * 0.8;
    armR.current!.rotation.x = swing * 0.8;
    // Idle breathing blends into a walking bob.
    const idle = Math.sin((t + offset) * 2) * 0.015 * (1 - p.walking);
    body.current!.position.y = Math.abs(cycle) * 0.05 * p.walking + idle;
    head.current!.rotation.y = Math.sin((t + offset) * 0.7) * 0.15 * (1 - p.walking);
  });

  return (
    <group ref={root}>
      {/* soft contact shadow */}
      <mesh rotation-x={-Math.PI / 2} position-y={0.01}>
        <circleGeometry args={[0.32, 16]} />
        <meshBasicMaterial color="#020617" transparent opacity={0.35} />
      </mesh>
      <group ref={body}>
        {/* legs pivot at hips */}
        {[
          [legL, -0.11],
          [legR, 0.11],
        ].map(([ref, x]) => (
          <group key={x as number} ref={ref as React.RefObject<THREE.Group>} position={[x as number, 0.62, 0]}>
            <mesh position-y={-0.28} material={m.pants} castShadow>
              <boxGeometry args={[0.17, 0.5, 0.18]} />
            </mesh>
            <mesh position={[0, -0.57, 0.04]} material={m.shoe} castShadow>
              <boxGeometry args={[0.19, 0.1, 0.27]} />
            </mesh>
          </group>
        ))}
        {/* hoodie torso */}
        <mesh position-y={0.92} material={m.hoodie} castShadow>
          <boxGeometry args={[0.48, 0.6, 0.3]} />
        </mesh>
        {/* front pocket */}
        <mesh position={[0, 0.78, 0.155]} material={m.pants}>
          <boxGeometry args={[0.3, 0.12, 0.01]} />
        </mesh>
        {/* backpack */}
        <mesh position={[0, 0.95, -0.24]} material={m.pack} castShadow>
          <boxGeometry args={[0.38, 0.46, 0.18]} />
        </mesh>
        <mesh position={[0, 0.85, -0.335]} material={m.hoodie}>
          <boxGeometry args={[0.26, 0.16, 0.02]} />
        </mesh>
        {/* arms pivot at shoulders */}
        {[
          [armL, -0.31],
          [armR, 0.31],
        ].map(([ref, x]) => (
          <group key={x as number} ref={ref as React.RefObject<THREE.Group>} position={[x as number, 1.16, 0]}>
            <mesh position-y={-0.24} material={m.hoodie} castShadow>
              <boxGeometry args={[0.14, 0.46, 0.15]} />
            </mesh>
            <mesh position-y={-0.52} material={m.skin}>
              <boxGeometry args={[0.11, 0.11, 0.11]} />
            </mesh>
          </group>
        ))}
        {/* hood collar */}
        <mesh position={[0, 1.24, -0.06]} material={m.hoodie}>
          <boxGeometry args={[0.4, 0.12, 0.26]} />
        </mesh>
        {/* head */}
        <group ref={head} position-y={1.5}>
          <mesh material={m.skin} castShadow>
            <icosahedronGeometry args={[0.24, 1]} />
          </mesh>
          <mesh position={[0, 0.1, -0.03]} material={m.hair}>
            <sphereGeometry args={[0.26, 8, 6, 0, Math.PI * 2, 0, Math.PI / 2]} />
          </mesh>
          <mesh position={[-0.08, 0.02, 0.215]} material={m.eye}>
            <boxGeometry args={[0.04, 0.06, 0.02]} />
          </mesh>
          <mesh position={[0.08, 0.02, 0.215]} material={m.eye}>
            <boxGeometry args={[0.04, 0.06, 0.02]} />
          </mesh>
        </group>
      </group>
    </group>
  );
};
