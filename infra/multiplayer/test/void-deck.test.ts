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


test('Ang Mo Kio: all mission doors connect to the new start', () => {
  const solid = sceneryCollisions(mapProps())
  assert.ok(canStand(START, NEIGHBOURHOOD_SIZE, solid))
  for (const to of [SHOP_DOOR,HOUSE_DOOR,HOUSE_H_DOOR,HOUSE_I_DOOR]) {
    assert.ok(canStand(to, NEIGHBOURHOOD_SIZE, solid), JSON.stringify(to))
    assert.ok(walkable(START,to,solid), 'mission door is reachable')
  }
})

test('Old outdoor saves migrate once while current map saves retain their position and progress', () => {
  const store = new Map<string,string>()
  globalThis.localStorage = { getItem: k => store.get(k) ?? null, setItem: (k,v) => void store.set(k,v) } as Storage
  const save = { ...newSave(presets[0].avatar,'Wei Ling'), position: { x:12.2,y:35 }, coins:875, tutorial:'done' }
  const { mapRevision, ...legacy } = save
  store.set(SAVE_KEY,JSON.stringify(legacy))
  assert.deepEqual(readSave()?.position,START)
  assert.equal(readSave()?.coins,875)
  assert.equal(readSave()?.tutorial,'done')
  store.set(SAVE_KEY,JSON.stringify(save))
  assert.deepEqual(readSave()?.position,save.position)
})
