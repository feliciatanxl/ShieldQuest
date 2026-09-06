import { test } from 'node:test';
import assert from 'node:assert/strict';
import { advanceGuardian, guardianStanding, initialGuardianState } from './progress';
import { guardians } from './data';
import { useSessionStore } from '../../stores/sessionStore';

test('first meeting is queued once and replay does not increment progress', () => {
  const original = initialGuardianState();
  const first = advanceGuardian(original, 'activity-a', 'echo');
  assert.equal(first.award, 'MET');
  assert.deepEqual(first.state.pendingGuardianMeetings, ['echo']);
  assert.equal(first.state.guardianProgress.echo, 1);
  const replay = advanceGuardian(first.state, 'activity-a', 'echo');
  assert.equal(replay.award, null);
  assert.equal(replay.state.guardianProgress.echo, 1);
  assert.deepEqual(replay.state.pendingGuardianMeetings, ['echo']);
  assert.deepEqual(original, initialGuardianState());
});

test('distinct activities progress only the matching guardian and preserve meeting order', () => {
  const first = advanceGuardian(initialGuardianState(), 'activity-a', 'echo');
  const next = advanceGuardian(first.state, 'activity-b', 'echo');
  assert.equal(next.award, 'PROGRESSED');
  assert.equal(next.state.guardianProgress.echo, 2);
  const third = advanceGuardian(next.state, 'activity-c', 'verifox');
  assert.deepEqual(third.state.guardianProgress, { echo: 2, verifox: 1 });
  assert.deepEqual(third.state.pendingGuardianMeetings, ['echo', 'verifox']);
});

test('levels and progress pips stay consistent at level boundaries', () => {
  const echo = guardians.find((guardian) => guardian.id === 'echo')!;
  assert.deepEqual(guardianStanding(echo, 5), { level: 1, progress: 5, target: 6 });
  assert.deepEqual(guardianStanding(echo, 6), { level: 2, progress: 0, target: 6 });
  assert.deepEqual(guardianStanding(echo, 13), { level: 3, progress: 1, target: 6 });
  for (const count of [-2, NaN, Infinity])
    assert.deepEqual(guardianStanding(echo, count), { level: 1, progress: 0, target: 6 });
});

test('missing activity IDs cannot award progress', () => {
  const original = initialGuardianState();
  assert.equal(advanceGuardian(original, ' ', 'echo').state, original);
});

test('session completion is atomic, dismisses meetings in order and resets the ledger', () => {
  const store = useSessionStore;
  store.getState().reset();
  assert.equal(store.getState().completePreview('a', 'echo'), 'MET');
  assert.equal(store.getState().completePreview('a', 'echo'), null);
  assert.equal(store.getState().completePreview('b', 'verifox'), 'MET');
  assert.deepEqual(store.getState().completed, ['a', 'b']);
  store.getState().acknowledgeGuardianMet();
  assert.deepEqual(store.getState().pendingGuardianMeetings, ['verifox']);
  store.getState().acknowledgeGuardianMet();
  assert.equal(store.getState().guardianNotice, null);
  store.getState().reset();
  assert.deepEqual(store.getState().guardianProgress, {});
  assert.equal(store.getState().completePreview('a', 'echo'), 'MET');
  store.getState().reset();
});
