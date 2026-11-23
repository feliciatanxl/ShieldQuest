import assert from 'node:assert/strict'
import { test } from 'node:test'
import fs from 'node:fs'
import { buildingEntrances, hotspotDistance, BUILDING_SPAWN, BUILDING_SIZE, buildingCollisions } from '../../../src/game/buildingEntrances'
import { sceneryCollisions } from '../../../src/game/collisions'
import { canStand } from '../../../src/game/isometric'
import { newSave, readSave, SAVE_KEY } from '../../../src/state/saveGame'
import { baseAvatar } from '../../../src/state/avatar'
import config from '../../../src/game/maps/amk-config.json'
import type { MapProp } from '../../../src/game/maps'
import type { Hotspot } from '../../../src/game/events'

const map = JSON.parse(fs.readFileSync(new URL('../../../src/game/maps/neighbourhood.tmj', import.meta.url), 'utf8'))
const props: MapProp[] = map.layers.flatMap((l: any) => l.objects ?? []).map((o: any) => ({ kind: o.type, name: o.name, x: o.x / 32, y: o.y / 32, w: o.width / 32, d: o.height / 32, properties: Object.fromEntries(o.properties.map((p: any) => [p.name, p.value])) }))
const size = { x: map.width, y: map.height }, solid = sceneryCollisions(props)
const missions: Hotspot[] = Object.entries(config.entrances).map(([key, at]) => ({ id: ({ shop: 'enter', house: 'house-entrance', houseH: 'house-h-entrance', houseI: 'house-i-entrance' } as const)[key as keyof typeof config.entrances], at, label: key, radius: 1 }))
const entries = buildingEntrances(props, solid, size, missions)

test('Every building touching the playable AMK district has a usable entrance', () => {
  const playable = props.filter(p => p.kind === 'geoBuilding' && p.x < size.x && p.y < size.y && p.x + p.w > 0 && p.y + p.d > 0)
  assert.equal(playable.length, 117)
  assert.equal(entries.length, playable.length)
  for (const e of entries) { assert.ok(canStand(e.at, size, solid), e.label); assert.ok(hotspotDistance(e, e.at) <= e.radius, e.label) }
})
test('Mission buildings retain all four original E actions and door locations', () => {
  for (const mission of missions) { const e = entries.find(e => e.id === mission.id); assert.ok(e); assert.deepEqual(e.at, mission.at); assert.ok(e.approach?.length) }
})
test('AMK Hub, BBQ Box storefront and HDB blocks enter the appropriate shared interior', () => {
  for (const [name, kind] of [['Ang Mo Kio Hub', 'shop'], ['BBQ Box (AMK Hub)', 'shop'], ['Ang Mo Kio', 'station']]) {
    const e = entries.find(e => e.building?.name === name); assert.ok(e, name); assert.equal(e.building?.kind, kind)
  }
  assert.ok(entries.some(e => e.building?.kind === 'home'))
  assert.ok(canStand(BUILDING_SPAWN, BUILDING_SIZE, buildingCollisions))
  assert.equal(new Set(entries.map(e => e.id)).size, entries.length)
})
test('Ordinary building identity, interior position and exterior return point survive reload', () => {
  const entry = entries.find(e => e.building?.name === 'BBQ Box (AMK Hub)')!
  const saved = { ...newSave(baseAvatar, 'Fel'), scene: 'Building', position: BUILDING_SPAWN, building: { ...entry.building!, returnAt: entry.at } }
  Object.defineProperty(globalThis, 'localStorage', { configurable: true, value: { getItem: (key: string) => key === SAVE_KEY ? JSON.stringify(saved) : null } })
  const restored = readSave(); assert.ok(restored); assert.equal(restored.scene, 'Building'); assert.deepEqual(restored.building, saved.building); assert.deepEqual(restored.position, BUILDING_SPAWN)
  saved.building.returnAt.x = NaN; assert.equal(readSave(), null)
})
