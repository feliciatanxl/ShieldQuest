import assert from 'node:assert/strict'
import { test } from 'node:test'
import fs from 'node:fs'
import { fileURLToPath } from 'node:url'
import { canStand, project } from '../../../src/game/isometric'
import { sceneryCollisions } from '../../../src/game/collisions'
import { footprint, insidePolygon } from '../../../src/game/geoPolygon'
import config from '../../../src/game/maps/amk-config.json'

const read=(path:string)=>JSON.parse(fs.readFileSync(fileURLToPath(new URL('../../../'+path,import.meta.url)),'utf8'))
const source=read('docs/geography/amk-osm.json')
const map=read('src/game/maps/neighbourhood.tmj')
const props=map.layers.flatMap((l:any)=>l.objects??[]).map((o:any)=>({kind:o.type,name:o.name,x:o.x/32,y:o.y/32,w:o.width/32,d:o.height/32,properties:Object.fromEntries(o.properties.map((p:any)=>[p.name,p.value])),path:o.polyline?.map((p:any)=>({x:(o.x+p.x)/32,y:(o.y+p.y)/32}))}))
const size={x:config.width,y:config.height},solid=sceneryCollisions(props)
solid.push(...props.filter((p:any)=>['may','amir'].includes(p.kind)).map((p:any)=>({x:p.x-.13,y:p.y-.13,w:.26,d:.26})))
test('Start and mission entrances are clear of resident interaction colliders',()=>{
  for(const point of [config.start,...Object.values(config.entrances)])assert.ok(canStand(point,size,solid))
})
test('Geographic footprints derive directly from the frozen source, including nonrectangular blocks',()=>{
  for(const p of props.filter((p:any)=>p.kind==='geoBuilding')){
    const e=source.elements.find((e:any)=>e.id===p.properties.osmId)
    assert.ok(e,p.name)
    footprint(p).forEach((point,i)=>{
      const raw=e.geometry[i]
      assert.ok(Math.abs(point.x-(raw.lon-config.boundary.west)*111320*Math.cos(config.boundary.north*Math.PI/180)/5)<1e-7)
      assert.ok(Math.abs(point.y-(config.boundary.north-raw.lat)*110574/5)<1e-7)
    })
  }
  const find=(name:string)=>props.find((p:any)=>p.name===name&&p.kind==='geoBuilding')
  const hub=find('Ang Mo Kio Hub'),mrt=find('Ang Mo Kio'),market=find('Block 724')
  assert.ok(mrt.x>hub.x,'MRT is east of Hub')
  assert.ok(market.y<hub.y,'724 is north of Hub')
  assert.ok(market.x<hub.x,'724 is west of Hub')
  assert.deepEqual(project(1,0),{x:32,y:16})
})
test('Mapped resident routes are collision-free along their complete segments',()=>{
  const walkers=props.filter((p:any)=>p.kind==='walker')
  assert.ok(walkers.length>0)
  for(const walker of walkers)for(let i=1;i<walker.path.length;i++){
    const a=walker.path[i-1],b=walker.path[i],n=Math.max(1,Math.ceil(Math.hypot(b.x-a.x,b.y-a.y)/.1))
    for(let j=0;j<=n;j++)assert.ok(canStand({x:a.x+(b.x-a.x)*j/n,y:a.y+(b.y-a.y)*j/n},size,solid),`${walker.name}: ${a.x+(b.x-a.x)*j/n},${a.y+(b.y-a.y)*j/n}`)
  }
})
test('Geographic HDB decks have real open floor space and solid supports',()=>{
  const deck=props.find((p:any)=>p.kind==='geoBuilding'&&p.properties.number==='728')
  assert.equal(deck.properties.residential,true)
  const local=sceneryCollisions([deck]),poly=footprint(deck)
  assert.ok(local.length>0)
  const support=local[0]
  assert.equal(canStand({x:support.x+.1,y:support.y+.1},size,local),false)
  let open=0
  for(let y=deck.y;y<deck.y+deck.d;y+=.5)for(let x=deck.x;x<deck.x+deck.w;x+=.5)if(insidePolygon({x,y},poly)&&canStand({x,y},size,local))open++
  assert.ok(open>10,'open void deck remains navigable')
})
