import assert from 'node:assert/strict'
import { test } from 'node:test'
import { canStand, depthAt } from '../../../src/game/isometric'
import { Painter, rasterise } from '../../../src/game/pixelIso'
import {
  buildingDepth, HDB, MART, PRECINCT_DOOR, PRECINCT_SIZE, PRECINCT_SPAWN, precinctCollisions, precinctHotspots, precinctRoutes, pillars,
} from '../../../src/game/precinctLayout'

const stand = (p: { x: number; y: number }) => canStand(p, PRECINCT_SIZE, precinctCollisions)
const inside = (p: { x: number; y: number }, f: { x: number; y: number; w: number; d: number }) => p.x > f.x && p.x < f.x + f.w && p.y > f.y && p.y < f.y + f.d

test('Slice precinct: spawn, minimart door and every hotspot approach are standable', () => {
  assert.ok(stand(PRECINCT_SPAWN), 'spawn')
  assert.ok(stand(PRECINCT_DOOR), 'player returns from Sunshine Minimart onto open pavement')
  for (const h of precinctHotspots) {
    // Some ring point within reach must be standable, or the prompt could never be triggered.
    const reachable = Array.from({ length: 16 }, (_, i) => ({ x: h.at.x + Math.cos(i / 8 * Math.PI) * h.radius * .8, y: h.at.y + Math.sin(i / 8 * Math.PI) * h.radius * .8 })).some(stand)
    assert.ok(reachable, h.id)
  }
})

test('Slice precinct: resident routes stay on walkable pavement for their whole length', () => {
  for (const { sheet, path } of precinctRoutes) {
    for (let i = 0; i + 1 < path.length; i++) {
      const a = path[i], b = path[i + 1], steps = Math.ceil(Math.hypot(b.x - a.x, b.y - a.y) / .1)
      for (let s = 0; s <= steps; s++) {
        const p = { x: a.x + (b.x - a.x) * s / steps, y: a.y + (b.y - a.y) * s / steps }
        assert.ok(stand(p), `${sheet} walks into scenery at ${p.x.toFixed(2)}, ${p.y.toFixed(2)}`)
        assert.ok(!inside(p, MART), `${sheet} walks inside the minimart`)
      }
    }
  }
})

test('Slice precinct: the void deck is walkable between pillars, solid structures are not', () => {
  assert.ok(stand({ x: 11, y: 5.6 }), 'open void deck')
  assert.ok(stand({ x: 8, y: 3.2 }), 'void deck by the letterboxes')
  for (const p of pillars) assert.ok(!stand({ x: p.x + .22, y: p.y + .22 }), 'pillar')
  assert.ok(!stand({ x: 3, y: 2 }), 'stair core')
  assert.ok(!stand({ x: 25, y: 4.5 }), 'minimart interior is only reachable through its door')
  assert.ok(!stand({ x: 11, y: 1.2 }), 'void deck back wall')
})

test('Slice precinct: characters sort by their feet against building footprints', () => {
  const key = buildingDepth(HDB)
  // Anywhere in front of either visible face draws over the block; behind it, beneath.
  for (let x = HDB.x; x <= HDB.x + HDB.w; x += .5) assert.ok(depthAt(x, HDB.y + HDB.d + .05) > key, `front at x ${x}`)
  for (let y = HDB.y; y <= HDB.y + HDB.d; y += .5) assert.ok(depthAt(HDB.x + HDB.w + .05, y) > key, `end wall at y ${y}`)
  assert.ok(depthAt(HDB.x + 1, HDB.y - .3) < key, 'behind the block')
  const mart = buildingDepth(MART)
  assert.ok(depthAt(PRECINCT_DOOR.x, PRECINCT_DOOR.y) > mart, 'player at the shop door draws over the shopfront')
})

test('Pixel baker: hard edges, one-pixel silhouette outline, and whole-pixel tile size', () => {
  const p = new Painter().box(0, 0, 1, 1, 20, ['#c0c0c0', '#808080', '#404040'])
  const { rgba, W, H } = rasterise(p)
  // A 1×1 tile box is exactly one tile (64 px) wide, plus a pixel of padding either side.
  assert.equal(W, 64 + 3)
  assert.ok(H >= 32 + 20)
  const alphas = new Set<number>()
  for (let i = 3; i < rgba.length; i += 4) alphas.add(rgba[i])
  assert.deepEqual([...alphas].sort((a, b) => a - b), [0, 255], 'no anti-aliased edge pixels')
  // The leftmost opaque pixel of the middle row is outline: darker than any face colour.
  const row = Math.floor(H / 2) * W
  let x = 0
  while (rgba[(row + x) * 4 + 3] === 0) x++
  assert.ok(rgba[(row + x) * 4] < 0x80 * .5, 'silhouette is darkened')
  const unoutlined = rasterise(new Painter().box(0, 0, 1, 1, 20, ['#c0c0c0', '#808080', '#404040']), false)
  assert.equal(unoutlined.rgba[(row + x) * 4], 0x80, 'without outline the same pixel keeps the left-face colour')
})
