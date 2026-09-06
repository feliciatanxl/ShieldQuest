import test from 'node:test';
import assert from 'node:assert/strict';
import {
  MINI_GAMES,
  WORD_SEARCH_GAME,
  DECODE_CLUE_GAME,
  RISK_OR_SAFE_GAME,
  CLUE_MATCH_GAME,
  WHO_CAN_HELP_GAME,
  WHAT_HAPPENS_NEXT_GAME,
  findMiniGame,
} from './data.js';
import { useSessionStore } from '../../stores/sessionStore.js';
import {
  NODE_COMMUNITY_WHAT_NEXT,
  NODE_COMMUNITY_WHO_CAN_HELP,
  NODE_DECODE,
  NODE_RETAIL_CLUE_MATCH,
  NODE_SCHOOL_RISK_OR_SAFE,
  NODE_WORD_SEARCH,
  findNode,
} from '../city-board/data/world-data.js';

test('all 6 mini-game fixtures are valid and discoverable by ID', () => {
  assert.equal(MINI_GAMES.length, 6);

  const expectedIds = [
    'spot-the-warning-signs',
    'decode-the-clue',
    'risk-or-safe',
    'clue-match',
    'who-can-help',
    'what-happens-next',
  ];

  for (const id of expectedIds) {
    const game = findMiniGame(id);
    assert.ok(game, `Mini-game ${id} should be found`);
    assert.equal(game.id, id);
    assert.ok(game.title.length > 0);
    assert.ok(game.instruction.length > 0);
    assert.ok(game.reward.guardianId);
  }

  assert.equal(DECODE_CLUE_GAME.rounds.length, 2);
  assert.equal(WHAT_HAPPENS_NEXT_GAME.rounds.length, 4);

  assert.equal(findMiniGame('unknown-nonexistent-game'), undefined);
});

test('Word Search grid is 8x8 and all target words match authored coordinates', () => {
  assert.equal(WORD_SEARCH_GAME.grid.length, 8);
  for (const row of WORD_SEARCH_GAME.grid) {
    assert.equal(row.length, 8);
  }

  assert.equal(WORD_SEARCH_GAME.words.length, 6);

  for (const w of WORD_SEARCH_GAME.words) {
    let extracted = '';
    for (let i = 0; i < w.word.length; i++) {
      const r = w.row + w.dRow * i;
      const c = w.col + w.dCol * i;
      assert.ok(r >= 0 && r < 8, `Row out of bounds for ${w.word}: ${r}`);
      assert.ok(c >= 0 && c < 8, `Col out of bounds for ${w.word}: ${c}`);
      extracted += WORD_SEARCH_GAME.grid[r][c];
    }
    assert.equal(extracted, w.word, `Word ${w.word} does not match grid coordinates`);
  }
});

test('Match games have complete pair definitions and matching matchOrder sets', () => {
  // Clue Match
  assert.equal(CLUE_MATCH_GAME.pairs.length, 6);
  assert.equal(CLUE_MATCH_GAME.matchOrder.length, 6);
  const cluePairIds = new Set(CLUE_MATCH_GAME.pairs.map((p) => p.id));
  const clueOrderIds = new Set(CLUE_MATCH_GAME.matchOrder);
  assert.equal(cluePairIds.size, 6);
  assert.deepEqual(cluePairIds, clueOrderIds);

  // Who Can Help?
  assert.equal(WHO_CAN_HELP_GAME.pairs.length, 5);
  assert.equal(WHO_CAN_HELP_GAME.matchOrder.length, 5);
  const helpPairIds = new Set(WHO_CAN_HELP_GAME.pairs.map((p) => p.id));
  const helpOrderIds = new Set(WHO_CAN_HELP_GAME.matchOrder);
  assert.equal(helpPairIds.size, 5);
  assert.deepEqual(helpPairIds, helpOrderIds);
});

test('sessionStore.completeMiniGame awards 25 Shield Tokens and advances Guardian idempotently', () => {
  useSessionStore.getState().reset();
  const initialTokens = useSessionStore.getState().shieldTokens;
  assert.equal(initialTokens, 0);

  // First completion of Spot the Warning Signs (VeriFox)
  const result1 = useSessionStore
    .getState()
    .completeMiniGame(WORD_SEARCH_GAME.nodeId, WORD_SEARCH_GAME.reward.guardianId);

  assert.equal(result1.tokensAwarded, 25);
  assert.equal(result1.guardianAward, 'MET');
  assert.equal(useSessionStore.getState().shieldTokens, 25);
  assert.ok(useSessionStore.getState().completed.includes(WORD_SEARCH_GAME.nodeId));
  assert.ok(useSessionStore.getState().tokenGrants.includes(`mission:${WORD_SEARCH_GAME.nodeId}`));

  // Replay of the same mini-game does not award tokens or advance Guardian again
  const result2 = useSessionStore
    .getState()
    .completeMiniGame(WORD_SEARCH_GAME.nodeId, WORD_SEARCH_GAME.reward.guardianId);

  assert.equal(result2.tokensAwarded, 0);
  assert.equal(result2.guardianAward, null);
  assert.equal(useSessionStore.getState().shieldTokens, 25);

  // A different mini-game awards another 25 tokens and advances its Guardian
  const result3 = useSessionStore
    .getState()
    .completeMiniGame(RISK_OR_SAFE_GAME.nodeId, RISK_OR_SAFE_GAME.reward.guardianId);

  assert.equal(result3.tokensAwarded, 25);
  assert.equal(result3.guardianAward, 'MET');
  assert.equal(useSessionStore.getState().shieldTokens, 50);
});

test('district unlock requirements match authored world rules', () => {
  const nodeDecode = findNode(NODE_DECODE);
  assert.ok(nodeDecode);
  assert.equal(nodeDecode.availability, 'UNLOCK');
  assert.equal(nodeDecode.requiredInDistrict, 1);
  assert.equal(nodeDecode.districtId, 'digital');

  const nodeWhatNext = findNode(NODE_COMMUNITY_WHAT_NEXT);
  assert.ok(nodeWhatNext);
  assert.equal(nodeWhatNext.availability, 'UNLOCK');
  assert.equal(nodeWhatNext.requiredInDistrict, 2);
  assert.equal(nodeWhatNext.districtId, 'community');

  const openNodes = [
    NODE_WORD_SEARCH,
    NODE_SCHOOL_RISK_OR_SAFE,
    NODE_RETAIL_CLUE_MATCH,
    NODE_COMMUNITY_WHO_CAN_HELP,
  ];

  for (const id of openNodes) {
    const node = findNode(id);
    assert.ok(node);
    assert.equal(node.availability, 'OPEN');
  }
});
