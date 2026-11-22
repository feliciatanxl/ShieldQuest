import assert from 'node:assert/strict'
import { test } from 'node:test'
import { BAY, blockPlan, coversCharacter, DECK, hiddenDepth, ROOF, STOREY, upperOutline } from '../../../src/game/hdbModules'
import { PILLAR, voidDeckLayout } from '../../../src/game/hdbLayout'
import { sceneryCollisions } from '../../../src/game/collisions'
import { canStand } from '../../../src/game/isometric'
import { NEIGHBOURHOOD_SIZE } from '../../../src/game/locations'

const spec = (floors: number, w = 8, d = 2) => ({ x: 10, y: 10, w, d, properties: { voidDeck: true, bay: BAY, floors } })

test('Modular block: bays, end walls and roof stack to the configured length and floor count', () => {
  const plan = blockPlan(spec(4))
  assert.equal(plan.alongX, true)
  assert.equal(plan.bays, 4)
  const count = (kind: string) => plan.modules.filter(m => m.kind === kind).length
  assert.equal(count('bay'), 4 * 4, 'one bay module per bay per storey')
  assert.equal(count('end'), 4, 'one end-wall module per storey')
  assert.equal(count('roof'), 4, 'one roof module per bay')
  // Storey s of every bay sits exactly s storeys above the void deck, and the roof caps the top storey.
  for (const m of plan.modules.filter(m => m.kind === 'bay')) assert.equal(m.z, DECK + m.storey * STOREY)
  assert.ok(plan.modules.filter(m => m.kind === 'bay').every(m => m.t % BAY === 0), 'bays sit on the bay grid')
  assert.equal(plan.top, DECK + 4 * STOREY + ROOF)
})

test('Modular block: orientation follows the long axis, and floor count is honoured', () => {
  const alongY = blockPlan(spec(12, 2, 8))
  assert.equal(alongY.alongX, false)
  assert.equal(alongY.modules.filter(m => m.kind === 'bay').length, 12 * 4)
  assert.equal(Math.max(...alongY.modules.map(m => m.storey)), 12, 'the roof sits on storey 12')
})

test('Modular block: height budget. A 4-storey block hides about 12 tiles behind it, a 12-storey block 28', () => {
  assert.equal(hiddenDepth(blockPlan(spec(4))), 12)
  assert.equal(hiddenDepth(blockPlan(spec(12))), 28)
})

test('Modular block: characters are covered only where the upper floors really hide them', () => {
  const b = spec(4), plan = blockPlan(b), outline = upperOutline(b, plan)
  // Standing just inside the open front of the void deck: the 104 px headroom clears a 60 px character.
  assert.equal(coversCharacter(b, outline, { x: 14, y: 11.7 }), false)
  // At the back of the void deck the slab above hides the character's head.
  assert.equal(coversCharacter(b, outline, { x: 14, y: 10.3 }), true)
  // Right behind the block: hidden. In front of either visible wall: never.
  assert.equal(coversCharacter(b, outline, { x: 14, y: 9 }), true)
  assert.equal(coversCharacter(b, outline, { x: 14, y: 12.5 }), false)
  assert.equal(coversCharacter(b, outline, { x: 18.5, y: 11 }), false)
  // Far enough behind to be clear of even the roof.
  assert.equal(coversCharacter(b, outline, { x: 14 - hiddenDepth(plan) - 2, y: 10 - hiddenDepth(plan) - 2 }), false)
})

test('Modular block: void-deck pillars stand on the bay lines and leave player-wide gaps', () => {
  const b = spec(4), deck = voidDeckLayout(b)
  const front = deck.pillars.filter(p => p.y > b.y + 1).map(p => p.x - b.x).sort((a, c) => a - c)
  assert.equal(front.length, 5, 'a pillar on each of the five bay lines of a four-bay block')
  front.forEach((x, i) => assert.ok(Math.abs(x + PILLAR / 2 - Math.min(Math.max(i * BAY, PILLAR / 2), 8 - PILLAR / 2)) < 1e-9))
  for (let i = 1; i < front.length; i++) assert.ok(front[i] - front[i - 1] - PILLAR > .34)
  const solid = sceneryCollisions([{ ...b, kind: 'block' }])
  assert.ok(canStand({ x: 11, y: 11 }, NEIGHBOURHOOD_SIZE, solid), 'open floor between the bays')
})
