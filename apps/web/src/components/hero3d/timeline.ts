/** Deterministic 21-second gameplay concept loop shared by the 3D scene and the HUD. */
export const LOOP_SECONDS = 21;

export type Phase = 'explore' | 'discover' | 'npc' | 'decide' | 'ripple' | 'reset';

export const PHASES: { id: Phase; start: number }[] = [
  { id: 'explore', start: 0 },
  { id: 'discover', start: 5 },
  { id: 'npc', start: 9 },
  { id: 'decide', start: 13.5 },
  { id: 'ripple', start: 17.5 },
  { id: 'reset', start: 20.2 },
];

export function getPhase(t: number): Phase {
  const time = ((t % LOOP_SECONDS) + LOOP_SECONDS) % LOOP_SECONDS;
  let phase: Phase = 'explore';
  for (const p of PHASES) if (time >= p.start) phase = p.id;
  return phase;
}

export const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
/** Smoothstep progress of t between a and b. */
export const ease = (t: number, a: number, b: number) => {
  const x = clamp01((t - a) / (b - a));
  return x * x * (3 - 2 * x);
};
export const lerp = (a: number, b: number, k: number) => a + (b - a) * k;
