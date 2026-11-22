import assert from 'node:assert/strict'
import {test} from 'node:test'
import {readPlayerProfile,newPlayerProfile,PROFILE_BIO_LIMIT} from '../../../src/state/profile'
import {newSave,readSave,SAVE_KEY,writeSave} from '../../../src/state/saveGame'
import {baseAvatar} from '../../../src/state/avatar'
test('Profile metadata records new-game creation and preserves unknown legacy dates',()=>{
  const now=new Date('2026-01-01T12:00:00Z'),profile=newPlayerProfile(now)
  assert.equal(profile.createdAt,now.toISOString());assert.equal(profile.lastLoginAt,profile.createdAt)
  assert.equal(readPlayerProfile(undefined).createdAt,undefined)
  assert.equal(readPlayerProfile({createdAt:'invalid'}).createdAt,undefined)
  assert.equal(readPlayerProfile({createdAt:'2999-01-01'}).createdAt,undefined)
  assert.equal(readPlayerProfile({bio:'x'.repeat(300)}).bio.length,PROFILE_BIO_LIMIT)
})
test('Edited profile bio survives reload without changing avatar, balance or progress',()=>{
  const store=new Map<string,string>();globalThis.localStorage={getItem:k=>store.get(k)??null,setItem:(k,v)=>void store.set(k,v)} as Storage
  const save=newSave(baseAvatar,'Fel');save.profile={...save.profile!,bio:'Hello, Sunshine Estate!'};save.coins=123
  writeSave(save);const loaded=readSave()!
  assert.equal(loaded.profile?.bio,save.profile.bio);assert.equal(loaded.profile?.createdAt,save.profile.createdAt);assert.equal(loaded.coins,123);assert.deepEqual(loaded.avatar,save.avatar)
  const {profile,...legacy}=save;store.set(SAVE_KEY,JSON.stringify(legacy));assert.ok(readSave());assert.equal(readSave()?.profile?.createdAt,undefined)
})
