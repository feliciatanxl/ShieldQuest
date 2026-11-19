import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Bug, Maximize2, Minimize2 } from 'lucide-react';
import { BrandMark } from '../components/Navbar';
import type Phaser from 'phaser';
import type { PlaygroundMode } from '../game/games';
import type { DebugInfo, PlaygroundScene } from '../game/m01';
import type { GameHandoff, MissionExit, ReturnLocation, UnityMissionId } from '@shieldquest/shared';
import { UnityMission } from '../components/UnityMission';
import { ensureSession, loadHandoff, saveMissionExit, storeHandoff, type PlayerSession } from '../services/gameSession';

const MODES: { id: PlaygroundMode; label: string; hint: string }[] = [
  { id: 'sandbox', label: 'Character Sandbox', hint: 'Animation and movement on a 32px grid' },
  { id: 'neighbourhood', label: 'Singapore Neighbourhood', hint: 'Explore the Tiled map with collisions' },
  { id: 'missions', label: 'NPC & Missions', hint: 'Dialogue, interaction and trigger areas shown' },
];
const CONTROLS: [string, string][] = [
  ['W A S D', 'Move'], ['Arrow keys', 'Move'], ['Shift', 'Run'], ['E', 'Interact'], ['Esc', 'Close dialogue'],
];

type Games = typeof import('../game/games');

/** Central 2D gameplay playground. All gameplay testing lives on this one route. */
export const CharacterTestPage: React.FC = () => {
  const host = useRef<HTMLDivElement>(null);
  const frame = useRef<HTMLDivElement>(null);
  const game = useRef<Phaser.Game | null>(null);
  const lib = useRef<Games | null>(null);
  const [mode, setMode] = useState<PlaygroundMode>('neighbourhood');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [debugOpen, setDebugOpen] = useState(false);
  const [hitboxes, setHitboxes] = useState(false);
  const [info, setInfo] = useState<(DebugInfo & { fps: number }) | null>(null);
  const [fullscreen, setFullscreen] = useState(false);
  const [mission, setMission] = useState<GameHandoff | null>(null);
  const [saveNote, setSaveNote] = useState<string | null>(null);
  const session = useRef<PlayerSession | null>(null);

  const neighbourhood = () => game.current?.scene.getScene('neighbourhood') as (PlaygroundScene & { returnFrom?: (l: ReturnLocation) => void }) | undefined;
  /** Only one engine runs: Phaser's loop and keyboard capture stop while Unity has the player. */
  const setPhaserActive = (on: boolean) => {
    const g = game.current;
    if (!g) return;
    if (g.input.keyboard) g.input.keyboard.enabled = on;
    if (on) g.resume(); else g.pause();
  };

  const startMission = async (missionId: UnityMissionId, returnTo: ReturnLocation) => {
    setPhaserActive(false);
    const s = (session.current ??= await ensureSession());
    const h: GameHandoff = { v: 1, sessionId: s.sessionId, avatar: { characterId: 'student' }, engine: 'unity', missionId, checkpoint: 'start', completedObjectives: [], returnTo };
    storeHandoff(h);
    setMission(h);
  };

  const endMission = (exit: MissionExit) => {
    const h = mission;
    setMission(null);
    storeHandoff(null);
    setPhaserActive(true);
    if (h) neighbourhood()?.returnFrom?.(h.returnTo);
    if (session.current) saveMissionExit(session.current, exit).then((s) => { session.current = s; setSaveNote(null); })
      .catch((e: unknown) => setSaveNote(`Progress not saved: ${e instanceof Error ? e.message : String(e)}`));
  };

  // Create exactly one Phaser game for the page lifetime; destroy it on unmount.
  useEffect(() => {
    let cancelled = false;
    import('../game/games').then((g) => {
      if (cancelled || !host.current) return;
      lib.current = g;
      const instance = g.createPlayground(host.current, mode);
      instance.events.on('scene-ready', (key: string) => {
        setLoading(false);
        // a reload mid-mission returns the player to where they entered
        const pending = loadHandoff();
        if (key === 'neighbourhood' && pending) { neighbourhood()?.returnFrom?.(pending.returnTo); storeHandoff(null); }
      });
      instance.events.on('enter-mission', (e: { missionId: UnityMissionId; returnTo: ReturnLocation }) => { void startMission(e.missionId, e.returnTo); });
      game.current = instance;
      if (import.meta.env.DEV) (window as unknown as { __game?: Phaser.Game }).__game = instance; // dev-only test hook
    }).catch((e: unknown) => setError(String(e)));
    return () => { cancelled = true; game.current?.destroy(true); game.current = null; };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- mode changes are handled below without recreating the game
  }, []);

  const choose = (m: PlaygroundMode) => {
    if (m === mode || mission) return;
    setMode(m);
    if (game.current && lib.current) { setLoading(true); lib.current.switchMode(game.current, m); }
  };

  const activeScene = () => game.current?.scene.getScenes(true)[0] as PlaygroundScene | undefined;

  // Hitbox toggle applies to the current scene and is re-applied after a mode switch.
  useEffect(() => { if (!loading) activeScene()?.setDebug(hitboxes || mode === 'missions'); }, [hitboxes, loading, mode]);

  // Poll live stats only while the panel is open.
  useEffect(() => {
    if (!debugOpen) return;
    const id = window.setInterval(() => {
      const s = activeScene();
      if (s?.debugInfo && game.current) setInfo({ ...s.debugInfo(), fps: Math.round(game.current.loop.actualFps) });
    }, 250);
    return () => window.clearInterval(id);
  }, [debugOpen]);

  useEffect(() => {
    const onChange = () => setFullscreen(document.fullscreenElement === frame.current);
    document.addEventListener('fullscreenchange', onChange);
    return () => document.removeEventListener('fullscreenchange', onChange);
  }, []);
  const toggleFullscreen = () => (document.fullscreenElement ? document.exitFullscreen() : frame.current?.requestFullscreen())?.catch(() => {});

  return (
    <div className="min-h-screen sq-backdrop text-shield-cream">
      <header className="border-b-4 border-dotted border-shield-cardBorder bg-shield-void/85 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
          <Link to="/" className="group flex items-center gap-3 rounded-xl p-1" aria-label="ShieldQuest Home">
            <BrandMark />
            <span className="font-heading text-lg font-bold tracking-tight">Shield<span className="text-shield-blue">Quest</span></span>
          </Link>
          <Link to="/" className="inline-flex items-center gap-2 rounded-lg border border-shield-cardBorder px-3 py-2 text-sm font-medium text-shield-muted transition-colors hover:border-shield-cyan/50 hover:text-shield-cream focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-shield-cyan">
            <ArrowLeft className="h-4 w-4" /> <span>Back to Home</span>
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-6xl space-y-5 px-4 py-6 sm:px-6 sm:py-8">
        <div>
          <p className="quest-tag">Dev · /dev/character-test</p>
          <h1 className="mt-2 font-heading text-3xl font-bold tracking-tight sm:text-4xl">Gameplay Playground</h1>
          <p className="mt-1 text-shield-muted">Explore, interact and test the world of ShieldQuest</p>
        </div>

        {/* Mode switcher */}
        <div role="tablist" aria-label="Testing mode" className="grid grid-cols-1 gap-2 rounded-2xl border border-shield-cardBorder bg-shield-card p-1.5 shadow-cozy sm:grid-cols-3">
          {MODES.map((m) => (
            <button key={m.id} role="tab" aria-selected={mode === m.id} onClick={() => choose(m.id)}
              className={`rounded-xl px-4 py-2.5 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-shield-cyan ${mode === m.id ? 'bg-shield-blue text-white shadow-[0_3px_0_0_rgb(var(--shield-shadow)/0.4)]' : 'text-shield-muted hover:bg-shield-surface hover:text-shield-cream'}`}>
              <span className="block font-heading text-sm font-bold">{m.label}</span>
              <span className={`block text-xs ${mode === m.id ? 'text-white/80' : 'text-shield-subtle'}`}>{m.hint}</span>
            </button>
          ))}
        </div>

        {/* Game viewport */}
        <div ref={frame} className={`relative overflow-hidden bg-[#1b2a22] ${fullscreen ? 'flex items-center justify-center' : 'rounded-[18px] border-[3px] border-shield-cream/85 shadow-cozy'}`}>
          {/* touch-action none: drags steer the joystick instead of scrolling the page */}
          <div ref={host} className={`mx-auto w-full select-none ${fullscreen ? 'h-full' : 'aspect-video'}`} style={{ touchAction: 'none' }} />
          {(loading || error) && (
            <div className="absolute inset-0 flex items-center justify-center bg-[#17233D]/90">
              <p className={`font-mono text-sm ${error ? 'text-shield-rose' : 'animate-pulse text-shield-cyan'}`}>{error ? `Could not start the game: ${error}` : 'Loading world…'}</p>
            </div>
          )}
          {mission && <UnityMission handoff={mission} onExit={endMission} />}
          <button onClick={toggleFullscreen} aria-label={fullscreen ? 'Exit fullscreen' : 'Fullscreen'}
            className="absolute right-3 top-3 rounded-lg border border-white/15 bg-black/40 p-2 text-white/80 backdrop-blur transition-colors hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-shield-cyan">
            {fullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
          </button>
        </div>

        <div className="grid gap-4 md:grid-cols-[1fr_1fr]">
          {/* Controls */}
          <section className="game-panel p-4" aria-labelledby="controls-title">
            <h2 id="controls-title" className="font-heading text-sm font-bold uppercase tracking-wider text-shield-muted">Controls</h2>
            <dl className="mt-3 grid grid-cols-[auto_1fr] gap-x-4 gap-y-2 text-sm">
              {CONTROLS.map(([k, a]) => (
                <React.Fragment key={k + a}>
                  <dt><kbd className="rounded-md border border-shield-cardBorder bg-shield-dark px-2 py-0.5 font-pixel text-xs text-shield-cream shadow-[0_2px_0_0_rgb(var(--shield-cardBorder))]">{k}</kbd></dt>
                  <dd className="text-shield-cream/90">{a}</dd>
                </React.Fragment>
              ))}
            </dl>
            {saveNote && <p role="status" className="mt-3 text-xs text-shield-rose">{saveNote}</p>}
            <p className="mt-3 text-xs text-shield-subtle">On touch screens: drag the left side to move, hold RUN, tap E to interact.</p>
          </section>

          {/* Developer info */}
          <section className="game-panel p-4" aria-labelledby="dev-title">
            <div className="flex items-center justify-between gap-2">
              <h2 id="dev-title" className="font-heading text-sm font-bold uppercase tracking-wider text-shield-muted">Developer info</h2>
              <button onClick={() => setDebugOpen((o) => !o)} aria-expanded={debugOpen}
                className="inline-flex items-center gap-1.5 rounded-lg border border-shield-cardBorder px-2.5 py-1 text-xs text-shield-muted hover:text-shield-cream focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-shield-cyan">
                <Bug className="h-3.5 w-3.5" /> {debugOpen ? 'Hide' : 'Show'}
              </button>
            </div>
            {debugOpen && (
              <div className="mt-3 space-y-3">
                <dl className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-xs tabular-nums sm:grid-cols-3">
                  {([['Mode', info?.mode], ['Position', info ? `${info.x}, ${info.y}` : '–'], ['Facing', info?.facing], ['State', info?.gait], ['Area', info?.zone ?? '–'], ['FPS', info?.fps]] as const).map(([k, v]) => (
                    <div key={k}><dt className="text-shield-subtle">{k}</dt><dd className="truncate text-shield-cream">{v ?? '–'}</dd></div>
                  ))}
                </dl>
                <label className="flex items-center gap-2 text-sm text-shield-cream/90">
                  <input type="checkbox" checked={hitboxes || mode === 'missions'} disabled={mode === 'missions'} onChange={(e) => setHitboxes(e.target.checked)} className="accent-shield-cyan" />
                  Show collisions and trigger areas {mode === 'missions' && <span className="text-xs text-shield-subtle">(always on in this mode)</span>}
                </label>
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  );
};
