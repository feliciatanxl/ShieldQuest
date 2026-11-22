// Offline, reproducible OSM → editable Tiled map. No paid asset calls.
import fs from 'node:fs'
const source = JSON.parse(fs.readFileSync('docs/geography/amk-osm.json', 'utf8'))
const boundary = { west:103.843, east:103.8505, north:1.374, south:1.3675 }
const metresPerTile = 5, mx = 111320 * Math.cos(boundary.north * Math.PI / 180), my = 110574
const xy = p => ({ x:(p.lon-boundary.west)*mx/metresPerTile, y:(boundary.north-p.lat)*my/metresPerTile })
const width=Math.ceil((boundary.east-boundary.west)*mx/metresPerTile), height=Math.ceil((boundary.north-boundary.south)*my/metresPerTile)
const objects=[], features=[]; let id=1
const props = p => Object.entries(p).map(([name,value])=>({name,type:typeof value==='boolean'?'bool':typeof value==='number'?'float':'string',value}))
function add(type,name,x,y,w=0,d=0,p={},path) {
 const o={id:id++,type,name,x:x*32,y:y*32,width:w*32,height:d*32,rotation:0,visible:true,properties:props(p)}
 if(path)o.polyline=path.map(a=>({x:(a.x-x)*32,y:(a.y-y)*32}))
 objects.push(o);return o
}
const inMap=p=>p.x>=0&&p.y>=0&&p.x<width&&p.y<height
const tiles=Array.from({length:width*height},(_,i)=>5+(i%4)) // urban paved base; no invented grass fields
function inside(p,poly){let v=false;for(let i=0,j=poly.length-1;i<poly.length;j=i++){const a=poly[i],b=poly[j];if((a.y>p.y)!==(b.y>p.y)&&p.x<(b.x-a.x)*(p.y-a.y)/(b.y-a.y)+a.x)v=!v}return v}
function paintLine(points,radius,material){for(let i=1;i<points.length;i++){
 const a=points[i-1],b=points[i],n=Math.ceil(Math.hypot(b.x-a.x,b.y-a.y)*3)
 for(let j=0;j<=n;j++){const x=a.x+(b.x-a.x)*j/(n||1),y=a.y+(b.y-a.y)*j/(n||1)
 for(let yy=Math.floor(y-radius);yy<=y+radius;yy++)for(let xx=Math.floor(x-radius);xx<=x+radius;xx++)if(inMap({x:xx,y:yy})&&Math.hypot(xx+.5-x,yy+.5-y)<radius)tiles[yy*width+xx]=material*4+1+((xx*7+yy*13)&3)
 }} }
const usable=source.elements.filter(e=>e.geometry?.length>1).map(e=>({...e,points:e.geometry.map(xy)}))
for(const e of usable.filter(e=>e.tags.leisure==='park'||['grass','forest'].includes(e.tags.landuse))){
 for(let y=0;y<height;y++)for(let x=0;x<width;x++)if(inside({x:x+.5,y:y+.5},e.points))tiles[y*width+x]=1+((x*7+y*13)&3)
 add('geoGreen',e.tags.name||'Mapped green space',e.points[0].x,e.points[0].y,0,0,{osmId:e.id,polygon:JSON.stringify(e.points)})
}
const roads=[]
for(const e of usable.filter(e=>e.tags.highway)){
 const t=e.tags,points=e.points;if(!points.some(inMap))continue
 const foot=['footway','path','pedestrian','steps','cycleway','platform'].includes(t.highway)
 const lanes=Number(t.lanes)||(['primary','secondary','tertiary'].includes(t.highway)?3:1)
 const roadWidth=foot?Math.max(.4,Number(t.width)/metresPerTile||.6):Math.max(.7,Number(t.width)/metresPerTile||lanes*.64)
 paintLine(points,roadWidth/2+.35,1);if(!foot)paintLine(points,roadWidth/2,2)
 add(foot?'geoPath':'geoRoad',t.name||t.highway,points[0].x,points[0].y,0,0,{osmId:e.id,width:roadWidth,covered:t.covered==='yes',oneway:t.oneway==='yes',verified:'OSM alignment; width inferred unless tagged',highway:t.highway},points)
 if(!foot)roads.push(e)
}
const buildings=[]
for(const e of usable.filter(e=>e.tags.building)){
 const p=e.points.slice(0,-1);if(p.length<3||!p.some(a=>a.x>-20&&a.y>-20&&a.x<width+20&&a.y<height+20))continue
 const t=e.tags,number=t['addr:housenumber']||'',name=t.name|| (number?`Block ${number}`:`Building ${e.id}`)
 const minX=Math.min(...p.map(a=>a.x)),minY=Math.min(...p.map(a=>a.y)),w=Math.max(...p.map(a=>a.x))-minX,d=Math.max(...p.map(a=>a.y))-minY
 const residential=t.residential==='HDB'||t.building==='residential'
 const f={name,osmId:e.id,number,polygon:p,levels:Number(t['building:levels'])||(residential?10:2),residential,verified:'OSM footprint and tagged address; facade and void deck approximated'}
 buildings.push(f);features.push(f)
 const object=add('geoBuilding',name,minX,minY,w,d,{...f,polygon:JSON.stringify(p),levels:f.levels})
 object.polygon=p.map(a=>({x:(a.x-minX)*32,y:(a.y-minY)*32}))
}
// Vegetation remains within mapped park polygons. Individual tree positions are approximations.
for(const e of usable.filter(e=>e.tags.leisure==='park'))for(let y=0;y<height;y+=4)for(let x=0;x<width;x+=4){
 const at={x:x+1.3+(y%3)*.3,y:y+1.1}
 if(inside(at,e.points)&&!buildings.some(b=>inside(at,b.polygon)))add('tree','Approximate park canopy',at.x,at.y,.4,.4,{approximate:true,large:false,park:e.id})
}
// Fictional missions are entries at mapped commercial blocks, never invented real facilities.
const find=n=>buildings.find(b=>b.number===n)
const entrances={}
const clear=p=>p.x>.4&&p.y>.4&&p.x<width-.4&&p.y<height-.4&&buildings.every(b=>![-.8,-.4,0,.4,.8].some(dx=>[-.8,-.4,0,.4,.8].some(dy=>inside({x:p.x+dx,y:p.y+dy},b.polygon))))
function nearby(p,valid=()=>true){for(let radius=0;radius<8;radius+=.5)for(let n=0;n<24;n++){const a=n*Math.PI/12,at={x:p.x+Math.cos(a)*radius,y:p.y+Math.sin(a)*radius};if(clear(at)&&valid(at))return at}throw Error('No clear entry')}
function entry(key,n){const b=find(n);if(!b)throw Error(`Missing block ${n}`);const p=b.polygon.reduce((a,b)=>a.y>b.y?a:b);const at=nearby({x:p.x+.6,y:p.y+.9});entrances[key]=at;add('entry',`Fictional ${key} mission at Block ${n}`,at.x,at.y,0,0,{fictional:true,mission:key});return at}
entry('shop','702');entry('house','710');entry('houseH','715');entry('houseI','728')
const start=nearby({x:entrances.shop.x+1.2,y:entrances.shop.y+1.2})
const awayFromEntries=p=>[start,...Object.values(entrances)].every(a=>Math.hypot(p.x-a.x,p.y-a.y)>1.2)
const may=nearby({x:start.x-2,y:start.y-2},awayFromEntries),amir=nearby({x:entrances.houseH.x+2,y:entrances.houseH.y},awayFromEntries)
add('may','Auntie May',may.x,may.y,0,0,{fictional:true})
add('amir','Amir',amir.x,amir.y,0,0,{fictional:true})
add('notice','Community mission noticeboard',start.x-1,start.y-.3,.6,.15,{fictional:true})
// Walking routes use actual OSM paths; individual objects stay editable in Tiled.
for(const e of source.elements.filter(e=>e.lat&&e.tags.public_transport==='platform')){const p=xy(e);if(inMap(p))add('bus',e.tags.name||'Mapped bus stop',p.x,p.y,1.8,.55,{osmId:e.id,verified:'OSM stop location; shelter schematic'})}
const clearRoute=e=>e.points.slice(1).every((b,i)=>{const a=e.points[i],n=Math.ceil(Math.hypot(b.x-a.x,b.y-a.y)*10);return Array.from({length:n+1},(_,j)=>({x:a.x+(b.x-a.x)*j/n,y:a.y+(b.y-a.y)*j/n})).every(p=>clear(p)&&objects.filter(o=>['tree','notice','may','amir','bus'].includes(o.type)).every(o=>p.x+.3<o.x/32||p.y+.3<o.y/32||p.x-.3>(o.x+o.width)/32||p.y-.3>(o.y+o.height)/32))})
usable.filter(e=>['footway','pedestrian'].includes(e.tags.highway)&&e.tags.tunnel!=='yes'&&e.points.every(inMap)&&e.points.length>2&&clearRoute(e)).slice(0,12).forEach((e,i)=>add('walker','Resident on mapped path',e.points[0].x,e.points[0].y,0,0,{sheet:['auntie','office-worker','student'][i%3]},e.points))
// Each carriageway follows its own source direction; Singapore lanes keep left.
for(const e of roads.filter(e=>e.tags.name==='Ang Mo Kio Avenue 3'&&e.points.every(inMap)&&e.points.length>3).slice(0,4))add('busroute','Avenue 3 mapped carriageway',e.points[0].x,e.points[0].y,0,0,{livery:'green'},e.points)
const map={type:'map',version:'1.10',tiledversion:'1.11.0',orientation:'isometric',renderorder:'right-down',width,height,tilewidth:64,tileheight:32,infinite:false,nextlayerid:3,nextobjectid:id,tilesets:[{firstgid:1,name:'ground',tilewidth:64,tileheight:64,tilecount:16,columns:4,image:'ground.png',imagewidth:256,imageheight:256}],layers:[{id:1,type:'tilelayer',name:'Geographic ground',width,height,data:tiles,opacity:1,visible:true,x:0,y:0},{id:2,type:'objectgroup',name:'OSM geometry and game objects',objects,opacity:1,visible:true,x:0,y:0}],properties:props({revision:'amk-central-v1',attribution:'© OpenStreetMap contributors · ODbL 1.0',metresPerTile})}
fs.writeFileSync('src/game/maps/neighbourhood.tmj',JSON.stringify(map,null,1)+'\n')
fs.writeFileSync('src/game/maps/amk-config.json',JSON.stringify({revision:'amk-central-v1',boundary,metresPerTile,width,height,start,entrances},null,2)+'\n')
fs.writeFileSync('docs/geography/correspondence.json',JSON.stringify({boundary,metresPerTile,features},null,2)+'\n')
fs.mkdirSync('public/map-data',{recursive:true})
fs.copyFileSync('docs/geography/amk-osm.json','public/map-data/amk-osm.json')
fs.copyFileSync('docs/geography/correspondence.json','public/map-data/correspondence.json')
fs.copyFileSync('src/game/maps/neighbourhood.tmj','public/map-data/neighbourhood.tmj')
console.log({width,height,buildings:buildings.length,roads:roads.length,objects:objects.length,start,entrances})
