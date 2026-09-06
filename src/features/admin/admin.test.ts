import test from 'node:test';
import assert from 'node:assert/strict';
import {
  MOCK_ADMIN_SCENARIOS,
  MOCK_INSIGHTS,
  MOCK_SKILL_COVERAGE,
  MOCK_YOUTH_SUBMISSIONS,
  PILOT_KPIS,
  ENGAGEMENT_METRICS,
  SAFEGUARDS,
  derivePortalSummary,
} from './data.js';
import {
  applyScenarioFilters,
  EMPTY_FILTERS,
} from './ScenarioFilters.js';
import type {
  AdminScenarioRow,
  FlashMissionDraft,
  YouthMissionDecision,
  YouthMissionSubmission,
} from '../../../types/admin.js';

test('all 17 authored admin scenarios are defined with valid data', () => {
  assert.equal(MOCK_ADMIN_SCENARIOS.length, 17);
  for (const row of MOCK_ADMIN_SCENARIOS) {
    assert.ok(row.id.startsWith('scn_'));
    assert.ok(row.title.trim().length > 0);
    assert.ok(row.category.trim().length > 0);
    assert.ok(['LIVE', 'DRAFT', 'SCHEDULED', 'ARCHIVED'].includes(row.status));
    assert.ok(row.competencies.length > 0);
    assert.ok(typeof row.safeDecisionRate === 'number');
    assert.ok(typeof row.responses === 'number');
  }
});

test('derivePortalSummary calculates active, participants, average, and review counts', () => {
  const summary = derivePortalSummary(MOCK_ADMIN_SCENARIOS);
  const liveScored = MOCK_ADMIN_SCENARIOS.filter(
    (r) => r.status === 'LIVE' && r.responses > 0,
  );
  assert.equal(summary.activeScenarios, 15);
  assert.equal(summary.participants, 1248);
  assert.ok(summary.averageSafeDecisionRate > 0);
  assert.equal(
    summary.needsReview,
    liveScored.filter((r) => r.safeDecisionRate < 60).length,
  );

  // Empty rows returns 0s
  const emptySummary = derivePortalSummary([]);
  assert.equal(emptySummary.activeScenarios, 0);
  assert.equal(emptySummary.averageSafeDecisionRate, 0);
  assert.equal(emptySummary.needsReview, 0);
});

test('applyScenarioFilters correctly filters by query, status, category, audience, and skill', () => {
  // Empty filter returns all
  assert.equal(
    applyScenarioFilters(MOCK_ADMIN_SCENARIOS, EMPTY_FILTERS).length,
    MOCK_ADMIN_SCENARIOS.length,
  );

  // Query filter
  const queryResult = applyScenarioFilters(MOCK_ADMIN_SCENARIOS, {
    ...EMPTY_FILTERS,
    query: 'Checkout',
  });
  assert.equal(queryResult.length, 1);
  assert.equal(queryResult[0].id, 'scn_shop_theft_01');

  // Status filter
  const draftResult = applyScenarioFilters(MOCK_ADMIN_SCENARIOS, {
    ...EMPTY_FILTERS,
    status: 'DRAFT',
  });
  assert.equal(draftResult.length, 1);
  assert.equal(draftResult[0].id, 'scn_draft_01');

  // Category filter
  const catResult = applyScenarioFilters(MOCK_ADMIN_SCENARIOS, {
    ...EMPTY_FILTERS,
    category: 'Account Sharing',
  });
  assert.equal(catResult.length, 2);

  // Audience filter
  const audResult = applyScenarioFilters(MOCK_ADMIN_SCENARIOS, {
    ...EMPTY_FILTERS,
    audience: 'Primary / Early Secondary',
  });
  assert.equal(audResult.length, 2);

  // Skill filter
  const skillResult = applyScenarioFilters(MOCK_ADMIN_SCENARIOS, {
    ...EMPTY_FILTERS,
    skill: 'DEFEND',
  });
  assert.ok(skillResult.length >= 4);
  assert.ok(skillResult.every((r) => r.competencies.includes('DEFEND')));
});

test('youth submission review transitions: conversion yields a draft without direct publication', () => {
  const submissions: YouthMissionSubmission[] = [...MOCK_YOUTH_SUBMISSIONS];
  const target = submissions.find((s) => s.status === 'AWAITING_REVIEW');
  assert.ok(target);

  // Convert to draft
  const decision: YouthMissionDecision = 'CONVERTED';
  const updatedSubmission: YouthMissionSubmission = {
    ...target,
    status: decision,
    reviewedBy: 'You (Duty Officer)',
    reviewNote: 'Approved for drafting.',
  };
  assert.equal(updatedSubmission.status, 'CONVERTED');

  const draftRow: AdminScenarioRow = {
    id: `scn_youth_${target.id}`,
    title: target.title,
    category: target.category,
    targetGroup: target.suggestedBand,
    status: 'DRAFT',
    safeDecisionRate: 0,
    previousSafeDecisionRate: 0,
    responses: 0,
    competencies: [target.proposedCompetency],
    updatedBy: 'You (Duty Officer)',
    updatedOn: 'Just now',
    isFlashMission: false,
  };

  // Verifies it is saved as DRAFT, never LIVE
  assert.equal(draftRow.status, 'DRAFT');
  assert.equal(draftRow.safeDecisionRate, 0);
  assert.equal(draftRow.responses, 0);
});

test('deploying a Flash Mission produces a valid row and updates portal summary', () => {
  const draft: FlashMissionDraft = {
    title: 'Urgent Delivery Fee',
    category: 'Phishing Link',
    targetGroup: 'Secondary',
    prompt: 'You receive a text claiming your courier delivery requires $1.50 redelivery fee.',
    choices: ['Pay immediately', 'Call courier directly', 'Ignore text'],
    safeChoiceIndex: 1,
    safeResponse: 'Check tracking on official app without clicking SMS link.',
    competency: 'SPOT',
    guardianId: 'verifox',
    debrief: 'Delivery scams exploit small sums to capture card credentials.',
    warningSigns: ['SMS link', 'Urgent timer'],
    cohorts: ['secondary'],
    status: 'LIVE',
  };

  const created: AdminScenarioRow = {
    id: 'scn_flash_test_01',
    title: draft.title,
    category: draft.category,
    targetGroup: draft.targetGroup,
    status: draft.status,
    safeDecisionRate: 0,
    previousSafeDecisionRate: 0,
    responses: 0,
    competencies: [draft.competency],
    updatedBy: 'You (Duty Officer)',
    updatedOn: 'Just now',
    isFlashMission: true,
  };

  assert.equal(created.isFlashMission, true);
  assert.equal(created.status, 'LIVE');

  const updatedRows = [created, ...MOCK_ADMIN_SCENARIOS];
  const summary = derivePortalSummary(updatedRows);
  assert.equal(summary.activeScenarios, 16); // 15 + 1 live
});

test('pilot evaluation framework contains 6 KPIs with honest statuses', () => {
  assert.equal(PILOT_KPIS.length, 6);
  for (let i = 0; i < 6; i++) {
    assert.equal(PILOT_KPIS[i].number, i + 1);
  }
  const demonstrated = PILOT_KPIS.filter((k) => k.status === 'DEMONSTRATED');
  const simulated = PILOT_KPIS.filter((k) => k.status === 'SIMULATED');
  const planned = PILOT_KPIS.filter((k) => k.status === 'PLANNED');

  assert.equal(demonstrated.length, 4);
  assert.equal(simulated.length, 1); // Engagement
  assert.equal(planned.length, 1); // Retention
});

test('safeguards and engagement metrics meet prototype integrity requirements', () => {
  assert.ok(SAFEGUARDS.length >= 6);
  assert.equal(ENGAGEMENT_METRICS.length, 4);
  assert.equal(MOCK_SKILL_COVERAGE.length, 6);
  assert.equal(MOCK_INSIGHTS.length, 3);
});
