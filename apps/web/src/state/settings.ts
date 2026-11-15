// Minimal stand-in for V2's persisted settings store: this site has no in-app motion/quality
// settings, so the ported 3D kit follows the OS reduced-motion preference and auto quality.
export type QualitySetting = 'auto' | 'high' | 'medium' | 'low' | '2d';
export type MotionSetting = 'system' | 'reduced' | 'full';

interface Settings {
  motion: MotionSetting;
  quality: QualitySetting;
}

const STATE: Settings = { motion: 'system', quality: 'auto' };

export function useSettings<T>(select: (s: Settings) => T): T {
  return select(STATE);
}
useSettings.getState = (): Settings => STATE;

export function prefersReducedMotion(motion: MotionSetting): boolean {
  if (motion === 'reduced') return true;
  if (motion === 'full') return false;
  return typeof matchMedia !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches;
}
