import assert from 'node:assert/strict';
import { test } from 'node:test';

import { GATE_STIPEND, TRACK, TRACK_LENGTH, securingSpaces } from './board.ts';
import { FALLBACK_EDGE, LAYOUT, fallbackCell } from './geometry.ts';
import { SCENARIO_BY_ID, SCENARIOS } from './content/scenarios.ts';
import { GUARDIANS } from './content/guardians.ts';
import { COSMETICS, DEFAULT_COSMETIC, equippedCosmetic } from './content/cosmetics.ts';
import { achievementsFor, earnedCount } from './achievements.ts';
import {
  applyCard,
  applyDecision,
  applyRoll,
  buildUpgrade,
  createGame,
  dueConsequences,
  RUN_LENGTH,
  isSessionCode,
  makeRng,
  makeSessionCode,
  normaliseSessionCode,
  SESSION_CODE_LENGTH,
  markCelebrated,
  resolveConsequence,
  buyCosmetic,
  equipCosmetic,
  migrateSave,
  resolveLanding,
  rollDice,
  sessionReport,
  TOKEN_AWARD,
  turnsRemaining,
} from './engine.ts';
import type { GameState } from './types.ts';

const newGame = (band: GameState['band'] = 'B17_24') =>
  createGame({ handle: 'Tester', band, sessionCode: 'TESTER' });

/* ------------------------------------------------------------------ */
/* Board shape                                                         */
/* ------------------------------------------------------------------ */

test('the track is 28 spaces with a gate on each corner', () => {
  assert.equal(TRACK.length, TRACK_LENGTH);
  const gates = TRACK.filter((s) => s.kind === 'GATE');
  assert.equal(gates.length, 4);
  assert.deepEqual(
    gates.map((g) => g.index),
    [0, 7, 14, 21],
  );
  assert.ok(gates.every((g) => g.corner));
});

test('every district carries the full loop', () => {
  for (const districtId of ['school', 'retail', 'digital', 'community'] as const) {
    const spaces = TRACK.filter((s) => s.districtId === districtId);
    assert.equal(spaces.length, 7, `${districtId} should have 7 spaces`);
    const kinds = new Set(spaces.map((s) => s.kind));
    assert.ok(kinds.has('GUARDIAN'), `${districtId} needs a Guardian checkpoint`);
    assert.ok(kinds.has('COMMUNITY'), `${districtId} needs a community space`);
    assert.ok(kinds.has('CLUE'), `${districtId} needs a clue space`);
    assert.ok(
      spaces.some((s) => s.kind === 'MISSION' || s.kind === 'PEER_SHIELD'),
      `${districtId} needs at least one decision space`,
    );
  }
});

test('every scenario referenced by the board exists', () => {
  for (const space of TRACK) {
    if (!space.scenarioId) continue;
    assert.ok(SCENARIO_BY_ID[space.scenarioId], `missing scenario ${space.scenarioId}`);
  }
});

test('geometry produces one unique fallback cell per space', () => {
  assert.equal(LAYOUT.length, TRACK_LENGTH);
  const seen = new Set<string>();
  for (let i = 0; i < TRACK_LENGTH; i += 1) {
    const cell = fallbackCell(i);
    assert.ok(cell.col >= 1 && cell.col <= FALLBACK_EDGE);
    assert.ok(cell.row >= 1 && cell.row <= FALLBACK_EDGE);
    seen.add(`${cell.col},${cell.row}`);
  }
  assert.equal(seen.size, TRACK_LENGTH, 'two spaces landed on the same fallback cell');
});

/* ------------------------------------------------------------------ */
/* Content rules the proposal commits to                               */
/* ------------------------------------------------------------------ */

test('money-mule and job-scam content is never offered to the youngest band', () => {
  for (const id of ['scn_easy_money', 'scn_job_scam', 'scn_cover_for_me']) {
    assert.ok(!SCENARIO_BY_ID[id]!.bands.includes('B10_13'), `${id} must not target 10-13`);
  }
});

test('every scenario offers at least one safe option and a risky one that pays first', () => {
  for (const scenario of SCENARIOS) {
    const safe = scenario.choices.filter((c) => c.outcome === 'SAFE');
    const risky = scenario.choices.filter((c) => c.outcome === 'RISKY');
    assert.ok(safe.length >= 1, `${scenario.id} needs a safe option`);
    assert.ok(risky.length >= 1, `${scenario.id} needs a risky option`);
    for (const choice of risky) {
      const safest = Math.max(...safe.map((c) => c.immediate.deltas.coins ?? 0));
      const paid = choice.immediate.deltas.coins ?? 0;
      // Peer Shield scenarios can cost resilience instead of paying coins.
      if (paid > 0) {
        assert.ok(
          paid > safest,
          `${scenario.id}: the risky option must pay more up front than the safe one`,
        );
      }
    }
  }
});

test('a delayed consequence always costs more than the reward it reversed', () => {
  for (const scenario of SCENARIOS) {
    for (const choice of scenario.choices) {
      if (!choice.delayed) continue;
      const gained = choice.immediate.deltas.coins ?? 0;
      const lost = Math.abs(choice.delayed.deltas.coins ?? 0);
      assert.ok(lost >= gained, `${scenario.id}/${choice.id}: reversal must recover the reward`);
      assert.ok(
        choice.delayed.warningSigns.length > 0,
        `${scenario.id}/${choice.id}: a consequence must explain the signals`,
      );
      assert.ok(choice.delayed.saferResponse.length > 0);
    }
  }
});

/* ------------------------------------------------------------------ */
/* Dice and movement                                                   */
/* ------------------------------------------------------------------ */

test('a seeded roll is reproducible and always 2-12', () => {
  const first = Array.from({ length: 20 }, (_, i) => rollDice(makeRng(i)));
  const second = Array.from({ length: 20 }, (_, i) => rollDice(makeRng(i)));
  assert.deepEqual(first, second);
  for (const roll of first) {
    assert.ok(roll.total >= 2 && roll.total <= 12);
    assert.equal(roll.isDouble, roll.a === roll.b);
  }
});

test('moving pays the stipend once per gate crossed', () => {
  const state = newGame();
  const {
    state: moved,
    path,
    passedGate,
  } = applyRoll(state, { a: 4, b: 3, total: 7, isDouble: false });
  assert.equal(moved.position, 7);
  assert.equal(path.length, 7);
  assert.ok(passedGate);
  assert.equal(moved.stats.coins, state.stats.coins + GATE_STIPEND);
  assert.equal(moved.turn, 1);
});

test('a double owes an extra roll', () => {
  const state = newGame();
  const { state: moved } = applyRoll(state, { a: 3, b: 3, total: 6, isDouble: true });
  assert.equal(moved.rollsOwed, 1);
});

test('a full lap increments the lap counter exactly once', () => {
  let state = newGame();
  for (let i = 0; i < 4; i += 1) {
    state = applyRoll(state, { a: 3, b: 4, total: 7, isDouble: false }).state;
  }
  assert.equal(state.position, 0);
  assert.equal(state.lap, 1);
});

/* ------------------------------------------------------------------ */
/* The Delayed Consequence Engine                                      */
/* ------------------------------------------------------------------ */

const easyMoneySpace = TRACK.find((s) => s.scenarioId === 'scn_easy_money')!;
const easyMoney = SCENARIO_BY_ID['scn_easy_money']!;

test('the risky choice pays immediately and hides its cost', () => {
  const state = newGame();
  const result = applyDecision(state, easyMoneySpace, easyMoney, 'ch_accept');
  assert.equal(result.state.stats.coins, state.stats.coins + 200);
  assert.equal(result.scheduled, true);
  assert.equal(result.state.pending.length, 1);
  // Nothing about the eventual cost has touched the visible stats yet.
  assert.equal(result.state.stats.trust, state.stats.trust);
  assert.equal(result.state.stats.risk, state.stats.risk);
});

test('a consequence stays silent until its turn arrives, then reverses the reward', () => {
  let state = applyDecision(newGame(), easyMoneySpace, easyMoney, 'ch_accept').state;
  const coinsAfterReward = state.stats.coins;
  assert.equal(dueConsequences(state).length, 0, 'must not fire on the turn it was taken');

  state = { ...state, turn: state.turn + 1 };
  assert.equal(dueConsequences(state).length, 0, 'must not fire one turn early');

  state = { ...state, turn: state.turn + 1 };
  const due = dueConsequences(state);
  assert.equal(due.length, 1);

  const { state: after, spentShortfall } = resolveConsequence(state, due[0]!.id);
  assert.equal(spentShortfall, 0);
  assert.equal(after.stats.coins, coinsAfterReward - 200);
  assert.ok(after.stats.trust < state.stats.trust);
  assert.ok(after.stats.risk > state.stats.risk);
  assert.equal(after.pending.length, 0);
});

test('a reward already spent is charged to trust instead of coins', () => {
  let state = applyDecision(newGame(), easyMoneySpace, easyMoney, 'ch_accept').state;
  // Spend everything before the bill arrives.
  state = { ...state, stats: { ...state.stats, coins: 40 }, turn: state.turn + 2 };
  const trustBefore = state.stats.trust;
  const { state: after, spentShortfall } = resolveConsequence(state, dueConsequences(state)[0]!.id);

  assert.equal(spentShortfall, 160);
  assert.equal(after.stats.coins, 0, 'it can only take what is there');
  assert.equal(after.stats.trust, trustBefore - 20 - 5, 'the shortfall costs extra trust');
});

test('the safe choice carries no hidden cost at all', () => {
  const result = applyDecision(newGame(), easyMoneySpace, easyMoney, 'ch_reject');
  assert.equal(result.scheduled, false);
  assert.equal(result.state.pending.length, 0);
  assert.equal(result.outcome, 'SAFE');
});

/* ------------------------------------------------------------------ */
/* Guardians are earned, never granted                                 */
/* ------------------------------------------------------------------ */

test('rolling, passing gates and buying upgrades never move a Guardian', () => {
  let state = newGame();
  const before = { ...state.guardianProgress };
  for (let i = 0; i < 12; i += 1) {
    state = applyRoll(state, rollDice(makeRng(i))).state;
  }
  state = { ...state, stats: { ...state.stats, coins: 5000 } };
  state = buildUpgrade(state, 'school').state;
  state = buildUpgrade(state, 'school').state;
  assert.deepEqual(state.guardianProgress, before);
  assert.deepEqual(state.metGuardians, []);
});

test('a Guardian is met only after enough demonstrated decisions', () => {
  const verifox = GUARDIANS.find((g) => g.id === 'verifox')!;
  let state = newGame();
  let awardedOn = -1;

  for (let i = 0; i < 6; i += 1) {
    const result = applyDecision(state, easyMoneySpace, easyMoney, 'ch_reject');
    state = result.state;
    if (result.awarded.includes('verifox') && awardedOn < 0) awardedOn = i;
  }

  // 2 points per safe decision, target 6 → met on the third decision (index 2).
  assert.equal(awardedOn, 2);
  assert.ok(state.metGuardians.includes('verifox'));
  assert.ok(state.guardianProgress.verifox >= verifox.target);
});

test('a Guardian is only ever awarded once', () => {
  let state = newGame();
  let awards = 0;
  for (let i = 0; i < 8; i += 1) {
    const result = applyDecision(state, easyMoneySpace, easyMoney, 'ch_reject');
    state = result.state;
    awards += result.awarded.length;
  }
  assert.equal(awards, 1);
});

test('a Guardian trial is worth double, but only for a good answer', () => {
  const trialSpace = TRACK.find((s) => s.kind === 'GUARDIAN' && s.districtId === 'digital')!;
  const card = resolveLanding(newGame(), trialSpace, makeRng(1));
  assert.equal(card.kind, 'CARD');
  if (card.kind !== 'CARD') return;
  assert.equal(card.guardianTrial, true);

  const scoring = card.card.options.find((o) => o.guardianId && o.outcome === 'SAFE');
  if (!scoring) return;
  const result = applyCard(newGame(), trialSpace, card.card, scoring.id, true);
  assert.equal(result.state.guardianProgress[scoring.guardianId!], 4);
});

/* ------------------------------------------------------------------ */
/* Age banding                                                         */
/* ------------------------------------------------------------------ */

test('a 10-13 session is never shown out-of-band mission content', () => {
  const state = newGame('B10_13');
  const rng = makeRng(7);
  for (const space of TRACK) {
    const landing = resolveLanding(state, space, rng);
    if (landing.kind === 'SCENARIO') {
      assert.ok(
        landing.scenario.bands.includes('B10_13'),
        `${landing.scenario.id} is not approved for 10-13`,
      );
    }
    if (landing.kind === 'CARD') {
      assert.ok(
        landing.card.bands.includes('B10_13'),
        `${landing.card.id} is not approved for 10-13`,
      );
    }
  }
});

/* ------------------------------------------------------------------ */
/* Community upgrades                                                  */
/* ------------------------------------------------------------------ */

test('an upgrade needs coins, and raises trust when built', () => {
  const state = newGame();
  const poor = buildUpgrade({ ...state, stats: { ...state.stats, coins: 10 } }, 'school');
  assert.equal(poor.built, null);
  assert.equal(poor.reason, 'insufficient');

  const rich = buildUpgrade({ ...state, stats: { ...state.stats, coins: 500 } }, 'school');
  assert.ok(rich.built);
  assert.equal(rich.state.districts.school.upgrades, 1);
  assert.equal(rich.state.stats.coins, 500 - rich.built!.cost);
  assert.equal(rich.state.stats.trust, state.stats.trust + rich.built!.trust);
});

test('a district only counts all three upgrades once', () => {
  let state = { ...newGame(), stats: { ...newGame().stats, coins: 5000 } };
  for (let i = 0; i < 5; i += 1) state = buildUpgrade(state, 'retail').state;
  assert.equal(state.districts.retail.upgrades, 3);
  assert.equal(buildUpgrade(state, 'retail').reason, 'complete');
});

/* ------------------------------------------------------------------ */
/* Securing a district, and the report                                 */
/* ------------------------------------------------------------------ */

test('a district is secured by its decision spaces, not by spending', () => {
  let state = newGame();
  const required = securingSpaces('digital');
  for (const space of required) {
    const landing = resolveLanding(state, space, makeRng(space.index));
    if (landing.kind === 'SCENARIO') {
      state = applyDecision(state, space, landing.scenario, landing.scenario.choices[0]!.id).state;
    } else if (landing.kind === 'CARD') {
      state = applyCard(state, space, landing.card, landing.card.options[0]!.id).state;
    }
  }
  assert.ok(state.districts.digital.secured);
  assert.ok(!state.districts.school.secured);
});

test('a bounded run ends, and a double buys exactly one more turn', () => {
  let state = createGame({ handle: 'T', band: 'B17_24', sessionCode: 'TESTER', turnLimit: 3 });
  assert.equal(turnsRemaining(state), 3);

  state = applyRoll(state, { a: 2, b: 5, total: 7, isDouble: false }).state;
  assert.equal(turnsRemaining(state), 2);

  state = applyRoll(state, { a: 4, b: 4, total: 8, isDouble: true }).state;
  assert.equal(turnsRemaining(state), 2, 'a double spends a turn and gives one back');

  state = applyRoll(state, { a: 1, b: 2, total: 3, isDouble: false }).state;
  state = applyRoll(state, { a: 1, b: 2, total: 3, isDouble: false }).state;
  assert.equal(turnsRemaining(state), 0);
});

test('an open run never runs out', () => {
  let state = createGame({ handle: 'T', band: 'B17_24', turnLimit: RUN_LENGTH.OPEN });
  for (let i = 0; i < 30; i += 1) state = applyRoll(state, rollDice(makeRng(i))).state;
  assert.equal(turnsRemaining(state), Number.POSITIVE_INFINITY);
});

test('a district celebration is marked so a reload cannot replay it', () => {
  const state = newGame();
  const marked = markCelebrated(state, 'school');
  assert.ok(marked.districts.school.celebrated);
  assert.equal(markCelebrated(marked, 'school'), marked, 'marking twice is a no-op');
});

test('the session report carries no identifying data', () => {
  const state = applyDecision(newGame(), easyMoneySpace, easyMoney, 'ch_reject').state;
  const report = sessionReport(state);
  const serialised = JSON.stringify(report);
  assert.ok(!serialised.includes('Tester'), 'the handle must not reach the report');
  assert.equal(report.sessionCode, 'TESTER');
  assert.equal(report.decisions, 1);
  assert.equal(report.safeRate, 100);
});

test('a session code is six characters with no vowels', () => {
  for (let i = 0; i < 50; i += 1) {
    const code = makeSessionCode(makeRng(i));
    assert.match(code, /^[BCDFGHJKLMNPQRSTVWXZ23456789]{6}$/);
  }
});

/* ------------------------------------------------------------------ */
/* Shield Tokens                                                       */
/* ------------------------------------------------------------------ */

const peerSpace = TRACK.find((s) => s.scenarioId === 'scn_peer_jayden')!;
const peerScenario = SCENARIO_BY_ID['scn_peer_jayden']!;

test('a decision pays participation credit whatever the player decided', () => {
  const safe = applyDecision(newGame(), easyMoneySpace, easyMoney, 'ch_reject');
  const risky = applyDecision(newGame(), easyMoneySpace, easyMoney, 'ch_accept');

  // The same, on purpose. Tokens are credit for taking part; the reward for
  // deciding well is a Guardian, and that one cannot be spent.
  assert.equal(safe.tokensGained, TOKEN_AWARD.decision);
  assert.equal(risky.tokensGained, TOKEN_AWARD.decision);
  assert.equal(safe.state.tokens, TOKEN_AWARD.decision);
  assert.equal(risky.state.tokens, TOKEN_AWARD.decision);
});

test('protecting a peer pays a top-up, and only when it went well', () => {
  const helped = applyDecision(newGame(), peerSpace, peerScenario, 'pc_help');
  const ignored = applyDecision(newGame(), peerSpace, peerScenario, 'pc_ignore');

  assert.equal(helped.tokensGained, TOKEN_AWARD.decision + TOKEN_AWARD.peerShield);
  assert.equal(ignored.tokensGained, TOKEN_AWARD.decision);
});

test('a scenario pays once however many laps the player walks', () => {
  let state = newGame();
  let paid = 0;
  for (let i = 0; i < 5; i += 1) {
    const result = applyDecision(state, easyMoneySpace, easyMoney, 'ch_reject');
    state = result.state;
    paid += result.tokensGained;
  }
  assert.equal(paid, TOKEN_AWARD.decision);
  assert.equal(state.tokens, TOKEN_AWARD.decision);
});

test('rolls, gate stipends and upgrades never pay a single token', () => {
  let state = { ...newGame(), stats: { ...newGame().stats, coins: 5000 } };
  for (let i = 0; i < 30; i += 1) {
    state = applyRoll(state, rollDice(makeRng(i))).state;
  }
  state = buildUpgrade(state, 'school').state;
  state = buildUpgrade(state, 'school').state;

  assert.equal(state.tokens, 0);
  assert.deepEqual(state.tokenGrants, []);
});

test('securing a district pays for the district, once, and a card pays nothing', () => {
  let state = newGame();
  let paid = 0;

  // Resolve every space that secures the school district. Some are scenarios
  // and some are cards, which is the point: the award is for the district, not
  // for whichever space happened to complete it.
  for (const space of securingSpaces('school')) {
    const scenario = space.scenarioId ? SCENARIO_BY_ID[space.scenarioId] : undefined;
    if (scenario?.bands.includes(state.band)) {
      const result = applyDecision(state, space, scenario, scenario.choices[0]!.id);
      state = result.state;
      paid += result.tokensGained;
      continue;
    }
    const landing = resolveLanding(state, space, makeRng(1));
    assert.equal(landing.kind, 'CARD');
    if (landing.kind !== 'CARD') continue;
    const result = applyCard(state, space, landing.card, landing.card.options[0]!.id, false);
    state = result.state;
    paid += result.tokensGained;
  }

  assert.ok(state.districts.school.secured);
  assert.ok(state.tokenGrants.includes('district:school'));
  assert.ok(paid >= TOKEN_AWARD.district);

  // Walking the district again cannot pay for it a second time.
  const before = state.tokens;
  for (const space of securingSpaces('school')) {
    const landing = resolveLanding(state, space, makeRng(2));
    if (landing.kind !== 'CARD') continue;
    state = applyCard(state, space, landing.card, landing.card.options[0]!.id, false).state;
  }
  assert.equal(state.tokens, before);
});

/* ------------------------------------------------------------------ */
/* Spending                                                            */
/* ------------------------------------------------------------------ */

test('a purchase deducts the tokens and can never overdraw', () => {
  const item = COSMETICS.find((c) => c.cost > 0)!;
  const broke = { ...newGame(), tokens: item.cost - 1 };
  const refused = buyCosmetic(broke, item.id);

  assert.equal(refused.bought, null);
  assert.equal(refused.reason, 'funds');
  assert.equal(refused.state.tokens, item.cost - 1);
  assert.deepEqual(refused.state.unlocked, []);

  const funded = { ...newGame(), tokens: item.cost };
  const bought = buyCosmetic(funded, item.id);

  assert.equal(bought.bought?.id, item.id);
  assert.equal(bought.state.tokens, 0);
  assert.deepEqual(bought.state.unlocked, [item.id]);
  assert.equal(bought.state.equipped, item.id);
});

test('buying a cosmetic changes a colour and a balance, and nothing else', () => {
  const item = COSMETICS.find((c) => c.cost > 0)!;
  const before: GameState = { ...newGame(), tokens: 9999 };
  const after = buyCosmetic(before, item.id).state;

  assert.deepEqual(after.stats, before.stats);
  assert.deepEqual(after.guardianProgress, before.guardianProgress);
  assert.deepEqual(after.metGuardians, before.metGuardians);
  assert.deepEqual(after.districts, before.districts);
  assert.deepEqual(after.decisions, before.decisions);
  assert.equal(after.position, before.position);
  assert.equal(after.turn, before.turn);
});

test('a cosmetic cannot be equipped without owning it, and the default always can', () => {
  const item = COSMETICS.find((c) => c.cost > 0)!;
  const state = newGame();

  assert.equal(equipCosmetic(state, item.id).equipped, null);
  assert.equal(equippedCosmetic(equipCosmetic(state, item.id).equipped).id, DEFAULT_COSMETIC.id);

  const owner = buyCosmetic({ ...state, tokens: 9999 }, item.id).state;
  assert.equal(equipCosmetic(owner, item.id).equipped, item.id);
  assert.equal(equipCosmetic(owner, DEFAULT_COSMETIC.id).equipped, null);
});

/* ------------------------------------------------------------------ */
/* Achievements                                                        */
/* ------------------------------------------------------------------ */

test('an achievement is earned by the run, and there is no way to buy one', () => {
  const fresh = newGame();
  assert.equal(earnedCount(fresh), 0);

  const played = applyDecision(fresh, easyMoneySpace, easyMoney, 'ch_reject').state;
  assert.ok(achievementsFor(played).find((a) => a.id === 'first-call')?.earned);

  // A full purse buys every cosmetic in the catalogue and no achievement.
  let rich: GameState = { ...fresh, tokens: 100000 };
  for (const cosmetic of COSMETICS) rich = buyCosmetic(rich, cosmetic.id).state;
  assert.equal(earnedCount(rich), 0);
});

test('a save written before tokens existed still loads', () => {
  // Exactly what comes back out of localStorage for a run started before the
  // token fields existed: the same object, four keys short.
  const { tokens, tokenGrants, unlocked, equipped, ...older } = newGame();
  void [tokens, tokenGrants, unlocked, equipped];

  const migrated = migrateSave(older as GameState);
  assert.equal(migrated.tokens, 0);
  assert.deepEqual(migrated.tokenGrants, []);
  assert.deepEqual(migrated.unlocked, []);
  assert.equal(migrated.equipped, null);
});

test('a session code survives being read off a projector and typed into a phone', () => {
  // Lowercase, spaced, hyphenated — all of which a room of teenagers will type.
  assert.equal(normaliseSessionCode('ktp4rj'), 'KTP4RJ');
  assert.equal(normaliseSessionCode('KTP 4RJ'), 'KTP4RJ');
  assert.equal(normaliseSessionCode('SQ-KTP4RJ'), 'SQKTP4');
  assert.equal(normaliseSessionCode('ktp4rj-extra'), 'KTP4RJ');

  // Characters that cannot appear in a real code are dropped, not guessed at:
  // the alphabet has no vowels and no 0/1, so O/0 and I/1 never collide.
  assert.equal(normaliseSessionCode('K T P 4 R J !'), 'KTP4RJ');
  assert.equal(normaliseSessionCode(''), '');

  assert.ok(isSessionCode('KTP4RJ'));
  assert.ok(isSessionCode('ktp4rj'));
  assert.ok(!isSessionCode('KTP4R'));
  assert.ok(!isSessionCode(''));
  assert.ok(!isSessionCode('   '));
});

test('a facilitator code and a generated one are the same shape', () => {
  const generated = makeSessionCode(makeRng(7));
  assert.equal(generated.length, SESSION_CODE_LENGTH);
  assert.ok(isSessionCode(generated));
  assert.equal(normaliseSessionCode(generated), generated);

  // A run started with a room code keeps it, character for character: it is the
  // only thing a pre/post response is linked by, so it cannot be rewritten.
  const joined = createGame({ handle: 'Tester', band: 'B14_16', sessionCode: 'KTP4RJ' });
  assert.equal(joined.sessionCode, 'KTP4RJ');
});
