import assert from 'node:assert/strict'
import { test } from 'node:test'
import fs from 'node:fs'
import { fileURLToPath } from 'node:url'
import { canStand } from '../../../src/game/isometric'
import { loadMap } from '../../../src/game/mapSource'
import { buildEstate, straighten } from '../../../src/game/estateLayout'
import { ESTATE_REVISION, ESTATE_SCALE, ESTATE_SIZE } from '../../../src/game/estateScale'
import { NEIGHBOURHOOD_SIZE, SHOP_DOOR } from '../../../src/game/locations'
import { SAVE_KEY, newSave, readSave } from '../../../src/state/saveGame'
import { baseAvatar } from '../../../src/state/avatar'
import config from '../../../src/game/maps/amk-config.json'

// The migrated Sunshine Estate (docs/estate-migration.md), built exactly as the game builds it.
const source = loadMap(fs.readFileSync(fileURLToPath(new URL('../../../src/game/maps/neighbourhood.tmj', import.meta.url)), 'utf8'))
const estate = buildEstate(source)
const stand = (p: { x: number; y: number }) => canStand(p, estate.size, estate.collisions)
const reachable = (at: { x: number; y: number }, r: number) => Array.from({ length: 16 }, (_, i) => ({ x: at.x + Math.cos(i / 8 * Math.PI) * r, y: at.y + Math.sin(i / 8 * Math.PI) * r })).some(stand)
const solidBuildings = estate.buildings.filter(b => !b.deck)

test('Estate: gameplay scale matches saves, and nearly every mapped building survives straightening', () => {
  assert.deepEqual(estate.size, ESTATE_SIZE)
  assert.deepEqual(NEIGHBOURHOOD_SIZE, ESTATE_SIZE)
  // Footprints centred inside the playable boundary all survive (bar a few tiny unnamed sheds); ones outside it are not drawn.
  const onMap = source.props.filter(p => p.kind === 'geoBuilding' && p.x + p.w / 2 > 0 && p.y + p.d / 2 > 0 && p.x + p.w / 2 < source.size.x && p.y + p.d / 2 < source.size.y)
  const kept = onMap.filter(p => estate.buildings.some(b => b.name === (p.name || 'Neighbourhood building'))).length
  assert.ok(kept >= onMap.length * .95, `${kept} of ${onMap.length} on-map buildings kept`)
  for (const name of ['Sunshine Mall', 'Sunshine MRT', 'Block 101', 'Block 105']) assert.ok(estate.buildings.some(b => b.name === name), name)
  // Straightening keeps a footprint's centre and long/short extents.
  const r = straighten([{ x: 0, y: 0 }, { x: 10, y: 0 }, { x: 10, y: 4 }, { x: 0, y: 4 }])
  assert.deepEqual(r, { x: 0, y: 0, w: 10, d: 4 })
})

test('Estate: buildings never stand on a carriageway or on each other', () => {
  for (const b of estate.buildings) {
    for (let y = Math.ceil(b.y); y < b.y + b.d - 1; y++) for (let x = Math.ceil(b.x); x < b.x + b.w - 1; x++)
      assert.notEqual(estate.ground[y * estate.size.x + x], 2, `${b.name} sits on a road at ${x},${y}`)
    for (const o of estate.buildings) if (o !== b) assert.ok(!(b.x < o.x + o.w && o.x < b.x + b.w && b.y < o.y + o.d && o.y < b.y + b.d), `${b.name} overlaps ${o.name}`)
  }
})

test('Estate: start, all four mission doors and every interaction point can be reached', () => {
  assert.ok(stand(estate.start), 'start')
  for (const id of ['enter', 'house-entrance', 'house-h-entrance', 'house-i-entrance']) assert.ok(estate.hotspots.some(h => h.id === id), id)
  for (const h of estate.hotspots) assert.ok(reachable(h.at, h.radius * .7), `${h.id} at ${h.at.x.toFixed(1)},${h.at.y.toFixed(1)}`)
  assert.equal(new Set(estate.hotspots.map(h => h.id)).size, estate.hotspots.length, 'hotspot ids are unique')
  // Saved games returning from Sunshine Minimart arrive at SHOP_DOOR, which the scene maps onto the shop hotspot.
  assert.ok(SHOP_DOOR.x > 0 && SHOP_DOOR.x < estate.size.x && SHOP_DOOR.y > 0 && SHOP_DOOR.y < estate.size.y)
})

test('Estate: residents only walk where people can stand, never through solid buildings', () => {
  assert.ok(estate.routes.length >= 6, `${estate.routes.length} routes`)
  for (const { sheet, path } of estate.routes) for (let i = 1; i < path.length; i++) {
    const a = path[i - 1], b = path[i], n = Math.ceil(Math.hypot(b.x - a.x, b.y - a.y) / .25)
    for (let k = 0; k <= n; k++) {
      const p = { x: a.x + (b.x - a.x) * k / n, y: a.y + (b.y - a.y) * k / n }
      assert.ok(stand(p), `${sheet} blocked at ${p.x.toFixed(1)},${p.y.toFixed(1)}`)
      assert.ok(!solidBuildings.some(o => p.x > o.x && p.x < o.x + o.w && p.y > o.y && p.y < o.y + o.d), `${sheet} inside a building`)
    }
  }
})

test('Estate: void decks are walkable between pillars; solid blocks are not', () => {
  const decks = estate.buildings.filter(b => b.deck)
  assert.ok(decks.length >= 40)
  for (const b of decks) {
    const len = b.alongX ? b.w : b.d, depth = b.alongX ? b.d : b.w
    const open = Array.from({ length: 12 }, (_, i) => 3 + i * (len - 6) / 11).some(t => {
      const s = depth - 1.1
      return stand(b.alongX ? { x: b.x + t, y: b.y + s } : { x: b.x + s, y: b.y + t })
    })
    assert.ok(open, `void deck of ${b.name}`)
  }
  for (const b of solidBuildings) assert.ok(!stand({ x: b.x + b.w / 2, y: b.y + b.d / 2 }), b.name)
})

test('Estate: scenery keeps off roads and out of buildings', () => {
  for (const t of estate.things) {
    const c = { x: t.x + t.w / 2, y: t.y + t.d / 2 }
    if (t.kind !== 'shelter') assert.notEqual(estate.ground[Math.floor(c.y) * estate.size.x + Math.floor(c.x)], 2, `${t.kind} on a road`)
    assert.ok(!estate.buildings.some(b => c.x > b.x && c.x < b.x + b.w && c.y > b.y && c.y < b.y + b.d), `${t.kind} inside a building`)
  }
})

test('Estate: the whole map is one walkable neighbourhood (mission doors and most entrances reachable from the start)', () => {
  const step = .5, W = Math.ceil(estate.size.x / step), H = Math.ceil(estate.size.y / step)
  const seen = new Uint8Array(W * H), cell = (p: { x: number; y: number }) => Math.round(p.y / step) * W + Math.round(p.x / step)
  const queue = [cell(estate.start)]; seen[queue[0]] = 1
  for (let q = 0; q < queue.length; q++) {
    const i = queue[q], x = i % W, y = (i - x) / W
    for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
      const nx = x + dx, ny = y + dy, j = ny * W + nx
      if (nx < 0 || ny < 0 || nx >= W || ny >= H || seen[j]) continue
      seen[j] = 1
      if (stand({ x: nx * step, y: ny * step })) queue.push(j); else seen[j] = 2
    }
  }
  const near = (at: { x: number; y: number }) => {
    for (let r = 0; r <= 1.5; r += .5) for (let a = 0; a < 8; a++) if (seen[cell({ x: at.x + Math.cos(a / 4 * Math.PI) * r, y: at.y + Math.sin(a / 4 * Math.PI) * r })] === 1) return true
    return false
  }
  for (const h of estate.hotspots.filter(h => h.mission)) assert.ok(near(h.at), `${h.id} reachable from the start`)
  const doors = estate.hotspots.filter(h => h.building), ok = doors.filter(h => near(h.at)).length
  assert.ok(ok / doors.length >= .95, `${ok} of ${doors.length} building entrances reachable`)
})

test('Saves: source-map positions are scaled into the estate; progress is untouched', () => {
  const store = new Map<string, string>()
  Object.defineProperty(globalThis, 'localStorage', { configurable: true, value: { getItem: (k: string) => store.get(k) ?? null, setItem: (k: string, v: string) => store.set(k, v) } })
  const old = { ...newSave(baseAvatar, 'Mei'), mapRevision: config.revision, position: { x: 99.7, y: 98.9 }, coins: 517 }
  store.set(SAVE_KEY, JSON.stringify(old))
  const migrated = readSave()!
  assert.ok(migrated)
  assert.deepEqual(migrated.position, { x: 99.7 * ESTATE_SCALE, y: 98.9 * ESTATE_SCALE })
  assert.equal(migrated.mapRevision, ESTATE_REVISION)
  assert.equal(migrated.coins, 517)
  assert.equal(migrated.name, 'Mei')
  // A save already on the estate revision is read as stored.
  store.set(SAVE_KEY, JSON.stringify({ ...old, mapRevision: ESTATE_REVISION, position: { x: 250, y: 250 } }))
  assert.deepEqual(readSave()!.position, { x: 250, y: 250 })
})
