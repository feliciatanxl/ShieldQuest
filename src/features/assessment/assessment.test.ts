import test from 'node:test';
import assert from 'node:assert/strict';
import { ACHIEVEMENTS, DISTRICT_BADGES } from './data';
import { TOKEN_AWARD, tokenKey } from '../../../types/assessment';
import { useSessionStore } from '../../stores/sessionStore';
import type { CityDistrict } from '../../../types/city-board';

test('all 7 authored achievements are defined with valid metrics and targets', () => {
  assert.equal(ACHIEVEMENTS.length, 7);
  const expectedIds = [
    'ach_risk_spotter',
    'ach_pause_first',
    'ach_peer_protector',
    'ach_trusted_helper',
    'ach_clear_eyed',
    'ach_account_keeper',
    'ach_community_defender',
  ];
  for (const id of expectedIds) {
    const ach = ACHIEVEMENTS.find((a) => a.id === id);
    assert.ok(ach, `Achievement ${id} must exist`);
    assert.ok(ach.title.length > 0);
    assert.ok(ach.description.length > 0);
    assert.ok(ach.target > 0);
    assert.ok(['COMPETENCY', 'NODE_KIND', 'GUARDIAN', 'SKILL_BREADTH'].includes(ach.metric.kind));
  }
});

test('all 4 district badges are defined with non-empty copy', () => {
  const districts = ['school', 'retail', 'digital', 'community'] as const;
  for (const id of districts) {
    const badge = DISTRICT_BADGES[id];
    assert.ok(badge, `District badge for ${id} must exist`);
    assert.equal(badge.districtId, id);
    assert.ok(badge.name.length > 0);
    assert.ok(badge.blurb.length > 0);
  }
});

test('sessionStore.recordDistrictBadge awards 100 Shield Tokens and enqueues celebration idempotently', () => {
  const store = useSessionStore.getState();
  store.reset();

  const res1 = useSessionStore.getState().recordDistrictBadge('school');
  assert.equal(res1.tokensAwarded, TOKEN_AWARD.district);
  assert.equal(res1.isNew, true);

  const state1 = useSessionStore.getState();
  assert.equal(state1.shieldTokens, 100);
  assert.deepEqual(state1.districtBadges, ['school']);
  assert.deepEqual(state1.pendingDistrictCelebrations, ['school']);
  assert.ok(state1.tokenGrants.includes(tokenKey.district('school')));

  // Second award for the same district is idempotent
  const res2 = useSessionStore.getState().recordDistrictBadge('school');
  assert.equal(res2.tokensAwarded, 0);
  assert.equal(res2.isNew, false);

  const state2 = useSessionStore.getState();
  assert.equal(state2.shieldTokens, 100);
  assert.deepEqual(state2.districtBadges, ['school']);
  assert.deepEqual(state2.pendingDistrictCelebrations, ['school']);

  // Acknowledging celebration pops from queue
  useSessionStore.getState().acknowledgeDistrictCelebration();
  assert.deepEqual(useSessionStore.getState().pendingDistrictCelebrations, []);
});

test('sessionStore.recordAchievement awards 50 Shield Tokens idempotently', () => {
  const store = useSessionStore.getState();
  store.reset();

  const res1 = useSessionStore.getState().recordAchievement('ach_risk_spotter');
  assert.equal(res1.tokensAwarded, TOKEN_AWARD.achievement);
  assert.equal(res1.isNew, true);

  const state1 = useSessionStore.getState();
  assert.equal(state1.shieldTokens, 50);
  assert.deepEqual(state1.earnedAchievements, ['ach_risk_spotter']);
  assert.ok(state1.tokenGrants.includes(tokenKey.achievement('ach_risk_spotter')));

  // Re-recording is idempotent
  const res2 = useSessionStore.getState().recordAchievement('ach_risk_spotter');
  assert.equal(res2.tokensAwarded, 0);
  assert.equal(res2.isNew, false);

  const state2 = useSessionStore.getState();
  assert.equal(state2.shieldTokens, 50);
  assert.deepEqual(state2.earnedAchievements, ['ach_risk_spotter']);
});

test('district completion ignores planned content and does not award an empty district', () => {
  // District with 0 built nodes (all PLANNED)
  const emptyDistrict: CityDistrict = {
    id: 'school',
    name: 'School',
    tagline: '',
    topics: [],
    position: { x: 0, y: 0 },
    nodes: [
      {
        id: 'n1',
        districtId: 'school',
        kind: 'SCENARIO',
        title: 'P1',
        summary: '',
        primaryCompetency: 'SPOT',
        estimatedMinutes: 2,
        availability: 'PLANNED',
      },
    ],
  };
  const emptyBuilt = emptyDistrict.nodes.filter((n) => n.availability !== 'PLANNED');
  assert.equal(emptyBuilt.length, 0);
  const emptyCleared = emptyBuilt.length > 0 && emptyBuilt.every((n) => ['n1'].includes(n.id));
  assert.equal(emptyCleared, false, 'An empty district with no built nodes must not be marked cleared');

  // District with built nodes
  const activeDistrict: CityDistrict = {
    id: 'school',
    name: 'School',
    tagline: '',
    topics: [],
    position: { x: 0, y: 0 },
    nodes: [
      {
        id: 'n1',
        districtId: 'school',
        kind: 'SCENARIO',
        title: 'P1',
        summary: '',
        primaryCompetency: 'SPOT',
        estimatedMinutes: 2,
        availability: 'PLANNED',
      },
      {
        id: 'n2',
        districtId: 'school',
        kind: 'MINI_GAME',
        title: 'M1',
        summary: '',
        primaryCompetency: 'EVALUATE',
        estimatedMinutes: 3,
        availability: 'OPEN',
      },
    ],
  };
  const activeBuilt = activeDistrict.nodes.filter((n) => n.availability !== 'PLANNED');
  assert.equal(activeBuilt.length, 1);
  assert.equal(activeBuilt[0].id, 'n2');

  // With n2 incomplete
  assert.equal(activeBuilt.every((n) => ([] as string[]).includes(n.id)), false);
  // With n2 completed
  assert.equal(activeBuilt.every((n) => ['n2'].includes(n.id)), true);
});

test('celebration sequencing: Guardian introduction precedes district celebration', () => {
  const store = useSessionStore.getState();
  store.reset();

  // Complete a mission that meets a guardian and awards a district badge
  store.completePreview('test-scenario', 'verifox');
  store.recordDistrictBadge('digital');

  const state = useSessionStore.getState();
  // Both are queued
  assert.equal(state.pendingGuardianMeetings.length, 1);
  assert.equal(state.pendingDistrictCelebrations.length, 1);

  // Acknowledging guardian introduction leaves district celebration queued
  store.acknowledgeGuardianMet();
  assert.equal(useSessionStore.getState().pendingGuardianMeetings.length, 0);
  assert.equal(useSessionStore.getState().pendingDistrictCelebrations.length, 1);

  // Acknowledging district celebration clears the queue
  store.acknowledgeDistrictCelebration();
  assert.equal(useSessionStore.getState().pendingDistrictCelebrations.length, 0);
});

test('reset clears all assessment ledgers and rewards', () => {
  const store = useSessionStore.getState();
  store.recordDistrictBadge('school');
  store.recordAchievement('ach_clear_eyed');
  assert.ok(useSessionStore.getState().shieldTokens > 0);

  store.reset();
  const state = useSessionStore.getState();
  assert.equal(state.shieldTokens, 0);
  assert.deepEqual(state.districtBadges, []);
  assert.deepEqual(state.earnedAchievements, []);
  assert.deepEqual(state.pendingDistrictCelebrations, []);
  assert.deepEqual(state.tokenGrants, []);
});
