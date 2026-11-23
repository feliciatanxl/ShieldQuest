const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto'),assert=require('node:assert/strict');
const root='games/unity/ShieldQuest/Assets/Resources/PixelLab';
const data=JSON.parse(fs.readFileSync(root+'/shared-game.json'));
const map=JSON.parse(fs.readFileSync('src/game/maps/neighbourhood.tmj'));
assert.deepEqual(JSON.parse(fs.readFileSync(root+'/neighbourhood.json')),map,'map export is stale');
assert.deepEqual(JSON.parse(fs.readFileSync(root+'/amk-config.json')),JSON.parse(fs.readFileSync('src/game/maps/amk-config.json')),'configuration is stale');
assert.ok(Object.keys(data.sourceHashes??{}).length>20,'source hashes missing');
for(const [file,hash] of Object.entries(data.sourceHashes)){
 const input=fs.readFileSync(file);const normalized=file.endsWith('.png')?input:input.toString('utf8').replace(/\r\n/g,'\n');
 assert.equal(crypto.createHash('sha256').update(normalized).digest('hex'),hash,`${file} changed; run npm run unity:export`);
}
let images=0;
function image(file,w,h){const p=path.join(root,file+'.png'),b=fs.readFileSync(p);assert.equal(b.toString('hex',0,8),'89504e470d0a1a0a',p);const width=b.readUInt32BE(16),height=b.readUInt32BE(20);assert.ok(width>0&&height>0&&width<=4096&&height<=4096,p+' exceeds importer limit');if(w)assert.equal(width,w,p);if(h)assert.equal(height,h,p);images++;}
const buildings=map.layers.flatMap(l=>l.objects??[]).filter(p=>p.type==='geoBuilding');assert.equal(data.buildings.length,buildings.length);
for(const b of data.buildings){assert.ok(buildings.some(p=>p.id===b.id&&p.properties.some(v=>v.name==='osmId'&&v.value===b.osmId)));image('generated/buildings/'+b.osmId,b.width,b.height);image('generated/lights/'+b.osmId,b.width,b.height);}
for(let i=0;i<data.looks.length;i++)image('generated/avatars/'+i,1040,640);
image('generated/ground-atlas',256,256);
for(const heading of ['east','west','north','south'])image('generated/buses/'+heading,160,120);
for(const g of data.guardians)image('generated/guardians/'+g.id,96,96);
for(const name of ['Minimart','House','HouseH','HouseI','FreezeFrame']){
 const room=data.interiors[name];assert.ok(room.hotspots.length&&room.collisions.length&&room.layers.length,name);
 for(const layer of room.layers)image(`generated/interiors/${name}/${layer.id}`,layer.width,layer.height);
}
assert.equal(data.houseObjects.length,12);assert.equal(Object.keys(data.assessments).length,6);
for(const font of ['Body','Pixel']){assert.ok(fs.statSync(`${root}/fonts/${font}.ttf`).size>1000);assert.ok(fs.existsSync(`${root}/fonts/${font}-LICENSE.txt`));}
console.log(`Unity shared exports verified: ${buildings.length} buildings, 5 interiors, ${images} PNGs, ${Object.keys(data.sourceHashes).length} source hashes.`);
