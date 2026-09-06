import { test } from 'node:test';
import assert from 'node:assert/strict';
import { useSessionStore } from '../../stores/sessionStore';
import { MULE_ENCOUNTER, MULE_PEER_SHIELD } from './data';

test('risky participation pays once; replay can qualify but cannot farm tokens or Guardians', () => {
  const store = useSessionStore;
  store.getState().reset();
  const risky = MULE_ENCOUNTER.choices[0];
  const safe = MULE_ENCOUNTER.choices[2];
  assert.deepEqual(store.getState().completeMission('mule', risky, 'ENCOUNTER'), {
    guardianAward: null,
    tokensAwarded: 40,
  });
  assert.deepEqual(store.getState().guardians, []);
  assert.deepEqual(store.getState().completed, ['mule']);
  assert.deepEqual(store.getState().completeMission('mule', safe, 'ENCOUNTER'), {
    guardianAward: 'MET',
    tokensAwarded: 0,
  });
  assert.deepEqual(store.getState().completeMission('mule', safe, 'ENCOUNTER'), {
    guardianAward: null,
    tokensAwarded: 0,
  });
  assert.equal(store.getState().guardianProgress.verifox, 1);
  assert.equal(store.getState().shieldTokens, 40);
  store.getState().reset();
});

test('Peer Shield grants constructive intervention bonus only once across different safe choices', () => {
  const store = useSessionStore;
  store.getState().reset();
  store.getState().completeMission('peer', MULE_PEER_SHIELD.choices[0], 'PEER_SHIELD');
  assert.equal(
    store.getState().completeMission('peer', MULE_PEER_SHIELD.choices[1], 'PEER_SHIELD')
      .tokensAwarded,
    10,
  );
  assert.equal(
    store.getState().completeMission('peer', MULE_PEER_SHIELD.choices[2], 'PEER_SHIELD')
      .tokensAwarded,
    0,
  );
  assert.deepEqual(store.getState().guardians, ['shieldfin', 'beacon']);
  assert.equal(store.getState().shieldTokens, 50);
  store.getState().reset();
});

test('API samples without explicit qualification record completion without a Guardian', () => {
  useSessionStore.getState().reset();
  useSessionStore.getState().completePreview('sample');
  assert.deepEqual(useSessionStore.getState().completed, ['sample']);
  assert.deepEqual(useSessionStore.getState().guardians, []);
  useSessionStore.getState().reset();
});
