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

const mat = (color: string, roughness = 0.65) => new THREE.MeshStandardMaterial({ color, roughness });

/** Stylised articulated character: rounded hoodie, backpack, sneakers, swinging limbs. */
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
      hoodie: mat(hoodie),
      pants: mat(pants, 0.8),
      hair: mat(hair, 0.5),
      skin: mat(skin, 0.55),
      shoe: mat('#F8FAFC', 0.4),
      pack: mat(backpack ?? '#1E293B', 0.5),
      eye: new THREE.MeshBasicMaterial({ color: '#0F172A' }),
      sole: mat('#1E293B', 0.9),
      trim: new THREE.MeshBasicMaterial({ color: '#E0F2FE' }),
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
      <mesh rotation-x={-Math.PI / 2} position-y={0.012}>
        <circleGeometry args={[0.34, 24]} />
        <meshBasicMaterial color="#020617" transparent opacity={0.4} depthWrite={false} />
      </mesh>
      <group ref={body}>
        {/* legs pivot at hips */}
        {[
          [legL, -0.1],
          [legR, 0.1],
        ].map(([ref, x]) => (
          <group key={x as number} ref={ref as React.RefObject<THREE.Group>} position={[x as number, 0.64, 0]}>
            <mesh position-y={-0.27} material={m.pants} castShadow>
              <capsuleGeometry args={[0.085, 0.36, 4, 10]} />
            </mesh>
            {/* sneaker */}
            <mesh position={[0, -0.58, 0.05]} rotation-x={Math.PI / 2} material={m.shoe} castShadow>
              <capsuleGeometry args={[0.075, 0.14, 4, 8]} />
            </mesh>
            <mesh position={[0, -0.63, 0.05]} material={m.sole}>
              <boxGeometry args={[0.15, 0.03, 0.29]} />
            </mesh>
          </group>
        ))}
        {/* hoodie torso */}
        <mesh position-y={0.95} scale={[1.15, 1, 0.78]} material={m.hoodie} castShadow>
          <capsuleGeometry args={[0.2, 0.3, 6, 14]} />
        </mesh>
        {/* kangaroo pocket + drawstrings */}
        <mesh position={[0, 0.8, 0.16]} material={m.pants}>
          <boxGeometry args={[0.26, 0.1, 0.02]} />
        </mesh>
        {[-0.05, 0.05].map((dx) => (
          <mesh key={dx} position={[dx, 1.07, 0.165]} material={m.trim}>
            <boxGeometry args={[0.015, 0.12, 0.01]} />
          </mesh>
        ))}
        {/* backpack with straps */}
        <mesh position={[0, 0.98, -0.22]} material={m.pack} castShadow>
          <capsuleGeometry args={[0.15, 0.2, 4, 10]} />
        </mesh>
        <mesh position={[0, 0.86, -0.36]} material={m.pack}>
          <boxGeometry args={[0.2, 0.14, 0.05]} />
        </mesh>
        {[-0.13, 0.13].map((sx) => (
          <mesh key={sx} position={[sx, 1.02, 0.155]} material={m.sole}>
            <boxGeometry args={[0.04, 0.34, 0.02]} />
          </mesh>
        ))}
        {/* arms pivot at shoulders */}
        {[
          [armL, -0.29],
          [armR, 0.29],
        ].map(([ref, x]) => (
          <group key={x as number} ref={ref as React.RefObject<THREE.Group>} position={[x as number, 1.17, 0]}>
            <mesh position-y={-0.22} material={m.hoodie} castShadow>
              <capsuleGeometry args={[0.07, 0.32, 4, 10]} />
            </mesh>
            <mesh position-y={-0.48} material={m.skin}>
              <sphereGeometry args={[0.065, 10, 8]} />
            </mesh>
          </group>
        ))}
        {/* hood resting behind the neck */}
        <mesh position={[0, 1.24, -0.07]} rotation-x={Math.PI / 2.4} material={m.hoodie}>
          <torusGeometry args={[0.13, 0.06, 8, 16]} />
        </mesh>
        {/* head */}
        <group ref={head} position-y={1.5}>
          <mesh material={m.skin} castShadow>
            <sphereGeometry args={[0.23, 20, 16]} />
          </mesh>
          <mesh position={[0, 0.05, -0.02]} scale={[1.06, 0.9, 1.06]} material={m.hair}>
            <sphereGeometry args={[0.24, 20, 12, 0, Math.PI * 2, 0, Math.PI / 1.9]} />
          </mesh>
          {/* fringe */}
          <mesh position={[0.04, 0.13, 0.17]} rotation={[0.5, 0, -0.2]} material={m.hair}>
            <boxGeometry args={[0.24, 0.06, 0.12]} />
          </mesh>
          {[-0.075, 0.075].map((ex) => (
            <mesh key={ex} position={[ex, 0.01, 0.215]} material={m.eye}>
              <sphereGeometry args={[0.025, 8, 6]} />
            </mesh>
          ))}
          {[-0.235, 0.235].map((ex) => (
            <mesh key={ex} position={[ex, -0.01, 0]} material={m.skin}>
              <sphereGeometry args={[0.045, 8, 6]} />
            </mesh>
          ))}
        </group>
      </group>
    </group>
  );
};
