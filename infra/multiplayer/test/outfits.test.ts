import assert from 'node:assert/strict'
import { test } from 'node:test'
import { OUTFIT_SLOTS, outfitName, parseOutfits } from '../../../src/state/outfits'
import { baseAvatar, presets } from '../../../src/state/avatar'

test('Wardrobe outfits: corrupt or missing storage gives empty slots', () => {
  for (const raw of [null, '', 'not json', '{"a":1}', '42']) {
    const outfits = parseOutfits(raw)
    assert.equal(outfits.length, OUTFIT_SLOTS)
    assert.ok(outfits.every(slot => slot === null))
  }
})

test('Wardrobe outfits: valid slots load, invalid avatars and extra slots are dropped', () => {
  const raw = JSON.stringify([
    { name: '  Market   day ', avatar: presets[4].avatar },
    null,
    { name: 'Broken', avatar: { ...baseAvatar, skin: 99 } },
    { avatar: baseAvatar },
    ...Array(OUTFIT_SLOTS).fill({ name: 'Extra', avatar: baseAvatar }),
  ])
  const outfits = parseOutfits(raw)
  assert.equal(outfits.length, OUTFIT_SLOTS)
  assert.deepEqual(outfits[0], { name: 'Market day', avatar: presets[4].avatar })
  assert.equal(outfits[1], null)
  assert.equal(outfits[2], null, 'an option index out of range is rejected')
  assert.equal(outfits[3]?.name, 'Outfit 4', 'a missing name falls back to the slot name')
})

test('Wardrobe outfits: avatars saved before the clothing-shape update are upgraded', () => {
  const { topStyle: _t, bottomStyle: _b, shoeStyle: _s, glasses: _g, ...legacy } = baseAvatar
  const [outfit] = parseOutfits(JSON.stringify([{ name: 'Old', avatar: legacy }]))
  assert.deepEqual(outfit?.avatar, { ...baseAvatar, topStyle: 0, bottomStyle: 0, shoeStyle: 0, glasses: 0 })
})

test('Wardrobe outfits: names are trimmed and capped', () => {
  assert.equal(outfitName('   '), '')
  assert.equal(outfitName('a'.repeat(40)).length, 20)
})
