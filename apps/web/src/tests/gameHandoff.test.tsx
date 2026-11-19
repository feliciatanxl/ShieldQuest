import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { parseHandoff, parseMissionExit, type GameHandoff } from '@shieldquest/shared';
import { UnityMission, UNITY_EVENT } from '../components/UnityMission';
import { ensureSession, saveMissionExit } from '../services/gameSession';

const handoff: GameHandoff = {
  v: 1, sessionId: 'abc-123', avatar: { characterId: 'student' }, engine: 'unity', missionId: 'minimart-clue',
  checkpoint: 'start', completedObjectives: [], returnTo: { scene: 'neighbourhood', x: 1700, y: 900, facing: 'up' },
};

describe('game-state contract', () => {
  it('accepts a valid handoff (object or JSON) and copies it', () => {
    const r = parseHandoff(JSON.stringify(handoff));
    expect(r).toEqual({ ok: true, value: handoff });
  });

  it.each([
    ['version', { ...handoff, v: 2 }, 'unsupported handoff version 2'],
    ['mission outside the pilot', { ...handoff, missionId: 'verify-message' }, 'unknown missionId'],
    ['avatar', { ...handoff, avatar: { characterId: 'dragon' } }, 'invalid avatar'],
    ['injected id', { ...handoff, sessionId: '../../etc' }, 'invalid sessionId'],
    ['return point', { ...handoff, returnTo: { ...handoff.returnTo, x: Infinity } }, 'invalid returnTo'],
  ])('rejects bad %s', (_n, input, error) => {
    expect(parseHandoff(input)).toEqual({ ok: false, error });
  });

  it('rejects garbage JSON and bad exit status', () => {
    expect(parseHandoff('{nope').ok).toBe(false);
    expect(parseMissionExit({ v: 1, missionId: 'minimart-clue', status: 'won', checkpoint: 'a', completedObjectives: [] }).ok).toBe(false);
  });
});

describe('UnityMission container', () => {
  it('shows an error and still lets the player return when the build is missing', async () => {
    const onExit = vi.fn();
    render(<UnityMission handoff={handoff} onExit={onExit} />);
    const script = document.querySelector<HTMLScriptElement>('script[src$="ShieldQuest.loader.js"]');
    expect(script).not.toBeNull(); // loaded on demand, only when mounted
    await act(async () => { script!.onerror?.(new Event('error')); });
    expect(await screen.findByRole('alert')).toHaveTextContent('not available yet');
    fireEvent.click(screen.getByRole('button', { name: /return to neighbourhood/i }));
    expect(onExit).toHaveBeenCalledWith({ v: 1, missionId: 'minimart-clue', status: 'exited', checkpoint: 'start', completedObjectives: [] });
  });

  it('forwards valid Unity exit messages and ignores invalid ones; stops listening on unmount', () => {
    const onExit = vi.fn();
    const { unmount } = render(<UnityMission handoff={handoff} onExit={onExit} />);
    const send = (detail: unknown) => window.dispatchEvent(new CustomEvent(UNITY_EVENT, { detail }));
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    send('{"v":1,"missionId":"minimart-clue","status":"won"}');
    expect(onExit).not.toHaveBeenCalled();
    send('{"v":1,"missionId":"minimart-clue","status":"completed","checkpoint":"ripple","completedObjectives":["talk-jun"]}');
    expect(onExit).toHaveBeenCalledWith(expect.objectContaining({ status: 'completed', completedObjectives: ['talk-jun'] }));
    unmount();
    send('{"v":1,"missionId":"minimart-clue","status":"completed","checkpoint":"x","completedObjectives":[]}');
    expect(onExit).toHaveBeenCalledTimes(1);
    expect(document.querySelector('script[src$="ShieldQuest.loader.js"]')).toBeNull();
  });
});

describe('player session client', () => {
  it('falls back to a local session when the API is unreachable, and skips server saves for it', async () => {
    sessionStorage.clear();
    const s = await ensureSession(vi.fn().mockRejectedValue(new Error('offline')));
    expect(s.sessionId).toMatch(/^local-/);
    expect(s.token).toBeNull();
    const fetcher = vi.fn();
    expect(await saveMissionExit(s, { v: 1, missionId: 'minimart-clue', status: 'exited', checkpoint: 'start', completedObjectives: [] }, fetcher)).toBe(s);
    expect(fetcher).not.toHaveBeenCalled();
  });

  it('surfaces a 409 conflict instead of silently overwriting', async () => {
    const fetcher = vi.fn().mockResolvedValue({ ok: false, status: 409, json: async () => ({ error: { message: 'Progress changed elsewhere; reload and retry' } }) });
    await expect(saveMissionExit({ sessionId: 's1', token: 't', version: 0 }, { v: 1, missionId: 'minimart-clue', status: 'exited', checkpoint: 'start', completedObjectives: [] }, fetcher as unknown as typeof fetch))
      .rejects.toThrow('Progress changed elsewhere');
  });
});
