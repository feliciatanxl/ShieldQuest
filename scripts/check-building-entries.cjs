const {chromium}=require('playwright'),assert=require('node:assert/strict'),path=require('node:path'),os=require('node:os');
(async()=>{
 const {createServer}=await import('vite');const server=await createServer({server:{host:'127.0.0.1',port:5175,strictPort:true}});await server.listen();let browser;
 try{
  browser=await chromium.launch({executablePath:process.env.CHROME_PATH||'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});const p=await browser.newPage({viewport:{width:1280,height:850}});
  p.on('pageerror',e=>{throw e});await p.goto('http://127.0.0.1:5175/scripts/amk-review.html');await p.waitForFunction(()=>window.__amkReady,null,{timeout:90000});console.log('AMK scene ready');
  await p.evaluate(()=>{window.__amkReview.setView('');for(const s of window.__shieldGame.scene.scenes)s.launch.reducedMotion=true;window.__shieldGame.scene.getScene('Neighbourhood').follow();window.__amkReview.bridge.on('checkpoint',data=>window.__buildingCheckpoint=data)});
  for(const target of ['Grill Box','Sunshine Mall','home','Sunshine MRT']){
   const entry=await p.evaluate(target=>{const s=window.__shieldGame.scene.getScene('Neighbourhood'),e=s.world.hotspots.find(h=>target==='home'?h.building?.kind==='home':h.building?.name===target);if(!e)throw Error('Missing '+target);s.player.move({...e.at},0,{x:0,y:0});s.moveCamera();s.updateProximity();return{id:s.nearby.id,expected:e.id,at:e.at,name:e.building.name}},target);assert.equal(entry.id,entry.expected);
   console.log('Pressing E');await p.keyboard.press('e');await p.waitForFunction(()=>window.__shieldGame.scene.isActive('Building')&&window.__shieldGame.scene.getScene('Building').player?.sprite.active);
   console.log('Entered Building');const checkpoint=await p.evaluate(()=>window.__buildingCheckpoint);assert.equal(checkpoint.scene,'Building');assert.equal(checkpoint.building.name,entry.name);assert.deepEqual(checkpoint.building.returnAt,entry.at);
   if(target==='Grill Box')await p.screenshot({path:path.join(os.tmpdir(),'shieldquest-building-shop.png')});
   await p.keyboard.press('e');await p.waitForFunction(()=>window.__shieldGame.scene.isActive('Neighbourhood')&&window.__shieldGame.scene.getScene('Neighbourhood').player?.sprite.active);
   const at=await p.evaluate(()=>window.__shieldGame.scene.getScene('Neighbourhood').player.position);assert.ok(Math.hypot(at.x-entry.at.x,at.y-entry.at.y)<.001,'wrong exit destination');console.log('E enter/exit passed:',entry.name);
  }
  const missionDoors = await p.evaluate(async () => {
   const { geographicallyCovered } = await import('/src/game/geography.ts');
   const s = window.__shieldGame.scene.getScene('Neighbourhood');
   return s.world.hotspots.filter(h => ['enter', 'house-entrance', 'house-h-entrance', 'house-i-entrance'].includes(h.id))
    .map(h => ({ id: h.id, clear: s.free(h.at) && !geographicallyCovered(s, h.at, 28) }));
  });
  assert.equal(missionDoors.length, 4);
  assert.deepEqual(missionDoors.filter(door => !door.clear), []);
  await p.evaluate(()=>{const s=window.__shieldGame.scene.getScene('Neighbourhood'),e=s.world.hotspots.find(h=>h.id==='enter');s.player.move({...e.at},0,{x:0,y:0});s.updateProximity()});await p.keyboard.press('e');await p.waitForFunction(()=>window.__shieldGame.scene.isActive('Minimart'));console.log('Original Sunshine Minimart E entrance passed.');
 }catch(e){console.error(e);throw e}finally{if(browser)await Promise.race([browser.close(),new Promise(r=>setTimeout(r,3000))]);server.httpServer?.closeAllConnections();await Promise.race([server.close(),new Promise(r=>setTimeout(r,3000))])}
})().then(()=>process.exit(0)).catch(e=>{console.error(e);process.exit(1)});
