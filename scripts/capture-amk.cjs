const {chromium}=require(require('path').join(require('os').tmpdir(),'shieldquest-qa/node_modules/playwright'));
const fs=require('fs');
(async()=>{
 const browser=await chromium.launch({executablePath:process.env.CHROME_PATH||'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true,args:['--no-sandbox']});
 const result={viewport:{width:1440,height:1000},camera:{x:0,y:1700,zoom:.24},errors:[],views:{},movement:{},mobile:{}};
 try{
 const page=await browser.newPage({viewport:result.viewport});page.on('pageerror',e=>result.errors.push(String(e)));
 const ready=async()=>{await page.waitForFunction(()=>window.__amkReady,null,{timeout:60000});await page.waitForTimeout(1800)};
 await page.goto('http://127.0.0.1:5173/scripts/amk-review.html?before');await ready();await page.screenshot({path:'docs/geography/before.png'});
 await page.goto('http://127.0.0.1:5173/scripts/amk-review.html');await ready();
 for(const view of ['overview','street','centre','transport','bus-stop']){
 await page.evaluate(v=>window.__amkReview.setView(v),view);await page.waitForTimeout(450);await page.screenshot({path:'docs/geography/'+(view==='overview'?'after':view)+'.png'});result.views[view]=await page.locator('#status').textContent();
 }
 await page.click('#play');await page.waitForTimeout(250);
 const pos=()=>page.evaluate(()=>({...window.__shieldGame.scene.getScene('Neighbourhood').player.position}));
 result.movement.from=await pos();await page.screenshot({path:'docs/geography/movement-before.png'});
 for(const key of ['ArrowDown','ArrowRight','ArrowUp','ArrowLeft']){await page.keyboard.down(key);await page.waitForTimeout(700);await page.keyboard.up(key);const to=await pos();if(Math.hypot(to.x-result.movement.from.x,to.y-result.movement.from.y)>.5){result.movement.to=to;result.movement.key=key;break}}
 await page.screenshot({path:'docs/geography/movement-after.png'});
 const scene=()=>window.__shieldGame.scene.getScene('Neighbourhood');
 result.gameplay=await page.evaluate(()=>{const s=window.__shieldGame.scene.getScene('Neighbourhood');return {startFree:s.free(s.player.position),hotspots:s.world.hotspots.map(h=>({id:h.id,free:s.free(h.at)})),walkers:s.walkers.length,renderTextures:s.children.list.filter(x=>x.type==='RenderTexture').length,fps:window.__shieldGame.loop.actualFps}});
 await page.setViewportSize({width:390,height:844});await page.waitForTimeout(500);await page.screenshot({path:'docs/geography/mobile.png'});result.mobile={viewport:{width:390,height:844},status:await page.locator('#status').textContent()};
 result.transitions=[];
 for(const [sceneKey,door] of [['Minimart','enter'],['HouseH','house-h-entrance'],['HouseI','house-i-entrance']]){
 await page.evaluate(id=>{const s=window.__shieldGame.scene.getScene('Neighbourhood'),h=s.world.hotspots.find(h=>h.id===id);s.player.move(h.at,0,{x:0,y:0});s.updateProximity();s.interact()},door);
 await page.waitForFunction(key=>window.__shieldGame.scene.isActive(key),sceneKey,{timeout:10000});
 result.transitions.push(sceneKey);await page.waitForFunction(key=>!window.__shieldGame.scene.getScene(key).transitioning,sceneKey,{timeout:15000});
 await page.evaluate(()=>{window.__amkReview.bridge.emit('houseTravel',{target:'Neighbourhood',position:{x:99.67864555162883,y:98.86806956466205}})});
 await page.waitForFunction(()=>window.__shieldGame.scene.isActive('Neighbourhood'),null,{timeout:10000});await page.waitForFunction(()=>!window.__shieldGame.scene.getScene('Neighbourhood').transitioning,null,{timeout:15000});
 }
 await page.goto('http://127.0.0.1:5173/');await page.waitForTimeout(2000);result.mobile.menuButtons=await page.getByRole('button').allTextContents();await page.screenshot({path:'docs/geography/mobile-menu.png'});
 console.log(JSON.stringify(result,null,2));fs.writeFileSync('docs/geography/browser-checks.json',JSON.stringify(result,null,2));
 if(result.errors.length||!result.movement.to)process.exitCode=1;
 }finally{await browser.close()}
})().catch(e=>{console.error(e);process.exitCode=1})
