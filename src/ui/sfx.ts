import { useSyncExternalStore } from 'react';

/**
 * Sound and vibration, synthesised rather than shipped.
 *
 * Every effect is built from oscillators and filtered noise at the moment it
 * plays. There are no audio files: nothing to download on a school connection,
 * nothing to cache in the PWA, and nothing that can arrive after the moment it
 * was meant for. The cost is that these are toy sounds — which is the point.
 *
 * One switch covers sound AND vibration. In a room of 25 phones a facilitator
 * needs one thing to ask people to turn off, not two.
 *
 * Browsers only let audio start after a user gesture, so the context is created
 * lazily and resumed on the first press anywhere in the page.
 */

const MUTED_KEY = 'shieldquest.sound-muted.v1';

export type Sfx =
  | 'tap'
  | 'charge'
  | 'roll'
  | 'clack'
  | 'hop'
  | 'land'
  | 'coin'
  | 'safe'
  | 'open'
  | 'consequence'
  | 'fanfare'
  | 'build';

let ctx: AudioContext | null = null;
let master: GainNode | null = null;
let noise: AudioBuffer | null = null;
let muted = readMuted();
const listeners = new Set<() => void>();

function readMuted(): boolean {
  try {
    return localStorage.getItem(MUTED_KEY) === '1';
  } catch {
    return false;
  }
}

function audio(): AudioContext | null {
  if (ctx) return ctx;
  const Ctor =
    window.AudioContext ??
    (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!Ctor) return null;
  ctx = new Ctor();
  master = ctx.createGain();
  master.gain.value = 0.42;
  master.connect(ctx.destination);

  // Half a second of white noise, reused by every rattle, whoosh and thud.
  noise = ctx.createBuffer(1, ctx.sampleRate * 0.5, ctx.sampleRate);
  const data = noise.getChannelData(0);
  for (let i = 0; i < data.length; i += 1) data[i] = Math.random() * 2 - 1;
  return ctx;
}

if (typeof window !== 'undefined') {
  const unlock = () => {
    const context = audio();
    if (context && context.state === 'suspended') void context.resume();
  };
  window.addEventListener('pointerdown', unlock, { capture: true, passive: true });
  window.addEventListener('keydown', unlock, { capture: true, passive: true });
}

/* ------------------------------------------------------------------ */
/* Building blocks                                                     */
/* ------------------------------------------------------------------ */

function tone(
  freq: number,
  at: number,
  length: number,
  {
    type = 'sine',
    gain = 0.3,
    slide = 0,
  }: { type?: OscillatorType; gain?: number; slide?: number } = {},
) {
  if (!ctx || !master) return;
  const osc = ctx.createOscillator();
  const env = ctx.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, at);
  if (slide) osc.frequency.exponentialRampToValueAtTime(Math.max(20, freq + slide), at + length);
  env.gain.setValueAtTime(0.0001, at);
  env.gain.exponentialRampToValueAtTime(gain, at + 0.008);
  env.gain.exponentialRampToValueAtTime(0.0001, at + length);
  osc.connect(env).connect(master);
  osc.start(at);
  osc.stop(at + length + 0.02);
}

function hiss(
  at: number,
  length: number,
  {
    freq = 2000,
    to,
    q = 1,
    gain = 0.25,
    type = 'bandpass',
  }: { freq?: number; to?: number; q?: number; gain?: number; type?: BiquadFilterType } = {},
) {
  if (!ctx || !master || !noise) return;
  const src = ctx.createBufferSource();
  src.buffer = noise;
  const filter = ctx.createBiquadFilter();
  filter.type = type;
  filter.Q.value = q;
  filter.frequency.setValueAtTime(freq, at);
  if (to) filter.frequency.exponentialRampToValueAtTime(to, at + length);
  const env = ctx.createGain();
  env.gain.setValueAtTime(0.0001, at);
  env.gain.exponentialRampToValueAtTime(gain, at + 0.01);
  env.gain.exponentialRampToValueAtTime(0.0001, at + length);
  src.connect(filter).connect(env).connect(master);
  src.start(at, Math.random() * 0.2);
  src.stop(at + length + 0.02);
}

function buzz(pattern: number | number[]) {
  try {
    navigator.vibrate?.(pattern);
  } catch {
    /* Not supported, or blocked by the browser. Sound carries it alone. */
  }
}

/* ------------------------------------------------------------------ */
/* The sounds                                                          */
/* ------------------------------------------------------------------ */

/**
 * `step` lets repeated sounds climb: the hop pitch rises with each space the
 * piece passes, and a charge rises as it fills, so a sequence has a shape
 * instead of being one sample played again.
 */
export function play(name: Sfx, step = 0) {
  if (muted) return;
  const context = audio();
  if (!context || context.state !== 'running') return;
  const t = context.currentTime + 0.005;

  switch (name) {
    case 'tap':
      tone(620, t, 0.06, { type: 'triangle', gain: 0.18 });
      break;

    case 'charge':
      tone(260 + step * 70, t, 0.07, { type: 'square', gain: 0.05 });
      buzz(8);
      break;

    case 'roll':
      // Dice rattling in a cupped hand: a run of short, uneven clicks.
      for (let i = 0; i < 9; i += 1) {
        hiss(t + i * 0.055 + Math.random() * 0.02, 0.04, {
          freq: 1800 + Math.random() * 2200,
          q: 6,
          gain: 0.22,
        });
      }
      buzz([12, 40, 12, 40, 12]);
      break;

    case 'clack':
      hiss(t, 0.05, { freq: 3200, q: 4, gain: 0.35 });
      tone(180, t, 0.08, { type: 'sine', gain: 0.25, slide: -80 });
      hiss(t + 0.09, 0.04, { freq: 2600, q: 4, gain: 0.22 });
      buzz(18);
      break;

    case 'hop':
      tone(420 * Math.pow(1.06, Math.min(step, 12)), t, 0.07, { type: 'triangle', gain: 0.12 });
      break;

    case 'land':
      tone(140, t, 0.16, { type: 'sine', gain: 0.4, slide: -70 });
      hiss(t, 0.1, { freq: 500, q: 0.7, gain: 0.15, type: 'lowpass' });
      buzz(25);
      break;

    case 'coin':
      tone(1320, t, 0.09, { type: 'square', gain: 0.07 });
      tone(1760, t + 0.07, 0.22, { type: 'square', gain: 0.07 });
      break;

    case 'safe':
      [523, 659, 784].forEach((f, i) =>
        tone(f, t + i * 0.08, 0.25, { type: 'triangle', gain: 0.18 }),
      );
      buzz(20);
      break;

    case 'open':
      hiss(t, 0.28, { freq: 400, to: 3200, q: 1.4, gain: 0.14 });
      break;

    case 'consequence':
      // A drop, not a jingle. This is the moment the lesson lands.
      tone(110, t, 0.9, { type: 'sawtooth', gain: 0.16, slide: -60 });
      tone(116, t, 0.9, { type: 'sawtooth', gain: 0.12, slide: -62 });
      hiss(t, 0.5, { freq: 300, q: 0.6, gain: 0.3, type: 'lowpass' });
      buzz([60, 60, 120]);
      break;

    case 'fanfare':
      [523, 659, 784, 1047].forEach((f, i) =>
        tone(f, t + i * 0.09, i === 3 ? 0.55 : 0.2, { type: 'triangle', gain: 0.2 }),
      );
      tone(1568, t + 0.36, 0.5, { type: 'sine', gain: 0.08 });
      buzz([30, 50, 30, 50, 80]);
      break;

    case 'build':
      hiss(t, 0.35, { freq: 250, to: 1400, q: 0.9, gain: 0.18 });
      tone(98, t + 0.3, 0.25, { type: 'sine', gain: 0.45, slide: -40 });
      tone(1175, t + 0.36, 0.3, { type: 'triangle', gain: 0.12 });
      buzz([15, 30, 40]);
      break;
  }
}

/* ------------------------------------------------------------------ */
/* The switch                                                          */
/* ------------------------------------------------------------------ */

export function setMuted(next: boolean) {
  muted = next;
  try {
    localStorage.setItem(MUTED_KEY, next ? '1' : '0');
  } catch {
    /* Storage disabled: the switch still works for this visit. */
  }
  listeners.forEach((listener) => listener());
  if (!next) play('tap');
}

export function useMuted(): boolean {
  return useSyncExternalStore(
    (listener) => {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    () => muted,
  );
}
