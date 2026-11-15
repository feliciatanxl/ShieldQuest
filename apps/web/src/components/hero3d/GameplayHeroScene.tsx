import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { RetailEnvironment, ClueMarker } from './RetailEnvironment';
import { PlayerAvatar, type AvatarPose } from './PlayerAvatar';
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
  };
};

const npcPose = (t: number): AvatarPose => {
  const k = ease(t, 8.4, 11);
  return {
    x: lerp(NPC_START.x, NPC_END.x, k),
    z: lerp(NPC_START.z, NPC_END.z, k),
    rotY: lerp(-2.2, -1.75, ease(t, 10.6, 11.4)),
    walking: ease(t, 8.4, 8.8) * (1 - ease(t, 10.6, 11.1)),
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
    // Scene 3: frame player + friend.
    const kNpc = ease(t, 9, 10.6);
    tmp.set((p.x + n.x) / 2 + 0.3, 2.9, 6.4);
    camPos.lerp(tmp, kNpc);
    tmp.set((p.x + n.x) / 2, 0.9, 0.2);
    camLook.lerp(tmp, kNpc);
    // Scene 4: pull back to reveal the moment.
    const kDecide = ease(t, 14, 15.6);
    tmp.set(0.3, 3.6, 7.4);
    camPos.lerp(tmp, kDecide);
    tmp.set(0.3, 1.0, -0.4);
    camLook.lerp(tmp, kDecide);

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

const World: React.FC<{ timeRef: React.MutableRefObject<number> }> = React.memo(({ timeRef }) => (
  <>
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
      shadow-mapSize={[1024, 1024]}
      shadow-camera-left={-9}
      shadow-camera-right={9}
      shadow-camera-top={9}
      shadow-camera-bottom={-9}
      shadow-bias={-0.0008}
    />
    <pointLight position={[0, 2.6, 0.4]} color="#F2B94B" intensity={6} distance={6} />
    <RetailEnvironment />
    <ClueMarker timeRef={timeRef} />
    <PlayerAvatar timeRef={timeRef} pose={playerPose} hoodie="#2563EB" pants="#1E293B" hair="#111827" backpack="#38D9E6" />
    <PlayerAvatar timeRef={timeRef} pose={npcPose} hoodie="#F97316" pants="#334155" hair="#7C2D12" skin="#C68B59" backpack="#7C3AED" offset={0.7} />
    <PlayerAvatar timeRef={timeRef} pose={squadA} hoodie="#8B5CF6" pants="#1E293B" hair="#1F2937" skin="#F1C27D" offset={1.3} />
    <PlayerAvatar timeRef={timeRef} pose={squadB} hoodie="#10B981" pants="#0F172A" hair="#451A03" skin="#8D5524" offset={2.1} />
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
        shadows
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
