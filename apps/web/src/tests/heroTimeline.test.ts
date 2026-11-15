import { describe, it, expect } from 'vitest';
import { getPhase, LOOP_SECONDS } from '../components/hero3d/timeline';

describe('hero gameplay timeline', () => {
  it('maps time to Explore → Discover → Interact → Decide → Ripple and loops', () => {
    expect(getPhase(0)).toBe('explore');
    expect(getPhase(6)).toBe('discover');
    expect(getPhase(10)).toBe('npc');
    expect(getPhase(15)).toBe('decide');
    expect(getPhase(18)).toBe('ripple');
    expect(getPhase(20.5)).toBe('reset');
    expect(getPhase(LOOP_SECONDS + 1)).toBe('explore');
  });
});
