import React, { Suspense, useCallback, useEffect, useRef, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader.js';
import { RetailEnvironment, ClueMarker, RippleWave } from './RetailEnvironment';
import { BlockyCharacter, type AvatarPose } from './BlockyCharacter';
import { GameplayOverlay } from './GameplayOverlay';
import { LOOP_SECONDS, getPhase, ease, lerp, type Phase } from './timeline';

// --- Deterministic choreography (all positions derive from loop time) ---
const PLAYER_START = { x: -3.6, z: 5 };
const PLAYER_END = { x: -0.4, z: 0.5 };
const NPC_START = { x: 5.2, z: 3.6 };
const NPC_END = { x: 1.3, z: 0.9 };

const playerPose = (t: number): AvatarPose => {
  const k = ease(t, 0, 6);
  return {
    x: lerp(PLAYER_START.x, PLAYER_END.x, k),
    z: lerp(PLAYER_START.z, PLAYER_END.z, k),
    // face the Mini Mart while walking, then turn to the friend
    rotY: lerp(2.53, 1.3, ease(t, 9.2, 10.2)),
    walking: 1 - ease(t, 5.4, 6.2),
    // glance back at the shop door while weighing the choice
    look: -0.45 * ease(t, 14.2, 15) * (1 - ease(t, 16.6, 17.4)),
  };
};

const npcPose = (t: number): AvatarPose => {
  const k = ease(t, 8.4, 11);
  return {
    x: lerp(NPC_START.x, NPC_END.x, k),
    z: lerp(NPC_START.z, NPC_END.z, k),
    rotY: lerp(-2.2, -1.75, ease(t, 10.6, 11.4)),
    walking: ease(t, 8.4, 8.8) * (1 - ease(t, 10.6, 11.1)),
    // talks with one hand while asking the favour
    gesture: ease(t, 11, 11.6) * (1 - ease(t, 13.4, 14.2)),
  };
};

const idlePose = (x: number, z: number, rotY: number) => (): AvatarPose => ({ x, z, rotY, walking: 0 });
const squadA = idlePose(-6, 1.9, 0.5);
const squadB = idlePose(-6.9, 2.6, 0.9);

const camPos = new THREE.Vector3();
const camLook = new THREE.Vector3();
const tmp = new THREE.Vector3();

interface DirectorProps {
  timeRef: React.MutableRefObject<number>;
  playing: boolean;
  onPhase: (p: Phase) => void;
}

/** Advances loop time and drives a third-person camera through the five scenes. */
const Director: React.FC<DirectorProps> = ({ timeRef, playing, onPhase }) => {
  const { camera } = useThree();
  const last = useRef<Phase | null>(null);

  useFrame((_, dt) => {
    if (playing) timeRef.current = (timeRef.current + Math.min(dt, 0.1)) % LOOP_SECONDS;
    const t = timeRef.current;

    const p = playerPose(t);
    const n = npcPose(t);
    // Scene 1-2: over-the-shoulder follow.
    camPos.set(p.x + 1.2, 3.7, p.z + 7.2);
    camLook.set(p.x + 1.2, 1.7, p.z - 2);
    // Two-shot camera sits on the perpendicular bisector between the pair, so both are the
    // same distance away and read the same size (no perspective "big one / small one").
    const mx = (p.x + n.x) / 2;
    const mz = (p.z + n.z) / 2;
    const dx = n.x - p.x;
    const dz = n.z - p.z;
    const len = Math.hypot(dx, dz) || 1;
    const px = -dz / len; // perpendicular pointing towards the street (+z)
    const pz = dx / len;
    // Scene 3: two-shot with the Mini Mart behind them.
    const kNpc = ease(t, 9, 11);
    tmp.set(mx + px * 5.2, 2.0, mz + pz * 5.2);
    camPos.lerp(tmp, kNpc);
    tmp.set(mx, 1.0, mz);
    camLook.lerp(tmp, kNpc);
    // Scene 4: slow push-in on the same axis while they weigh it up.
    const kDecide = ease(t, 13.5, 16.5);
    tmp.set(mx + px * 4.3, 2.1, mz + pz * 4.3);
    camPos.lerp(tmp, kDecide);
    tmp.set(mx, 1.05, mz);
    camLook.lerp(tmp, kDecide);
    // Ripple: crane up to show the whole promenade the choice will touch.
    const kRipple = ease(t, 17.5, 20);
    tmp.set(0.3, 5.6, 9.2);
    camPos.lerp(tmp, kRipple);
    tmp.set(0.2, 0.4, 0);
    camLook.lerp(tmp, kRipple);

    // Subtle handheld drift keeps the shot feeling alive.
    camPos.x += Math.sin(t * 0.45) * 0.12;
    camPos.y += Math.sin(t * 0.7) * 0.05;
    camera.position.copy(camPos);
    camera.lookAt(camLook);

    const phase = getPhase(t);
    if (phase !== last.current) {
      last.current = phase;
      onPhase(phase);
    }
  });
  return null;
};

/** Image-based lighting from a 1K CC0 Poly Haven HDR: real reflections on glass and metal. */
const EnvironmentLighting: React.FC = () => {
  const { gl, scene } = useThree();
  useEffect(() => {
    let cancelled = false;
    let env: THREE.Texture | null = null;
    const pmrem = new THREE.PMREMGenerator(gl);
    new RGBELoader().load(`${import.meta.env.BASE_URL}models/shanghai_bund_1k.hdr`, (hdr) => {
      if (!cancelled) {
        env = pmrem.fromEquirectangular(hdr).texture;
        scene.environment = env;
        scene.environmentIntensity = 0.45;
      }
      hdr.dispose();
      pmrem.dispose();
    });
    return () => {
      cancelled = true;
      scene.environment = null;
      env?.dispose();
    };
  }, [gl, scene]);
  return null;
};

const World: React.FC<{ timeRef: React.MutableRefObject<number> }> = React.memo(({ timeRef }) => (
  <>
    <EnvironmentLighting />
    <color attach="background" args={['#161F48']} />
    <fog attach="fog" args={['#161F48', 13, 30]} />
    <hemisphereLight args={['#C7D2FE', '#2E1065', 0.9]} />
    {/* cool rim light from behind the shops separates characters from the backdrop */}
    <directionalLight position={[-6, 6, -8]} intensity={0.9} color="#818CF8" />
    <pointLight position={[-4.7, 2.4, -0.4]} color="#F472B6" intensity={5} distance={5} />
    <pointLight position={[4.8, 2.4, -0.4]} color="#38D9E6" intensity={5} distance={5} />
    <directionalLight
      position={[5, 10, 7]}
      intensity={1.5}
      color="#FFEDD5"
      castShadow
      shadow-mapSize={[2048, 2048]}
      shadow-radius={4}
      shadow-camera-left={-9}
      shadow-camera-right={9}
      shadow-camera-top={9}
      shadow-camera-bottom={-9}
      shadow-bias={-0.0008}
    />
    {/* warm Mini Mart interior spill onto the pavement */}
    <pointLight position={[0, 2.6, 0.4]} color="#FDBA74" intensity={7} distance={7} />
    <pointLight position={[0, 1.8, -1.6]} color="#FFEDD5" intensity={4} distance={4} />
    <RetailEnvironment />
    <ClueMarker timeRef={timeRef} />
    <RippleWave timeRef={timeRef} origin={[PLAYER_END.x + 0.8, PLAYER_END.z + 0.2]} />
    {/* characters stream in after the environment so the scene never sits blank */}
    <Suspense fallback={null}>
      <BlockyCharacter model="f" timeRef={timeRef} pose={playerPose} />
      <BlockyCharacter model="k" timeRef={timeRef} pose={npcPose} />
      <BlockyCharacter model="e" timeRef={timeRef} pose={squadA} />
      <BlockyCharacter model="c" timeRef={timeRef} pose={squadB} />
    </Suspense>
  </>
));
World.displayName = 'World';

/** Real-time 3D gameplay concept preview for the homepage hero. Lazy-loaded. */
const GameplayHeroScene: React.FC = () => {
  const wrapper = useRef<HTMLDivElement>(null);
  const timeRef = useRef(0);
  const [playing, setPlaying] = useState(true);
  const [visible, setVisible] = useState(true);
  const [phase, setPhase] = useState<Phase>('explore');

  // Stop rendering entirely while the hero is scrolled out of view.
  useEffect(() => {
    const el = wrapper.current;
    if (!el || typeof IntersectionObserver === 'undefined') return;
    const io = new IntersectionObserver(([e]) => setVisible(e.isIntersecting), { threshold: 0.05 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const replay = useCallback(() => {
    timeRef.current = 0;
    setPhase('explore');
    setPlaying(true);
  }, []);

  return (
    <div ref={wrapper} className="absolute inset-0">
      <Canvas
        className={`transition-opacity duration-700 ${phase === 'reset' ? 'opacity-30' : 'opacity-100'}`}
        shadows="soft"
        dpr={[1, 1.5]}
        frameloop={visible && playing ? 'always' : 'never'}
        camera={{ fov: 42, near: 0.1, far: 60, position: [-3, 2.5, 9] }}
        gl={{ antialias: true, powerPreference: 'low-power' }}
        // Canvas is decorative: let wheel/touch scroll pass through to the page.
        style={{ touchAction: 'pan-y' }}
        aria-hidden="true"
      >
        <Director timeRef={timeRef} playing={playing} onPhase={setPhase} />
        <World timeRef={timeRef} />
      </Canvas>
      <GameplayOverlay phase={phase} playing={playing} onTogglePlay={() => setPlaying((p) => !p)} onReplay={replay} />
    </div>
  );
};

export default GameplayHeroScene;
