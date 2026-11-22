import assert from 'node:assert/strict'
import { test } from 'node:test'
import { purchaseItem, readShopInventory, shopCatalog } from '../../../src/state/shop'
import { newSave, readSave, SAVE_KEY, writeSave } from '../../../src/state/saveGame'
import { presets } from '../../../src/state/avatar'

test('Shop purchases deduct the exact coin cost and accumulate furniture quantities',()=>{
  const first=purchaseItem(240,{},'park-bench',2)!
  assert.equal(first.coins,180);assert.equal(first.shop['park-bench'],2)
  const second=purchaseItem(first.coins,first.shop,'park-bench',3)!
  assert.equal(second.coins,90);assert.equal(second.shop['park-bench'],5)
  assert.equal(first.shop['park-bench'],2,'previous inventory is immutable')
})
test('Shop rejects overspending, unknown items, invalid quantities and duplicate outfits',()=>{
  for(const q of [0,-1,1.5,21,NaN,Infinity])assert.equal(purchaseItem(240,{},'park-bench',q),null)
  assert.equal(purchaseItem(29,{},'park-bench',1),null)
  assert.equal(purchaseItem(240,{},'missing',1),null)
  assert.equal(purchaseItem(240,{'outfit-0':1},'outfit-0',1),null)
  assert.equal(purchaseItem(240,{},'outfit-0',2),null)
  assert.equal(purchaseItem(240,{'park-bench':999},'park-bench',1),null)
  assert.equal(purchaseItem(-5,{},'park-bench',1),null)
})
test('Shop normalizes old or corrupt inventory without allowing arbitrary products',()=>{
  assert.deepEqual(readShopInventory(undefined),{})
  assert.deepEqual(readShopInventory({'park-bench':2,'outfit-0':10,missing:4,'garden':-1,'rain-tree':1000}),{'park-bench':2,'outfit-0':1})
  assert.equal(new Set(shopCatalog.map(p=>p.id)).size,shopCatalog.length)
  assert.ok(shopCatalog.every(p=>Number.isInteger(p.price)&&p.price>0))
})
test('Purchased items and remaining coins survive a game save round trip',()=>{
  const storage=new Map<string,string>();globalThis.localStorage={getItem:k=>storage.get(k)??null,setItem:(k,v)=>void storage.set(k,v)} as Storage
  const save={...newSave(presets[0].avatar,'Shopper'),...purchaseItem(240,{},'park-bench',2)!}
  assert.ok(writeSave(save));assert.equal(readSave()?.coins,180);assert.deepEqual(readSave()?.shop,{'park-bench':2})
  const {shop,...legacy}=save;storage.set(SAVE_KEY,JSON.stringify(legacy));assert.deepEqual(readSave()?.shop,{})
})
