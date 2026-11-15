import React, { useEffect, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { ease } from './timeline';

/** Canvas-drawn shop sign texture: avoids shipping a font-rendering library. */
function useSignTexture(text: string, bg: string, fg: string) {
  const tex = useMemo(() => {
    const c = document.createElement('canvas');
    c.width = 512;
    c.height = 128;
    const g = c.getContext('2d')!;
    g.fillStyle = bg;
    g.fillRect(0, 0, 512, 128);
    g.fillStyle = fg;
    g.font = 'bold 64px Outfit, system-ui, sans-serif';
    g.textAlign = 'center';
    g.textBaseline = 'middle';
    g.fillText(text, 256, 68);
    const t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace;
    return t;
  }, [text, bg, fg]);
  useEffect(() => () => tex.dispose(), [tex]);
  return tex;
}

interface ShopProps {
  x: number;
  width: number;
  name: string;
  wall: string;
  accent: string;
  signFg?: string;
  goods: string[];
}

/** One storefront: wall, glass frontage, door, awning, lit sign and stocked shelves. */
const Shop: React.FC<ShopProps> = ({ x, width, name, wall, accent, signFg = '#0B132B', goods }) => {
  const sign = useSignTexture(name, accent, signFg);
  const shelves = [-width / 2 + 0.6, width / 2 - 0.6];
  return (
    <group position={[x, 0, -2]}>
      {/* back wall / building block */}
      <mesh position={[0, 1.9, -0.6]} receiveShadow castShadow>
        <boxGeometry args={[width, 3.8, 1.6]} />
        <meshStandardMaterial color={wall} roughness={0.9} flatShading />
      </mesh>
      {/* recessed interior, lit warmly */}
      <mesh position={[0, 1.15, 0.21]}>
        <boxGeometry args={[width - 0.5, 2.1, 0.02]} />
        <meshStandardMaterial color="#FEF3C7" emissive="#FCD34D" emissiveIntensity={0.25} />
      </mesh>
      {/* shelves with goods behind the glass */}
      {shelves.map((sx) =>
        [0.55, 1.05, 1.55].map((sy, row) => (
          <group key={`${sx}-${sy}`} position={[sx, sy, 0.35]}>
            <mesh>
              <boxGeometry args={[0.9, 0.05, 0.25]} />
              <meshStandardMaterial color="#475569" />
            </mesh>
            {[-0.3, -0.1, 0.1, 0.3].map((gx, i) => (
              <mesh key={gx} position={[gx, 0.13, 0]}>
                <boxGeometry args={[0.14, 0.2 + ((i + row) % 2) * 0.06, 0.14]} />
                <meshStandardMaterial color={goods[(i + row) % goods.length]} flatShading />
              </mesh>
            ))}
          </group>
        )),
      )}
      {/* glass frontage */}
      <mesh position={[0, 1.15, 0.6]}>
        <boxGeometry args={[width - 0.4, 2.2, 0.04]} />
        <meshStandardMaterial color="#93C5FD" transparent opacity={0.18} roughness={0.1} metalness={0.3} />
      </mesh>
      {/* door frame */}
      <mesh position={[0, 1.1, 0.64]}>
        <boxGeometry args={[1.1, 2.2, 0.06]} />
        <meshStandardMaterial color="#0F172A" transparent opacity={0.55} />
      </mesh>
      {/* pillars */}
      {[-width / 2 + 0.12, width / 2 - 0.12].map((px) => (
        <mesh key={px} position={[px, 1.4, 0.6]} castShadow>
          <boxGeometry args={[0.24, 2.8, 0.3]} />
          <meshStandardMaterial color="#334155" flatShading />
        </mesh>
      ))}
      {/* awning */}
      <mesh position={[0, 2.55, 0.95]} rotation-x={0.35} castShadow>
        <boxGeometry args={[width - 0.2, 0.08, 0.9]} />
        <meshStandardMaterial color={accent} roughness={0.7} flatShading />
      </mesh>
      {/* lit sign */}
      <mesh position={[0, 3.15, 0.25]}>
        <boxGeometry args={[width - 0.7, 0.6, 0.12]} />
        <meshStandardMaterial map={sign} emissive="#ffffff" emissiveMap={sign} emissiveIntensity={0.55} />
      </mesh>
    </group>
  );
};

const Planter: React.FC<{ position: [number, number, number] }> = ({ position }) => (
  <group position={position}>
    <mesh position-y={0.25} castShadow receiveShadow>
      <cylinderGeometry args={[0.35, 0.3, 0.5, 8]} />
      <meshStandardMaterial color="#475569" flatShading />
    </mesh>
    <mesh position-y={0.85} castShadow>
      <icosahedronGeometry args={[0.45, 0]} />
      <meshStandardMaterial color="#10B981" flatShading />
    </mesh>
    <mesh position={[0.15, 1.2, 0.05]} castShadow>
      <icosahedronGeometry args={[0.28, 0]} />
      <meshStandardMaterial color="#34D399" flatShading />
    </mesh>
  </group>
);

const Bench: React.FC<{ position: [number, number, number]; rotY?: number }> = ({ position, rotY = 0 }) => (
  <group position={position} rotation-y={rotY}>
    <mesh position-y={0.42} castShadow receiveShadow>
      <boxGeometry args={[1.4, 0.08, 0.45]} />
      <meshStandardMaterial color="#B45309" flatShading />
    </mesh>
    <mesh position={[0, 0.7, -0.2]} castShadow>
      <boxGeometry args={[1.4, 0.35, 0.06]} />
      <meshStandardMaterial color="#B45309" flatShading />
    </mesh>
    {[-0.6, 0.6].map((lx) => (
      <mesh key={lx} position={[lx, 0.2, 0]}>
        <boxGeometry args={[0.08, 0.4, 0.4]} />
        <meshStandardMaterial color="#1E293B" />
      </mesh>
    ))}
  </group>
);

const LampPost: React.FC<{ position: [number, number, number] }> = ({ position }) => (
  <group position={position}>
    <mesh position-y={1.4} castShadow>
      <cylinderGeometry args={[0.05, 0.07, 2.8, 6]} />
      <meshStandardMaterial color="#1E293B" />
    </mesh>
    <mesh position-y={2.85}>
      <boxGeometry args={[0.3, 0.2, 0.3]} />
      <meshStandardMaterial color="#E0F2FE" emissive="#38D9E6" emissiveIntensity={1.2} />
    </mesh>
  </group>
);

/** Cyan investigation marker in front of the Mini Mart; fades in during Scene 2. */
export const ClueMarker: React.FC<{ timeRef: React.MutableRefObject<number> }> = ({ timeRef }) => {
  const group = useRef<THREE.Group>(null);
  const gem = useRef<THREE.Mesh>(null);
  const ring = useRef<THREE.Mesh>(null);
  useFrame(() => {
    const t = timeRef.current;
    const show = ease(t, 5, 5.8) * (1 - ease(t, 16.8, 17.6));
    group.current!.scale.setScalar(Math.max(show, 0.0001));
    gem.current!.position.y = 1.9 + Math.sin(t * 2.5) * 0.12;
    gem.current!.rotation.y = t * 1.5;
    const pulse = (t * 0.8) % 1;
    ring.current!.scale.setScalar(0.6 + pulse * 0.9);
    (ring.current!.material as THREE.MeshBasicMaterial).opacity = 0.7 * (1 - pulse);
  });
  return (
    <group ref={group} position={[0.9, 0, -1.0]}>
      <mesh ref={gem}>
        <octahedronGeometry args={[0.2, 0]} />
        <meshStandardMaterial color="#38D9E6" emissive="#38D9E6" emissiveIntensity={1.4} flatShading />
      </mesh>
      <mesh ref={ring} rotation-x={-Math.PI / 2} position-y={0.03}>
        <ringGeometry args={[0.42, 0.52, 32]} />
        <meshBasicMaterial color="#38D9E6" transparent opacity={0.7} depthWrite={false} />
      </mesh>
      <mesh rotation-x={-Math.PI / 2} position-y={0.02}>
        <circleGeometry args={[0.42, 32]} />
        <meshBasicMaterial color="#38D9E6" transparent opacity={0.18} depthWrite={false} />
      </mesh>
    </group>
  );
};

/** Low-poly shopping promenade: three storefronts, tiled walkway, planters, benches and lamps. */
export const RetailEnvironment: React.FC = () => (
  <group>
    {/* walkway */}
    <mesh rotation-x={-Math.PI / 2} position={[0, 0, 2]} receiveShadow>
      <planeGeometry args={[20, 12]} />
      <meshStandardMaterial color="#3B4A6B" roughness={0.95} />
    </mesh>
    {/* paving bands */}
    {[-6, -3, 0, 3, 6].map((bx) => (
      <mesh key={bx} rotation-x={-Math.PI / 2} position={[bx, 0.005, 2]}>
        <planeGeometry args={[0.08, 12]} />
        <meshBasicMaterial color="#56688F" />
      </mesh>
    ))}
    {/* storefront kerb */}
    <mesh position={[0, 0.06, -0.85]} receiveShadow>
      <boxGeometry args={[20, 0.12, 0.5]} />
      <meshStandardMaterial color="#64748B" flatShading />
    </mesh>

    <Shop x={-4.7} width={4.2} name="BAKE HAUS" wall="#4C1D95" accent="#F472B6" goods={['#FDE68A', '#F59E0B', '#FBCFE8']} />
    <Shop x={0} width={4.8} name="MINI MART" wall="#1E3A8A" accent="#F2B94B" goods={['#38D9E6', '#F87171', '#A3E635', '#FBBF24']} />
    <Shop x={4.9} width={4.2} name="TECH HUB" wall="#155E75" accent="#38D9E6" goods={['#E2E8F0', '#60A5FA', '#1E293B']} />

    <Planter position={[-2.6, 0, 0.1]} />
    <Planter position={[2.6, 0, 0.1]} />
    <Bench position={[-5.2, 0, 1.6]} rotY={0.2} />
    <Bench position={[5.6, 0, 1.4]} rotY={-0.25} />
    <LampPost position={[-7, 0, 1.2]} />
    <LampPost position={[7.2, 0, 1.2]} />
  </group>
);
