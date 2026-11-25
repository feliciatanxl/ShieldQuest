import assert from 'node:assert/strict'
import { test } from 'node:test'
import fs from 'node:fs'
import { sceneryCollisions, voidDeckOpenings } from '../../../src/game/collisions'
import { canStand } from '../../../src/game/isometric'
import { footprint, insidePolygon } from '../../../src/game/geoPolygon'
import { dressEstate, fictionalise } from '../../../src/game/sunshineEstate'
import { buildingEntrances } from '../../../src/game/buildingEntrances'
import config from '../../../src/game/maps/amk-config.json'
import type { MapProp } from '../../../src/game/maps'
import type { Hotspot } from '../../../src/game/events'

// Same load as src/game/maps.ts: OSM geometry, then Sunshine Estate names and street furniture.
const map = JSON.parse(fs.readFileSync(new URL('../../../src/game/maps/neighbourhood.tmj', import.meta.url), 'utf8'))
const u = map.tileheight, tiles: number[] = map.layers.find((l: any) => l.type === 'tilelayer').data
const raw: MapProp[] = map.layers.flatMap((l: any) => l.objects ?? []).map((o: any) => ({
  kind: o.type, name: o.name, x: o.x / u, y: o.y / u, w: o.width / u, d: o.height / u,
  properties: Object.fromEntries((o.properties ?? []).map((p: any) => [p.name, p.value])),
  path: o.polyline?.map((p: any) => ({ x: (o.x + p.x) / u, y: (o.y + p.y) / u })),
}))
fictionalise(raw)
const clear = [config.start, ...Object.values(config.entrances)]
const props = dressEstate(raw, tiles, map.width, clear, config.start) as MapProp[]
const size = { x: map.width, y: map.height }, solid = sceneryCollisions(props)
const buildings = props.filter(p => p.kind === 'geoBuilding').map(p => ({ p, points: footprint(p) }))
// Only blocks wholly inside the playable map (OSM footprints past its edge are scenery the player can't reach).
const residential = buildings.filter(b => b.p.properties.residential && b.p.x > 1 && b.p.y > 1 && b.p.x + b.p.w < size.x - 1 && b.p.y + b.p.d < size.y - 1)

test('Residential HDB walls block walking straight through a block', () => {
  const big = [...residential].sort((a, b) => b.p.w + b.p.d - a.p.w - a.p.d).slice(0, 10)
  for (const { p, points } of big) {
    // Lines across the block's middle, off any opening, must meet a wall before reaching the far side.
    let crossed = 0
    for (const f of [.3, .7]) {
      const y = p.y + p.d * f
      let x = p.x - 1.5, inside = false
      while (x < p.x + p.w + 1.5 && canStand({ x, y }, size, solid)) { if (insidePolygon({ x, y }, points)) inside = true; x += .05 }
      if (x >= p.x + p.w + 1.5 && inside) crossed++
    }
    assert.ok(crossed < 2, `${p.name} can be walked straight through`)
  }
})

test('Void decks stay reachable through their openings', () => {
  let reachable = 0
  for (const { p, points } of residential) {
    // One step in from an opening (the same openings collisions.ts uses) must be standable floor.
    const gaps = voidDeckOpenings(points)
    const open = points.some((a, i) => {
      const b = points[(i + 1) % points.length], len = Math.hypot(b.x - a.x, b.y - a.y), n = { x: -(b.y - a.y) / len, y: (b.x - a.x) / len }
      return gaps[i].some(c => [.5, -.5].some(k => {
        const at = { x: a.x + (b.x - a.x) * c / len + n.x * k, y: a.y + (b.y - a.y) * c / len + n.y * k }
        return insidePolygon(at, points) && canStand(at, size, solid)
      }))
    })
    if (open) reachable++
  }
  assert.ok(reachable >= residential.length * .9, `only ${reachable}/${residential.length} void decks have a walkable opening`)
})

test('Resident walking routes stay on walkable ground and outside buildings', () => {
  for (const r of props.filter(p => p.kind === 'walker' && p.path)) for (let i = 1; i < r.path!.length; i++) {
    const a = r.path![i - 1], b = r.path![i], len = Math.hypot(b.x - a.x, b.y - a.y)
    for (let n = 0; n <= len; n += .25) {
      const at = { x: a.x + (b.x - a.x) * n / len, y: a.y + (b.y - a.y) * n / len }
      assert.ok(canStand(at, size, solid), `route blocked at ${at.x.toFixed(1)},${at.y.toFixed(1)}`)
      assert.ok(!buildings.some(({ points }) => insidePolygon(at, points)), `route enters a building at ${at.x.toFixed(1)},${at.y.toFixed(1)}`)
    }
  }
})

test('Street furniture and trees never stand inside buildings or on mission doors', () => {
  const added = props.filter(p => p.properties.sunshine)
  assert.ok(added.length > 40, 'estate dressing missing')
  for (const p of added) {
    const c = { x: p.x + p.w / 2, y: p.y + p.d / 2 }
    assert.ok(!buildings.some(({ points }) => insidePolygon(c, points)), `${p.kind} inside a building`)
    assert.ok(!clear.some(k => Math.hypot(k.x - c.x, k.y - c.y) < 2.5), `${p.kind} on a mission door`)
  }
})

test('Every building door, mission doors included, is standable after the redesign', () => {
  const missions: Hotspot[] = Object.entries(config.entrances).map(([key, at]) => ({ id: ({ shop: 'enter', house: 'house-entrance', houseH: 'house-h-entrance', houseI: 'house-i-entrance' } as const)[key as keyof typeof config.entrances], at, label: key, radius: 1 }))
  const doors = buildingEntrances(props, solid, size, missions, () => true)
  assert.equal(doors.length, 117)
  for (const d of doors) assert.ok(canStand(d.at, size, solid), d.label)
  for (const m of missions) assert.ok(doors.some(d => d.id === m.id), m.label)
})
