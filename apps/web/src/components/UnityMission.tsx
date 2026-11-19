import React, { useEffect, useRef, useState } from 'react';
import { parseMissionExit, type GameHandoff, type MissionExit } from '@shieldquest/shared';

/** Unity Web build output, copied to apps/web/public/unity/ (see docs/architecture). Loaded only when a mission starts. */
export const UNITY_BUILD = `${import.meta.env.BASE_URL}unity/Build/ShieldQuest`;
/** Unity -> page messages arrive as this DOM event (dispatched by ShieldQuestBridge.jslib). */
export const UNITY_EVENT = 'shieldquest:unity';

interface UnityInstance { SendMessage(obj: string, method: string, arg: string): void; Quit(): Promise<void> }
type CreateUnityInstance = (canvas: HTMLCanvasElement, config: Record<string, unknown>, onProgress: (p: number) => void) => Promise<UnityInstance>;
declare global { interface Window { createUnityInstance?: CreateUnityInstance } }

function loadScript(el: HTMLScriptElement, src: string): Promise<void> {
  return new Promise((resolve, reject) => {
    el.src = src;
    el.onload = () => resolve();
    el.onerror = () => reject(new Error('The mission build is not available yet.'));
    document.body.appendChild(el);
  });
}

interface Props { handoff: GameHandoff; onExit: (exit: MissionExit) => void }

/** Mounts one Unity instance for a mission and tears it down on exit/unmount. */
export const UnityMission: React.FC<Props> = ({ handoff, onExit }) => {
  const canvas = useRef<HTMLCanvasElement>(null);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const exitRef = useRef(onExit);
  exitRef.current = onExit;

  useEffect(() => {
    let instance: UnityInstance | null = null;
    const script = document.createElement('script'); // tracked from the start so unmount mid-download removes it
    let cancelled = false;

    const onMessage = (e: Event) => {
      const parsed = parseMissionExit((e as CustomEvent).detail);
      if (parsed.ok) exitRef.current(parsed.value);
      else console.warn('[UnityMission] ignored invalid message:', parsed.error);
    };
    window.addEventListener(UNITY_EVENT, onMessage);

    (async () => {
      try {
        await loadScript(script, `${UNITY_BUILD}.loader.js`);
        if (cancelled || !canvas.current || !window.createUnityInstance) throw new Error('Unity loader did not initialise.');
        instance = await window.createUnityInstance(canvas.current, {
          dataUrl: `${UNITY_BUILD}.data`,
          frameworkUrl: `${UNITY_BUILD}.framework.js`,
          codeUrl: `${UNITY_BUILD}.wasm`,
          companyName: 'SecurePi',
          productName: 'ShieldQuest',
          productVersion: '0.1',
          devicePixelRatio: Math.min(window.devicePixelRatio, 2), // caps GPU cost on phones
        }, setProgress);
        if (cancelled) { void instance.Quit(); return; }
        instance.SendMessage('WebBridge', 'ReceiveHandoff', JSON.stringify(handoff));
        canvas.current?.focus(); // Unity reads keys only while its canvas has focus
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : String(e));
      }
    })();

    return () => {
      cancelled = true;
      window.removeEventListener(UNITY_EVENT, onMessage);
      void instance?.Quit().catch(() => {});
      script.remove();
    };
  }, [handoff]);

  const leave = () => onExit({ v: 1, missionId: handoff.missionId, status: 'exited', checkpoint: handoff.checkpoint, completedObjectives: handoff.completedObjectives });

  return (
    <div className="absolute inset-0 bg-[#0b1324]" data-testid="unity-mission">
      {/* tabIndex lets Unity take keyboard focus; Phaser input is disabled while this is mounted */}
      <canvas ref={canvas} id="unity-canvas" tabIndex={-1} className="h-full w-full" style={{ touchAction: 'none' }} />
      {(error || progress < 1) && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-[#17233D]/95 p-4 text-center">
          <p role={error ? 'alert' : 'status'} className={`font-mono text-sm ${error ? 'text-shield-rose' : 'animate-pulse text-shield-cyan'}`}>
            {error ? `Could not start the minimart mission: ${error}` : `Loading minimart… ${Math.round(progress * 100)}%`}
          </p>
          <button onClick={leave} className="rounded-lg border border-shield-cardBorder px-3 py-2 text-sm text-shield-cream hover:border-shield-cyan/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-shield-cyan">
            Return to neighbourhood
          </button>
        </div>
      )}
    </div>
  );
};
