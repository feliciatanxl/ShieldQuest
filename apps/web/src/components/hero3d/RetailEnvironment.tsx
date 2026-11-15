import React, { Suspense, useEffect, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { ease } from './timeline';
import { KenneyProp } from './KenneyProp';

// Background skyline from Kenney City Kit (Commercial): [model, x, z, height, rotY]
const SKYLINE: [string, number, number, number, number][] = [
  ['building-skyscraper-a', -14, -9, 13, 0],
  ['building-b', -9.5, -7.5, 8, Math.PI / 2],
  ['building-skyscraper-c', -4.5, -10, 16, 0],
  ['building-g', 0.5, -7.5, 9, Math.PI],
  ['building-skyscraper-e', 5.5, -9.5, 14, Math.PI / 2],
  ['building-b', 10, -8, 8.5, 0],
  ['building-skyscraper-a', 15, -10, 12, Math.PI],
];

/** Canvas-drawn neon sign texture: avoids shipping a font-rendering library. */
function useSignTexture(text: string, accent: string) {
  const tex = useMemo(() => {
    const c = document.createElement('canvas');
    c.width = 512;
    c.height = 128;
    const g = c.getContext('2d')!;
    g.fillStyle = '#0B132B';
    g.fillRect(0, 0, 512, 128);
    g.strokeStyle = accent;
    g.lineWidth = 6;
    g.strokeRect(8, 8, 496, 112);
    g.shadowColor = accent;
    g.shadowBlur = 18;
    g.fillStyle = accent;
    g.font = 'bold 60px Outfit, system-ui, sans-serif';
    g.textAlign = 'center';
    g.textBaseline = 'middle';
    g.fillText(text, 256, 68);
    const t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace;
    t.anisotropy = 4;
    return t;
  }, [text, accent]);
  useEffect(() => () => tex.dispose(), [tex]);
  return tex;
}

interface ShopProps {
  x: number;
  width: number;
  name: string;
  wall: string;
  accent: string;
  interior: string;
  goods: string[];
  awning?: boolean;
}

/** Storefront: two-storey facade, glass shopfront, lit interior, neon sign and trim. */
const Shop: React.FC<ShopProps> = ({ x, width, name, wall, accent, interior, goods, awning = true }) => {
  const sign = useSignTexture(name, accent);
  const shelves = [-width / 2 + 0.75, width / 2 - 0.75];
  return (
    <group position={[x, 0, -2]}>
      {/* ground-floor block */}
      <mesh position={[0, 1.6, -0.7]} receiveShadow castShadow>
        <boxGeometry args={[width, 3.2, 1.8]} />
        <meshStandardMaterial color={wall} roughness={0.85} />
      </mesh>
      {/* upper storey with lit office windows */}
      <mesh position={[0, 4.7, -1.1]} receiveShadow>
        <boxGeometry args={[width, 3, 1.6]} />
        <meshStandardMaterial color="#1E2547" roughness={0.9} />
      </mesh>
      {[-1, 0, 1].map((i) => (
        <mesh key={i} position={[i * (width / 3.2), 4.6, -0.29]}>
          <planeGeometry args={[width / 4.2, 1.1]} />
          <meshStandardMaterial color="#1E3A8A" emissive={i === 0 ? '#93C5FD' : '#6366F1'} emissiveIntensity={i === 0 ? 0.5 : 0.25} />
        </mesh>
      ))}
      {/* cornice ledge */}
      <mesh position={[0, 3.25, 0.05]} castShadow>
        <boxGeometry args={[width + 0.1, 0.18, 0.5]} />
        <meshStandardMaterial color="#334155" roughness={0.6} />
      </mesh>
      {/* warm interior back wall */}
      <mesh position={[0, 1.3, 0.21]}>
        <planeGeometry args={[width - 0.5, 2.4]} />
        <meshStandardMaterial color={interior} emissive={interior} emissiveIntensity={0.35} />
      </mesh>
      {/* ceiling light strip inside */}
      <mesh position={[0, 2.42, 0.4]}>
        <boxGeometry args={[width - 0.8, 0.04, 0.12]} />
        <meshBasicMaterial color="#FFFBEB" />
      </mesh>
      {/* stocked shelves behind glass */}
      {shelves.map((sx) =>
        [0.5, 1.0, 1.5, 2.0].map((sy, row) => (
          <group key={`${sx}-${sy}`} position={[sx, sy, 0.38]}>
            <mesh>
              <boxGeometry args={[1.1, 0.05, 0.28]} />
              <meshStandardMaterial color="#CBD5E1" metalness={0.4} roughness={0.4} />
            </mesh>
            {[-0.4, -0.2, 0, 0.2, 0.4].map((gx, i) => (
              <mesh key={gx} position={[gx, 0.12, 0]}>
                <boxGeometry args={[0.14, 0.18 + ((i + row) % 3) * 0.04, 0.14]} />
                <meshStandardMaterial color={goods[(i + row) % goods.length]} roughness={0.5} />
              </mesh>
            ))}
          </group>
        )),
      )}
      {/* glass shopfront */}
      <mesh position={[0, 1.3, 0.62]}>
        <boxGeometry args={[width - 0.4, 2.5, 0.03]} />
        <meshPhysicalMaterial color="#BFDBFE" transparent opacity={0.14} roughness={0.05} metalness={0.2} clearcoat={1} />
      </mesh>
      {/* mullions + door */}
      {[-width / 4, width / 4].map((mx) => (
        <mesh key={mx} position={[mx, 1.3, 0.64]}>
          <boxGeometry args={[0.05, 2.5, 0.05]} />
          <meshStandardMaterial color="#0F172A" metalness={0.6} roughness={0.3} />
        </mesh>
      ))}
      <mesh position={[0, 1.15, 0.66]}>
        <boxGeometry args={[1.1, 2.3, 0.04]} />
        <meshStandardMaterial color="#0F172A" transparent opacity={0.4} metalness={0.5} roughness={0.2} />
      </mesh>
      {/* pillars */}
      {[-width / 2 + 0.12, width / 2 - 0.12].map((px) => (
        <mesh key={px} position={[px, 1.6, 0.62]} castShadow>
          <boxGeometry args={[0.26, 3.2, 0.34]} />
          <meshStandardMaterial color="#475569" roughness={0.7} />
        </mesh>
      ))}
      {/* awning */}
      {awning && (
        <mesh position={[0, 2.72, 1.0]} rotation-x={0.3} castShadow>
          <boxGeometry args={[width - 0.3, 0.06, 0.95]} />
          <meshStandardMaterial color={accent} roughness={0.6} emissive={accent} emissiveIntensity={0.08} />
        </mesh>
      )}
      {/* neon sign */}
      <mesh position={[0, 3.62, 0.25]}>
        <boxGeometry args={[width - 0.9, 0.62, 0.1]} />
        <meshStandardMaterial map={sign} emissive="#ffffff" emissiveMap={sign} emissiveIntensity={1.1} />
      </mesh>
      {/* neon trim along the shopfront */}
      <mesh position={[0, 3.05, 0.32]}>
        <boxGeometry args={[width - 0.2, 0.04, 0.04]} />
        <meshBasicMaterial color={accent} toneMapped={false} />
      </mesh>
    </group>
  );
};

const LampPost: React.FC<{ position: [number, number, number] }> = ({ position }) => (
  <group position={position}>
    <mesh position-y={1.6} castShadow>
      <cylinderGeometry args={[0.05, 0.08, 3.2, 8]} />
      <meshStandardMaterial color="#0F172A" metalness={0.7} roughness={0.3} />
    </mesh>
    <mesh position={[0.25, 3.2, 0]}>
      <boxGeometry args={[0.6, 0.06, 0.18]} />
      <meshStandardMaterial color="#0F172A" />
    </mesh>
    <mesh position={[0.45, 3.13, 0]}>
      <boxGeometry args={[0.24, 0.05, 0.14]} />
      <meshBasicMaterial color="#E0F2FE" toneMapped={false} />
    </mesh>
    {/* light pool on the floor */}
    <mesh position={[0.45, 0.012, 0]} rotation-x={-Math.PI / 2}>
      <circleGeometry args={[1.1, 24]} />
      <meshBasicMaterial color="#38D9E6" transparent opacity={0.07} depthWrite={false} />
    </mesh>
  </group>
);

const VendingMachine: React.FC<{ position: [number, number, number] }> = ({ position }) => (
  <group position={position}>
    <mesh position-y={1} castShadow>
      <boxGeometry args={[0.8, 2, 0.6]} />
      <meshStandardMaterial color="#DC2626" roughness={0.4} />
    </mesh>
    <mesh position={[-0.1, 1.15, 0.31]}>
      <planeGeometry args={[0.45, 1.3]} />
      <meshStandardMaterial color="#E0F2FE" emissive="#BAE6FD" emissiveIntensity={0.7} />
    </mesh>
    <mesh position={[0.27, 1.2, 0.31]}>
      <planeGeometry args={[0.12, 0.3]} />
      <meshBasicMaterial color="#0F172A" />
    </mesh>
  </group>
);

const Kiosk: React.FC<{ position: [number, number, number]; rotY?: number }> = ({ position, rotY = 0 }) => (
  <group position={position} rotation-y={rotY}>
    <mesh position-y={0.55} castShadow receiveShadow>
      <boxGeometry args={[1.6, 1.1, 0.9]} />
      <meshStandardMaterial color="#312E81" roughness={0.6} />
    </mesh>
    <mesh position-y={1.13}>
      <boxGeometry args={[1.7, 0.06, 1]} />
      <meshStandardMaterial color="#E2E8F0" metalness={0.3} roughness={0.3} />
    </mesh>
    {[-0.7, 0.7].map((px) => (
      <mesh key={px} position={[px, 1.7, 0]}>
        <cylinderGeometry args={[0.03, 0.03, 1.1, 6]} />
        <meshStandardMaterial color="#0F172A" />
      </mesh>
    ))}
    <mesh position-y={2.3} castShadow>
      <boxGeometry args={[1.9, 0.12, 1.2]} />
      <meshStandardMaterial color="#8B5CF6" roughness={0.5} emissive="#8B5CF6" emissiveIntensity={0.15} />
    </mesh>
    <mesh position={[0, 2.22, 0.61]}>
      <boxGeometry args={[1.9, 0.03, 0.03]} />
      <meshBasicMaterial color="#C4B5FD" toneMapped={false} />
    </mesh>
    {[-0.5, -0.2, 0.1, 0.4].map((gx, i) => (
      <mesh key={gx} position={[gx, 1.25, 0.1]}>
        <boxGeometry args={[0.18, 0.18, 0.18]} />
        <meshStandardMaterial color={['#F472B6', '#FBBF24', '#38D9E6', '#A3E635'][i]} />
      </mesh>
    ))}
  </group>
);

const Bollard: React.FC<{ x: number; z: number }> = ({ x, z }) => (
  <group position={[x, 0, z]}>
    <mesh position-y={0.35} castShadow>
      <cylinderGeometry args={[0.09, 0.11, 0.7, 10]} />
      <meshStandardMaterial color="#1E293B" metalness={0.6} roughness={0.35} />
    </mesh>
    <mesh position-y={0.6}>
      <cylinderGeometry args={[0.095, 0.095, 0.05, 10]} />
      <meshBasicMaterial color="#38D9E6" toneMapped={false} />
    </mesh>
  </group>
);

/** Mission hotspot: cyan beacon, light column and pulsing ring by the Mini Mart door. */
export const ClueMarker: React.FC<{ timeRef: React.MutableRefObject<number> }> = ({ timeRef }) => {
  const group = useRef<THREE.Group>(null);
  const gem = useRef<THREE.Mesh>(null);
  const ring = useRef<THREE.Mesh>(null);
  useFrame(() => {
    const t = timeRef.current;
    const show = ease(t, 4.6, 5.6) * (1 - ease(t, 17.4, 18.2));
    group.current!.scale.setScalar(Math.max(show, 0.0001));
    gem.current!.position.y = 2.0 + Math.sin(t * 2.5) * 0.12;
    gem.current!.rotation.y = t * 1.5;
    const pulse = (t * 0.8) % 1;
    ring.current!.scale.setScalar(0.6 + pulse * 1.1);
    (ring.current!.material as THREE.MeshBasicMaterial).opacity = 0.8 * (1 - pulse);
  });
  return (
    <group ref={group} position={[0.95, 0, -0.95]}>
      <mesh ref={gem}>
        <octahedronGeometry args={[0.2, 0]} />
        <meshBasicMaterial color="#67E8F9" toneMapped={false} />
      </mesh>
      {/* light column */}
      <mesh position-y={1.4}>
        <cylinderGeometry args={[0.32, 0.42, 2.8, 24, 1, true]} />
        <meshBasicMaterial color="#38D9E6" transparent opacity={0.12} side={THREE.DoubleSide} depthWrite={false} blending={THREE.AdditiveBlending} />
      </mesh>
      <mesh ref={ring} rotation-x={-Math.PI / 2} position-y={0.03}>
        <ringGeometry args={[0.42, 0.5, 40]} />
        <meshBasicMaterial color="#38D9E6" transparent opacity={0.8} depthWrite={false} toneMapped={false} />
      </mesh>
      <mesh rotation-x={-Math.PI / 2} position-y={0.02}>
        <circleGeometry args={[0.45, 40]} />
        <meshBasicMaterial color="#38D9E6" transparent opacity={0.22} depthWrite={false} />
      </mesh>
      <pointLight position-y={1} color="#38D9E6" intensity={4} distance={4} />
    </group>
  );
};

/** Floor tile pattern drawn once to a texture: crisp joints at no geometry cost. */
function useTileTexture() {
  const tex = useMemo(() => {
    const c = document.createElement('canvas');
    c.width = c.height = 128;
    const g = c.getContext('2d')!;
    g.fillStyle = '#3A4670';
    g.fillRect(0, 0, 128, 128);
    g.fillStyle = '#404D7A';
    g.fillRect(0, 0, 64, 64);
    g.fillRect(64, 64, 64, 64);
    g.strokeStyle = '#2A3358';
    g.lineWidth = 3;
    g.strokeRect(0, 0, 128, 128);
    g.beginPath();
    g.moveTo(64, 0);
    g.lineTo(64, 128);
    g.moveTo(0, 64);
    g.lineTo(128, 64);
    g.stroke();
    const t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace;
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    t.repeat.set(16, 9);
    t.anisotropy = 8;
    return t;
  }, []);
  useEffect(() => () => tex.dispose(), [tex]);
  return tex;
}

/** Stylised Retail District promenade: five storefronts, kiosk, street props and skyline. */
export const RetailEnvironment: React.FC = () => {
  const tiles = useTileTexture();
  return (
    <group>
      {/* polished walkway */}
      <mesh rotation-x={-Math.PI / 2} position={[0, 0, 3]} receiveShadow>
        <planeGeometry args={[32, 18]} />
        <meshStandardMaterial map={tiles} roughness={0.35} metalness={0.25} />
      </mesh>
      {/* storefront kerb with cyan guide strip */}
      <mesh position={[0, 0.05, -0.9]} receiveShadow>
        <boxGeometry args={[32, 0.1, 0.5]} />
        <meshStandardMaterial color="#64748B" roughness={0.6} />
      </mesh>
      <mesh position={[0, 0.105, -0.66]}>
        <boxGeometry args={[32, 0.01, 0.04]} />
        <meshBasicMaterial color="#38D9E6" toneMapped={false} />
      </mesh>

      <Shop x={-9.5} width={4.6} name="PIXEL ARCADE" wall="#3B0764" accent="#C084FC" interior="#DDD6FE" goods={['#A78BFA', '#F472B6', '#38D9E6']} awning={false} />
      <Shop x={-4.7} width={4.6} name="BAKE HAUS" wall="#4A1D3F" accent="#F472B6" interior="#FFE4E6" goods={['#FDE68A', '#F59E0B', '#FBCFE8', '#D97706']} />
      <Shop x={0} width={4.8} name="MINI MART" wall="#1E3A8A" accent="#F2B94B" interior="#FEF3C7" goods={['#38D9E6', '#F87171', '#A3E635', '#FBBF24', '#60A5FA']} />
      <Shop x={4.8} width={4.6} name="TECH HUB" wall="#134E4A" accent="#38D9E6" interior="#E0F2FE" goods={['#E2E8F0', '#60A5FA', '#1E293B']} awning={false} />
      <Shop x={9.6} width={4.6} name="BUBBLE TEA" wall="#3F2A14" accent="#FBBF24" interior="#FEF9C3" goods={['#FDE68A', '#A16207', '#F9A8D4']} />

      <VendingMachine position={[-2.05, 0, -1.2]} />
      <Suspense fallback={null}>
        <KenneyProp src="furniture/pottedPlant.glb" height={1.5} position={[3.6, 0, -0.2]} />
        <KenneyProp src="furniture/pottedPlant.glb" height={1.5} position={[-6.9, 0, -0.1]} rotY={1.2} />
        <KenneyProp src="furniture/bench.glb" height={0.95} position={[-5.3, 0, 1.1]} rotY={0.15} />
        <KenneyProp src="furniture/trashcan.glb" height={0.9} position={[-3.0, 0, -0.35]} />
        <KenneyProp src="furniture/trashcan.glb" height={0.9} position={[7.4, 0, 0.4]} />
        {SKYLINE.map(([m, x, z, h, r], i) => (
          <KenneyProp key={i} src={`city/${m}.glb`} height={h} position={[x, 0, z]} rotY={r} shadows={false} />
        ))}
      </Suspense>
      <Kiosk position={[6.3, 0, 4.2]} rotY={-0.35} />
      <LampPost position={[-7.6, 0, 3.6]} />
      <LampPost position={[3.6, 0, 6.5]} />
      {[-3.2, -1.6, 1.8, 3.4].map((bx) => (
        <Bollard key={bx} x={bx * 2.6} z={7.5} />
      ))}
    </group>
  );
};

/** Ripple beat: rings spread outward from the decision point across the promenade. */
export const RippleWave: React.FC<{ timeRef: React.MutableRefObject<number>; origin: [number, number] }> = ({ timeRef, origin }) => {
  const rings = useRef<THREE.Mesh[]>([]);
  useFrame(() => {
    const t = timeRef.current;
    rings.current.forEach((r, i) => {
      const k = (t - 17.5 - i * 0.55) / 2.4;
      const on = k > 0 && k < 1;
      r.visible = on;
      if (!on) return;
      r.scale.setScalar(0.5 + k * 9);
      (r.material as THREE.MeshBasicMaterial).opacity = 0.55 * (1 - k);
    });
  });
  return (
    <group position={[origin[0], 0.02, origin[1]]}>
      {[0, 1, 2].map((i) => (
        <mesh key={i} ref={(m) => { if (m) rings.current[i] = m; }} rotation-x={-Math.PI / 2} visible={false}>
          <ringGeometry args={[0.92, 1, 64]} />
          <meshBasicMaterial color={i === 1 ? '#A78BFA' : '#38D9E6'} transparent depthWrite={false} toneMapped={false} />
        </mesh>
      ))}
    </group>
  );
};
