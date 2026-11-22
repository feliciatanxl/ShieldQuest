import assert from 'node:assert/strict'
import { test } from 'node:test'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { PILLAR, voidDeckLayout, type BlockSpec } from '../../../src/game/hdbLayout'
import { sceneryCollisions } from '../../../src/game/collisions'
import { DECK } from '../../../src/game/hdbModules'
import { canStand, type Footprint } from '../../../src/game/isometric'
import { HOUSE_DOOR, HOUSE_H_DOOR, HOUSE_I_DOOR, NEIGHBOURHOOD_SIZE, SHOP_DOOR } from '../../../src/game/locations'
import { newSave, readSave, SAVE_KEY, START } from '../../../src/state/saveGame'
import { presets } from '../../../src/state/avatar'

type Prop = Footprint & { kind: string; name: string; properties: Record<string, unknown>; path?: { x: number; y: number }[] }
const dir = path.dirname(fileURLToPath(import.meta.url))
// The same parse as src/game/maps.ts, which imports the map through Vite.
function mapProps(): Prop[] {
  const map = JSON.parse(fs.readFileSync(path.resolve(dir, '../../../src/game/maps/neighbourhood.tmj'), 'utf8'))
  const u = map.tileheight
  return map.layers.flatMap((l: { objects?: unknown[] }) => l.objects ?? []).map((o: {
    type: string; name: string; x: number; y: number; width: number; height: number; polyline?: { x: number; y: number }[]
    properties?: { name: string; value: unknown }[]
  }) => ({
    kind: o.type, name: o.name, x: o.x / u, y: o.y / u, w: o.width / u, d: o.height / u,
    properties: Object.fromEntries((o.properties ?? []).map(p => [p.name, p.value])),
    path: o.polyline?.map(p => ({ x: (o.x + p.x) / u, y: (o.y + p.y) / u })),
  }))
}

/** Flood fill over a 0.25-tile grid: can a player walk from `from` to `to` without passing through scenery? */
function walkable(from: { x: number; y: number }, to: { x: number; y: number }, solid: Footprint[], size = NEIGHBOURHOOD_SIZE, bounds?: Footprint) {
  const step = .25, key = (x: number, y: number) => `${x.toFixed(2)},${y.toFixed(2)}`
  const ok = (x: number, y: number) => canStand({ x, y }, size, solid) && (!bounds || (x >= bounds.x && y >= bounds.y && x <= bounds.x + bounds.w && y <= bounds.y + bounds.d))
  const seen = new Set([key(from.x, from.y)]), queue = [from]
  while (queue.length) {
    const at = queue.pop()!
    if (Math.hypot(at.x - to.x, at.y - to.y) < .2) return true
    for (const [dx, dy] of [[step, 0], [-step, 0], [0, step], [0, -step]]) {
      const x = at.x + dx, y = at.y + dy
      if (seen.has(key(x, y)) || !ok(x, y) || !ok(at.x + dx / 2, at.y + dy / 2)) continue
      seen.add(key(x, y))
      queue.push({ x, y })
    }
  }
  return false
}

const block = (properties: Record<string, unknown>, w = 7.64, d = 2.05): BlockSpec => ({ x: 10, y: 10, w, d, properties: { voidDeck: true, ...properties } })
const inside = (r: Footprint, b: Footprint) => r.x >= b.x - 1e-9 && r.y >= b.y - 1e-9 && r.x + r.w <= b.x + b.w + 1e-9 && r.y + r.d <= b.y + b.d + 1e-9

test('Void deck: pillars and lift core sit inside the block, with player-wide passages', () => {
  const b = block({})
  const deck = voidDeckLayout(b)
  assert.ok(deck.alongX)
  assert.equal(deck.pillars.length, 8, 'two rows of four pillars along a 7.6-tile slab')
  assert.ok([...deck.pillars, ...deck.cores].every(r => inside(r, b)))
  const [core] = deck.cores
  // Passages either side of the core, and gaps between pillars, are wider than a player (0.34 tiles).
  assert.ok(core.y - b.y > PILLAR + .17 * 2 - PILLAR, 'passage behind the core')
  assert.ok(b.y + b.d - (core.y + core.d) >= .34, 'passage in front of the core')
  const xs = [...new Set(deck.pillars.map(p => +p.x.toFixed(3)))].sort((a, c) => a - c)
  for (let i = 1; i < xs.length; i++) assert.ok(xs[i] - xs[i - 1] - PILLAR > .34, 'gap between pillars')
  assert.equal(deck.height, DECK)
})

test('Void deck: a player walks in from the front, under the block and out the back', () => {
  const b = block({})
  const solid = sceneryCollisions([{ ...b, kind: 'block' }])
  const area = { x: 7, y: 7, w: 14, d: 8 }
  assert.ok(walkable({ x: 11.5, y: 13 }, { x: 11.5, y: 8.5 }, solid, NEIGHBOURHOOD_SIZE, area), 'front to back through the deck')
  assert.ok(canStand({ x: 11.5, y: 11 }, NEIGHBOURHOOD_SIZE, solid), 'standing under the upper floors')
  const deck = voidDeckLayout(b)
  for (const r of [...deck.pillars, ...deck.cores]) {
    assert.equal(canStand({ x: r.x + r.w / 2, y: r.y + r.d / 2 }, NEIGHBOURHOOD_SIZE, solid), false, 'pillars and the lift core are solid')
  }
})

test('Void deck: blocks along y, and walled sides, are honoured', () => {
  const alongY = voidDeckLayout(block({}, 2.09, 8.44))
  assert.equal(alongY.alongX, false)
  assert.ok(alongY.pillars.every(p => p.y >= 10 && p.y + p.d <= 18.44 + 1e-9))
  const sealed = block({ closedSides: 'start,end,front,back' })
  const solid = sceneryCollisions([{ ...sealed, kind: 'block' }])
  assert.equal(walkable({ x: 11.5, y: 13 }, { x: 11.5, y: 11 }, solid, NEIGHBOURHOOD_SIZE, { x: 7, y: 7, w: 14, d: 8 }), false, 'no way into a fully walled deck')
  const ends = sceneryCollisions([{ ...block({ closedSides: 'start,end' }), kind: 'block' }])
  assert.ok(walkable({ x: 11.5, y: 13 }, { x: 11.5, y: 11 }, ends, NEIGHBOURHOOD_SIZE, { x: 7, y: 7, w: 14, d: 8 }), 'long sides stay open')
})

test('Block 110 in the map: walkable void deck reachable from the start, residents can walk their routes', () => {
  const props = mapProps()
  const b110 = props.find(p => p.name === 'Block 110')!
  assert.equal(b110.properties.voidDeck, true)
  const solid = sceneryCollisions(props)
  const under = { x: 12.2, y: 35 }, behind = { x: 12.8, y: 33 }
  assert.ok(canStand(under, NEIGHBOURHOOD_SIZE, solid))
  assert.ok(walkable(START, under, solid), 'from the starting plaza into the void deck')
  assert.ok(walkable(under, behind, solid), 'out through the back of the void deck')
  for (const walker of props.filter(p => p.kind === 'walker' && p.path)) {
    const pts = walker.path!
    for (let i = 1; i < pts.length; i++) {
      const a = pts[i - 1], c = pts[i], n = Math.ceil(Math.hypot(c.x - a.x, c.y - a.y) / .1)
      for (let k = 0; k <= n; k++) {
        const at = { x: a.x + (c.x - a.x) * k / n, y: a.y + (c.y - a.y) * k / n }
        assert.ok(canStand(at, NEIGHBOURHOOD_SIZE, solid), `${walker.name} is blocked at ${at.x.toFixed(1)},${at.y.toFixed(1)}`)
      }
    }
  }
})

test('Void deck: saves made under or near Block 110 load, and a spot inside a pillar is not standable (spawn falls back)', () => {
  const store = new Map<string, string>()
  globalThis.localStorage = { getItem: k => store.get(k) ?? null, setItem: (k, v) => void store.set(k, v), removeItem: k => void store.delete(k), clear: () => store.clear(), key: () => null, length: 0 } as Storage
  const solid = sceneryCollisions(mapProps())
  const save = { ...newSave(presets[0].avatar, 'Wei Ling'), position: { x: 12.2, y: 35 } }
  store.set(SAVE_KEY, JSON.stringify(save))
  assert.deepEqual(readSave()?.position, { x: 12.2, y: 35 })
  // Positions players could stand on before this change (in front of the block) are still free.
  for (const at of [{ x: 12.2, y: 37 }, { x: 14.4, y: 36.6 }, START]) assert.ok(canStand(at, NEIGHBOURHOOD_SIZE, solid))
  const pillar = voidDeckLayout(mapProps().find(p => p.name === 'Block 110')!).pillars[0]
  assert.equal(canStand({ x: pillar.x + .17, y: pillar.y + .17 }, NEIGHBOURHOOD_SIZE, solid), false)
})

test('Block 102 (12-storey modular block on the north edge): its void deck is reachable from the start', () => {
  const props = mapProps()
  const b102 = props.find(p => p.name === 'Block 102')!
  assert.equal(b102.properties.voidDeck, true)
  assert.equal(b102.properties.floors, 12)
  const solid = sceneryCollisions(props)
  const under = { x: 11, y: 1.4 }
  assert.ok(canStand(under, NEIGHBOURHOOD_SIZE, solid))
  assert.ok(walkable(START, under, solid), 'from the starting plaza into Block 102\'s void deck')
})

test('Sunshine Court: connected decks, bus stop and all mission doors remain reachable', () => {
  const props = mapProps(), solid = sceneryCollisions(props)
  const destinations = [
    SHOP_DOOR, HOUSE_DOOR, HOUSE_H_DOOR, HOUSE_I_DOOR,
    { x: 1.2, y: 21 }, { x: 1.2, y: 32 }, { x: 9.4, y: 20.4 },
    { x: 12.2, y: 35 }, { x: 14, y: 40.5 }, { x: 9, y: 28 },
  ]
  for (const to of destinations) {
    assert.ok(canStand(to, NEIGHBOURHOOD_SIZE, solid), `destination ${to.x},${to.y} is free`)
    assert.ok(walkable(START, to, solid), `start connects to ${to.x},${to.y}`)
  }
  // Traversal through each new deck, from one open side to the other, without bypassing the block.
  for (const number of ['106', '109', '112']) {
    const block = props.find(p => p.name === `Block ${number}`)!
    const alongX = block.w >= block.d
    const from = alongX ? { x: block.x + 1, y: block.y - .5 } : { x: block.x - .5, y: block.y + 1 }
    const to = alongX ? { x: from.x, y: block.y + block.d + .5 } : { x: block.x + block.w + .5, y: from.y }
    const bounds = { x: block.x - .5, y: block.y - .5, w: block.w + 1, d: block.d + 1 }
    assert.ok(walkable(from, to, solid, NEIGHBOURHOOD_SIZE, bounds), `through Block ${number}'s void deck`)
  }
  assert.ok(canStand({ x: 14.5, y: 30 }, NEIGHBOURHOOD_SIZE, solid), 'parking paint never creates an invisible solid building')
})
