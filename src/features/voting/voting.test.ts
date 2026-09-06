import { test } from 'node:test';
import assert from 'node:assert/strict';
import { useSessionStore } from '../../stores/sessionStore';
import { GROUP_CHAT_JOB, GROUP_DECISIONS } from './data';
import { nextPeerRole, peerRoleForRound, PEER_ROLES } from './peer-roles-data';

test('group decision awards Beacon progress and 40 tokens on debrief; replays are strictly idempotent', () => {
  const store = useSessionStore;
  store.getState().reset();

  const firstAward = store.getState().completeGroupDecision(GROUP_CHAT_JOB.nodeId, GROUP_CHAT_JOB.guardianId);
  assert.deepEqual(firstAward, {
    guardianAward: 'MET',
    tokensAwarded: 40,
  });
  assert.deepEqual(store.getState().guardians, ['beacon']);
  assert.equal(store.getState().guardianProgress.beacon, 1);
  assert.deepEqual(store.getState().completed, [GROUP_CHAT_JOB.nodeId]);
  assert.equal(store.getState().shieldTokens, 40);

  // Replay / second completion: participation already recorded, no duplicate tokens or progression
  const replayAward = store.getState().completeGroupDecision(GROUP_CHAT_JOB.nodeId, GROUP_CHAT_JOB.guardianId);
  assert.deepEqual(replayAward, {
    guardianAward: null,
    tokensAwarded: 0,
  });
  assert.equal(store.getState().shieldTokens, 40);
  assert.equal(store.getState().guardianProgress.beacon, 1);

  store.getState().reset();
});

test('peer roles cycle deterministically across facilitated rounds', () => {
  assert.equal(PEER_ROLES.length, 3);

  // Round 0 opens on Evidence Checker
  assert.equal(peerRoleForRound(0).id, 'role_evidence_checker');
  assert.equal(nextPeerRole(0).id, 'role_peer_supporter');

  // Round 1 rotates to Peer Supporter
  assert.equal(peerRoleForRound(1).id, 'role_peer_supporter');
  assert.equal(nextPeerRole(1).id, 'role_safety_lead');

  // Round 2 rotates to Safety Lead
  assert.equal(peerRoleForRound(2).id, 'role_safety_lead');
  assert.equal(nextPeerRole(2).id, 'role_evidence_checker');

  // Round 3 cycles back to Evidence Checker
  assert.equal(peerRoleForRound(3).id, 'role_evidence_checker');
});

test('authored group decision distributions are valid and sum to 100 percent', () => {
  assert.ok(GROUP_DECISIONS.length > 0);
  for (const scenario of GROUP_DECISIONS) {
    const firstVoteSum = scenario.options.reduce((sum, opt) => sum + opt.simulatedFirstVotePct, 0);
    const secondVoteSum = scenario.options.reduce((sum, opt) => sum + opt.simulatedSecondVotePct, 0);

    assert.equal(firstVoteSum, 100, `First vote percentages must total 100 for ${scenario.id}`);
    assert.equal(secondVoteSum, 100, `Second vote percentages must total 100 for ${scenario.id}`);

    assert.ok(scenario.factors.length > 0);
    for (const factor of scenario.factors) {
      assert.ok(factor.simulatedSharePct > 0 && factor.simulatedSharePct <= 100);
      assert.ok(factor.label.length > 0);
    }
  }
});
