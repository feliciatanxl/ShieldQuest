import assert from 'node:assert/strict'
import { test } from 'node:test'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import {
  HOUSE_H_DOOR, HOUSE_H_SPAWN, HOUSE_H_SIZE,
  HOUSE_I_DOOR, HOUSE_I_SPAWN, HOUSE_I_SIZE, NEIGHBOURHOOD_SIZE,
} from '../../../src/game/locations'
import { ESTATE_SCALE } from '../../../src/game/estateScale'
import { houseHCollisions, houseHObjects } from '../../../src/game/houseHLayout'
import { houseICollisions, houseIObjects } from '../../../src/game/houseILayout'
import { canStand } from '../../../src/game/isometric'
import { readSave, SAVE_KEY, newSave, type Save } from '../../../src/state/saveGame'
import { presets } from '../../../src/state/avatar'

test('Ang Mo Kio district dimensions and source landmarks', () => {
  const dir = path.dirname(fileURLToPath(import.meta.url))
  const mapPath = path.resolve(dir, '../../../src/game/maps/neighbourhood.tmj')
  const tmj = JSON.parse(fs.readFileSync(mapPath, 'utf8'))

  // Saves are validated against gameplay tiles: the 5 m source map scaled by ESTATE_SCALE (estateScale.ts)
  assert.equal(Math.ceil(tmj.width * ESTATE_SCALE), NEIGHBOURHOOD_SIZE.x)
  assert.equal(Math.ceil(tmj.height * ESTATE_SCALE), NEIGHBOURHOOD_SIZE.y)
  assert.ok(tmj.width * tmj.height >= 25 * 23 * 1.5, 'World map is at least 1.5x larger')

  // Verify object layers and essential landmarks
  const objectsLayer = tmj.layers.find((l: { type: string }) => l.type === 'objectgroup')
  assert.ok(objectsLayer, 'Object group layer exists in Tiled map')

  const names = objectsLayer.objects.map((o: { name: string }) => o.name)
  for (const name of ['Ang Mo Kio Hub','Ang Mo Kio','Block 724','Block 702','Block 728']) assert.ok(names.includes(name), name)
  const entries = objectsLayer.objects.filter((o: {type: string}) => o.type === 'entry')
  assert.equal(entries.length, 4)

})

test('House H (Freeze Frame House) layout, hotspots, and collision', () => {
  // Coordinates and boundaries
  assert.equal(HOUSE_H_SIZE.x, 10)
  assert.equal(HOUSE_H_SIZE.y, 8)
  assert.ok(HOUSE_H_DOOR.x > 0 && HOUSE_H_DOOR.x < NEIGHBOURHOOD_SIZE.x)
  assert.ok(HOUSE_H_DOOR.y > 0 && HOUSE_H_DOOR.y < NEIGHBOURHOOD_SIZE.y)

  // Hotspots
  const hotspotIds = houseHObjects.map(h => h.id)
  assert.ok(hotspotIds.includes('exit-house-h'), 'House H has exit door hotspot')
  assert.ok(hotspotIds.includes('freeze-station'), 'House H has freeze-station activity hotspot')

  // Spawn point is walkable
  const spawnWalkable = canStand(HOUSE_H_SPAWN, HOUSE_H_SIZE, houseHCollisions)
  assert.equal(spawnWalkable, true, 'Player spawn point in House H must be walkable')

  // Exit trigger is placed at entrance doorway
  const exitHotspot = houseHObjects.find(h => h.id === 'exit-house-h')
  assert.ok(exitHotspot)
  assert.ok(exitHotspot.at.x >= 4.5 && exitHotspot.at.x <= 5.5)
  assert.ok(exitHotspot.at.y >= 7.0 && exitHotspot.at.y <= 7.8)

  // Freeze station activity hotspot
  const freezeHotspot = houseHObjects.find(h => h.id === 'freeze-station')
  assert.ok(freezeHotspot)
  assert.ok(freezeHotspot.label.includes('Freeze Frame'))
})

test('House I (Whisper Network House) layout, hotspots, and collision', () => {
  // Coordinates and boundaries
  assert.equal(HOUSE_I_SIZE.x, 11)
  assert.equal(HOUSE_I_SIZE.y, 8)
  assert.ok(HOUSE_I_DOOR.x > 0 && HOUSE_I_DOOR.x < NEIGHBOURHOOD_SIZE.x)
  assert.ok(HOUSE_I_DOOR.y > 0 && HOUSE_I_DOOR.y < NEIGHBOURHOOD_SIZE.y)

  // Hotspots
  const hotspotIds = houseIObjects.map(h => h.id)
  assert.ok(hotspotIds.includes('exit-house-i'), 'House I has exit door hotspot')
  assert.ok(hotspotIds.includes('whisper-station'), 'House I has whisper-station activity hotspot')

  // Spawn point is walkable
  const spawnWalkable = canStand(HOUSE_I_SPAWN, HOUSE_I_SIZE, houseICollisions)
  assert.equal(spawnWalkable, true, 'Player spawn point in House I must be walkable')

  // Exit trigger is placed at entrance doorway
  const exitHotspot = houseIObjects.find(h => h.id === 'exit-house-i')
  assert.ok(exitHotspot)
  assert.ok(exitHotspot.at.x >= 5.0 && exitHotspot.at.x <= 6.0)
  assert.ok(exitHotspot.at.y >= 7.0 && exitHotspot.at.y <= 7.8)

  // Whisper station activity hotspot
  const whisperHotspot = houseIObjects.find(h => h.id === 'whisper-station')
  assert.ok(whisperHotspot)
  assert.ok(whisperHotspot.label.includes('Whisper Network'))
})

test('Save system parses and restores HouseH and HouseI locations', () => {
  // Mock localStorage for node:test environment
  const mockStorage: Record<string, string> = {}
  globalThis.localStorage = {
    getItem: (key: string) => mockStorage[key] ?? null,
    setItem: (key: string, value: string) => { mockStorage[key] = value },
    removeItem: (key: string) => { delete mockStorage[key] },
    clear: () => { Object.keys(mockStorage).forEach(k => delete mockStorage[k]) },
    key: (i: number) => Object.keys(mockStorage)[i] ?? null,
    length: 0,
  }

  const baseSave = newSave(presets[0].avatar, 'Player')

  // Test House H save restoration
  const houseHSave: Save = {
    ...baseSave,
    scene: 'HouseH',
    position: HOUSE_H_SPAWN,
  }
  localStorage.setItem(SAVE_KEY, JSON.stringify(houseHSave))
  const loadedH = readSave()
  assert.ok(loadedH)
  assert.equal(loadedH.scene, 'HouseH')
  assert.deepEqual(loadedH.position, HOUSE_H_SPAWN)

  // Test House I save restoration
  const houseISave: Save = {
    ...baseSave,
    scene: 'HouseI',
    position: HOUSE_I_SPAWN,
  }
  localStorage.setItem(SAVE_KEY, JSON.stringify(houseISave))
  const loadedI = readSave()
  assert.ok(loadedI)
  assert.equal(loadedI.scene, 'HouseI')
  assert.deepEqual(loadedI.position, HOUSE_I_SPAWN)
})
