import type Phaser from 'phaser'
import type { Point } from '../state/saveGame'
import type { MapProp } from './maps'
import { project, depthAt } from './isometric'
import { poly, box, floor } from './worldArt'
import { LANDMARK_TITLES } from './sunshineEstate'
import { bakeIntoGround } from './pixellabArt'
import { voidDeckOpenings } from './collisions'

export { footprint, insidePolygon } from './geoPolygon'
import { footprint, insidePolygon } from './geoPolygon'
const STOREY=30, DECK=38
const FACADES=[['#f4e3c3','#d9c29c','#d0714c'],['#f6d9c6','#dcb8a2','#3f8f8a'],['#dcebd6','#b8cdb2','#d79a3a'],['#d9e7ee','#b3c6d1','#c25a4f'],['#f7ecc2','#dccd98','#4f7fae']]
const SHOPS=['#f6e6cf','#dcc3a2','#e0a55a']
const AWNINGS=['#d9644a','#f2c14e','#4f9d8f','#e58f65','#7a9fd1']
const LAUNDRY=['#e46f6f','#f6d36b','#7fb7e0','#ffffff','#9ad09a']
type Mass={p:MapProp;footprint:Point[];graphics:Phaser.GameObjects.RenderTexture;silhouettes:Point[][];lights:Phaser.GameObjects.Graphics}
const geographicMasses = new WeakMap<Phaser.Scene, Mass[]>()
export function updateGeographicLighting(scene:Phaser.Scene,strength:number){
  const view=scene.cameras.main.worldView
  for(const mass of geographicMasses.get(scene)??[]){
    const r=mass.graphics
    const visible=strength>.01&&r.x+r.width>view.x&&r.x<view.right&&r.y+r.height>view.y&&r.y<view.bottom
    mass.lights.setVisible(visible).setAlpha(strength*r.alpha)
  }
}
// Behind (or under) a footprint: stepping towards the viewer (+x,+y) from the feet lands inside it.
function behind(m:Mass,at:Point){
  const reach=m.p.w+m.p.d
  for(let t=0;t<=reach;t+=.4)if(insidePolygon({x:at.x+t,y:at.y+t},m.footprint))return true
  return false
}
const overlaps=(m:Mass,at:Point,lift:number)=>{
  const r=m.p
  if(at.x>r.x+r.w+1||at.y>r.y+r.d+1||at.x+at.y<r.x+r.y-2)return false
  const feet=project(at.x,at.y)
  return m.silhouettes.some(poly=>insidePolygon(feet,poly)||insidePolygon({x:feet.x,y:feet.y-lift},poly))
}
const obscures=(m:Mass,at:Point,lift=12)=>overlaps(m,at,lift)&&behind(m,at)
/** Ground-contact depth sorting against buildings: a character behind (or under) a block draws beneath it, one standing
 *  in front of a wall that overlaps them on screen draws above it, whatever the block's own centre depth is. */
export function geographicDepth(scene:Phaser.Scene,at:Point,natural:number){
  let below=Infinity,above=-Infinity
  for(const m of geographicMasses.get(scene)??[]){
    if(!overlaps(m,at,28))continue
    if(behind(m,at))below=Math.min(below,m.graphics.depth-.02)
    else above=Math.max(above,m.graphics.depth+.02)
  }
  return below<Infinity?Math.min(natural,below):Math.max(natural,above)
}
/** Depth of the building whose wall is nearest a point, for features drawn onto that wall (doors). */
export const geographicWallDepth=(scene:Phaser.Scene,p:MapProp)=>(geographicMasses.get(scene)??[]).find(m=>m.p===p)?.graphics.depth
// Door placement keeps its original rule (depth-sorted silhouette overlap) so mission doors stay where they were.
const sortedBehind=(m:Mass,at:Point,lift=12)=>depthAt(at.x,at.y)<=m.graphics.depth&&m.silhouettes.some(poly=>{const f=project(at.x,at.y);return insidePolygon(f,poly)||insidePolygon({x:f.x,y:f.y-lift},poly)})
export const geographicallyCovered=(scene:Phaser.Scene,at:Point,lift?:number)=>(geographicMasses.get(scene)??[]).some(m=>sortedBehind(m,at,lift))
export function updateGeographicOcclusion(scene: Phaser.Scene, at: Point) {
  for(const mass of geographicMasses.get(scene)??[]){
    mass.graphics.setAlpha(obscures(mass,at)?.65:1)
  }
}

/** Exact OSM outlines with original, temporary architectural artwork. No map imagery. */
export function geographicBuilding(scene: Phaser.Scene, p: MapProp) {
  // Controlled height compression (docs/ang-mo-kio-overhaul.md): storeys above five count 60%, so a 12-storey slab
  // shows 9 and a 25-storey point block 17. Towers keep their presence without walling off every street.
  const mapped=Number(p.properties.levels)||1,levels=mapped<=5?mapped:Math.round(5+(mapped-5)*.6)
  const points=footprint(p), deck=Boolean(p.properties.residential)
  const z=deck?DECK:0, height=levels*STOREY+z
  const depth=depthAt(p.x+p.w/2,p.y+p.d/2)
  const g=scene.make.graphics({},false)
  const lights=scene.add.graphics().setDepth(depth+.03).setVisible(false)
  const winding=points.reduce((sum,a,i)=>{const b=points[(i+1)%points.length];return sum+a.x*b.y-b.x*a.y},0)
  if(!geographicMasses.has(scene)) { geographicMasses.set(scene,[]); scene.events.once('shutdown',()=>geographicMasses.delete(scene)) }
  const ground=scene.add.graphics().setDepth(-1999)
  // Cozy Sunshine Estate palette: one pastel facade per block (lit face, shaded face, accent trim).
  const [lit,shade,accent]=deck?FACADES[Math.abs(Number(p.properties.osmId)||0)%FACADES.length]:SHOPS
  if(deck){
    // Void deck: warm square floor tiles in the shade of the block above.
    poly(ground,'#e3d6bd',points.map(a=>[a.x,a.y]))
    const xs=points.map(a=>a.x),ys=points.map(a=>a.y)
    for(let x=Math.ceil(Math.min(...xs));x<Math.max(...xs);x++)for(let y=Math.ceil(Math.min(...ys));y<Math.max(...ys);y++)
      if(insidePolygon({x:x+.5,y:y+.5},points)&&(x+y)%2)floor(ground,x,y,1,1,'#d6c7aa',0,.8)
    poly(ground,'#5b4a36',points.map(a=>[a.x,a.y]),.14)
  } else {
    // Shopfront apron: warm brick pushed out about a tile from the walls, then the building's soft shadow.
    const cx=points.reduce((s,a)=>s+a.x,0)/points.length,cy=points.reduce((s,a)=>s+a.y,0)/points.length
    const apron=(grow:number)=>points.map(a=>{const l=Math.hypot(a.x-cx,a.y-cy)||1;return [a.x+(a.x-cx)/l*grow,a.y+(a.y-cy)/l*grow] as [number,number]})
    poly(ground,'#b97a5e',apron(1.25));poly(ground,'#d29a78',apron(1.1))
    poly(ground,'#3a2f25',points.map(a=>[a.x+.6,a.y+.15]),.2)
  }
  bakeIntoGround(scene,ground)
  // Render faces from back to front. Shared materials and screen-left sunlight.
  const variant=Math.abs(Number(p.properties.osmId)||0)%3
  const faces=points.map((a,i)=>({a,b:points[(i+1)%points.length]})).sort((u,v)=>(u.a.x+u.a.y+u.b.x+u.b.y)-(v.a.x+v.a.y+v.b.x+v.b.y))
  const openings=deck?voidDeckOpenings(points):[]
  const longest=Math.max(...faces.map(({a,b})=>Math.hypot(b.x-a.x,b.y-a.y)))
  for(const {a,b} of faces){
    const length=Math.hypot(b.x-a.x,b.y-a.y)
    if(length<.1)continue
    const face=(s:number,t:number,low:number,high:number,color:string)=>poly(g,color,[[a.x+(b.x-a.x)*s,a.y+(b.y-a.y)*s,low],[a.x+(b.x-a.x)*t,a.y+(b.y-a.y)*t,low],[a.x+(b.x-a.x)*t,a.y+(b.y-a.y)*t,high],[a.x+(b.x-a.x)*s,a.y+(b.y-a.y)*s,high]])
    face(0,1,z,height,Math.abs(b.x-a.x)>Math.abs(b.y-a.y)?lit:shade)
    const bays=Math.max(1,Math.floor(length/(variant===1?.95:.85)))
    const outward=(b.y-a.y)-(b.x-a.x), front=(winding>0?outward:-outward)>0
    if(!deck){
      // Ground-floor shopfronts: glass, mullions and a striped awning per bay.
      for(let bay=0;bay<bays;bay++){
        const s=(bay+.08)/bays,t=(bay+.92)/bays
        face(s,t,1,20,'#6f5444');face(s+.02/bays,t-.02/bays,2,19,'#a9cfcc');face(s+.02/bays,(s+t)/2,3,18,'#cfe3dc')
        face(s,t,20,26,AWNINGS[Math.abs(bay+Math.floor(p.x))%AWNINGS.length]);face(s,t,22,23,'#fff4de')
      }
    }
    for(let level=deck?0:1;level<levels;level++){
      const low=z+level*STOREY
      // Corridor parapet: a white band with a soft shadow line beneath, read as the common corridor.
      if(deck){face(0,1,low,low+5,'#fbf6ea');face(0,1,low+5,low+6,'#a99f8c')}
      else face(0,1,low,low+2,'#b99c80')
      for(let bay=0;bay<bays;bay++){
        const s=(bay+.18)/bays,t=(bay+.78)/bays
        face(s,t,low+8,low+23,'#6d5a4b')
        face(s+.03/bays,t-.03/bays,low+9,low+22,'#7fa2a6')
        face(s+.03/bays,(s+t)/2,low+10,low+21,'#a8c6c2')
        if(front&&(bay*11+level*7+Math.floor(p.x))%5===0){
          poly(lights,level%3===0?'#ffd290':'#f6e3ae',[[a.x+(b.x-a.x)*s,a.y+(b.y-a.y)*s,low+9],[a.x+(b.x-a.x)*t,a.y+(b.y-a.y)*t,low+9],[a.x+(b.x-a.x)*t,a.y+(b.y-a.y)*t,low+22],[a.x+(b.x-a.x)*s,a.y+(b.y-a.y)*s,low+22]])
        }
        // Laundry on bamboo poles and potted plants along the corridor: the lived-in bits.
        if(deck&&(bay*5+level*3+Math.floor(p.y))%7===0)face(s+.1/bays,t-.1/bays,low+6,low+9,LAUNDRY[(bay+level)%LAUNDRY.length])
        if(deck&&(bay*3+level)%6===2)face(s,s+.12/bays,low+3,low+8,'#5f9b5a')
        // Facade variants so neighbouring blocks don't repeat: accent panels, or aircon ledges.
        if(deck&&variant===1&&bay%2===0)face(t,Math.min(1,(bay+1.18)/bays),low+8,low+23,accent)
        if(deck&&variant===2&&(bay+level)%3===1){face(t-.02/bays,t+.12/bays,low+11,low+17,'#c3c7c1');face(t,t+.1/bays,low+12,low+16,'#8d938f')}
      }
    }
    // Accent trim: a coloured band under the roof and a stair-core stripe at each corner.
    face(0,1,height-6,height,accent)
    face(0,Math.min(.5,.35/length),z,height,accent)
    if(deck){
      // Void deck edge matching the collision wall (collisions.ts): a low planter wall with the same openings, pillars every 1.5 tiles.
      const gaps=openings[points.indexOf(a)]??[]
      const gap=(n:number)=>gaps.some(c=>Math.abs(n-c)<.9)
      for(let n=0;n<length;n+=.3)if(!gap(n)){face(n/length,Math.min(1,(n+.3)/length),0,9,'#cfc3a8');face(n/length,Math.min(1,(n+.3)/length),9,11,'#7fa86a')}
      for(let n=0;n<length;n+=1.5){const t=n/length;box(g,a.x+(b.x-a.x)*t,a.y+(b.y-a.y)*t,.22,.22,z,['#f3ead8','#d8cbb2','#b3a68e'])}
      if(length===longest){
        // Lift lobby and stair core: a full-height tower in the accent colour, glass lobby at the void deck.
        face(.46,.54,0,height+10,accent);face(.475,.525,2,z-6,'#46606a');face(.48,.5,4,z-8,'#8fb4b8')
        for(let level=0;level<levels;level++)face(.47,.53,z+level*STOREY+10,z+level*STOREY+20,'#e9e1cc')
      }
    }
  }
  // Roof: parapet walls and lip around a darker deck, then rooftop structures, so it never reads as a flat slab.
  const cx=points.reduce((s,a)=>s+a.x,0)/points.length,cy=points.reduce((s,a)=>s+a.y,0)/points.length
  const inner=points.map(a=>{const l=Math.hypot(a.x-cx,a.y-cy)||1,k=Math.min(.3,l*.3)/l;return [a.x+(cx-a.x)*k,a.y+(cy-a.y)*k,height+4] as [number,number,number]})
  for(const {a,b} of faces)poly(g,Math.abs(b.x-a.x)>Math.abs(b.y-a.y)?lit:shade,[[a.x,a.y,height],[b.x,b.y,height],[b.x,b.y,height+4],[a.x,a.y,height+4]])
  poly(g,deck?'#f4eee0':'#eef0ea',points.map(a=>[a.x,a.y,height+4]))
  poly(g,deck?'#c9bfa8':'#b9beb3',inner)
  const c={x:p.x+p.w/2,y:p.y+p.d/2}
  if(deck&&insidePolygon(c,points))box(g,c.x,c.y,.5,.5,z,['#f3ead8','#d8cbb2','#b3a68e'])
  if(deck){
    // Lift motor rooms over the lift core and a water tank: the familiar HDB rooftop silhouette.
    const {a,b}=faces.reduce((m,f)=>Math.hypot(f.b.x-f.a.x,f.b.y-f.a.y)>Math.hypot(m.b.x-m.a.x,m.b.y-m.a.y)?f:m)
    const mid={x:(a.x+b.x)/2,y:(a.y+b.y)/2},l=Math.hypot(cx-mid.x,cy-mid.y)||1,core={x:mid.x+(cx-mid.x)/l*.9,y:mid.y+(cy-mid.y)/l*.9}
    if(insidePolygon(core,points))box(g,core.x-.45,core.y-.45,.9,.9,18,[lit,shade,accent],height+4)
    if(insidePolygon(c,points)&&levels>3)box(g,c.x-.4,c.y-.4,.8,.8,12,['#dfe6e6','#a9b6b8','#869597'],height+4)
  } else {
    // Shop roofs: a grid of air-con condensers and one skylight strip.
    for(let y=Math.ceil(p.y)+1;y<p.y+p.d-1;y+=3.6)for(let x=Math.ceil(p.x)+1+(Math.round(y)%2)*1.8;x<p.x+p.w-1;x+=3.6)
      if(insidePolygon({x,y},points)&&insidePolygon({x:x+.6,y:y+.5},points))box(g,x,y,.5,.4,6,['#eceeea','#c3c8c2','#9da39d'],height+4)
    if(insidePolygon(c,points))floor(g,c.x-.8,c.y-.25,1.6,.5,'#9fc2c9',height+4.5)
  }
  const projected=points.map(a=>project(a.x,a.y))
  const left=Math.floor(Math.min(...projected.map(a=>a.x)))-3,top=Math.floor(Math.min(...projected.map(a=>a.y))-height-34)
  const right=Math.ceil(Math.max(...projected.map(a=>a.x)))+3,bottom=Math.ceil(Math.max(...projected.map(a=>a.y)))+3
  const baked=scene.add.renderTexture(left,top,right-left,bottom-top).setOrigin(0).setDepth(depth)
  baked.draw(g,-left,-top);g.destroy()
  const silhouettes=[points.map(a=>project(a.x,a.y,height)),...faces.map(({a,b})=>[project(a.x,a.y,z),project(b.x,b.y,z),project(b.x,b.y,height),project(a.x,a.y,height)])]
  geographicMasses.get(scene)!.push({p,footprint:points,graphics:baked,silhouettes,lights})
  const at=project(p.x+p.w/2,p.y+p.d/2,height+8)
  // Landmarks get a warm signboard; HDB blocks a small block-number plate in their accent colour.
  const block=/^Block (\S+)$/.exec(p.name)?.[1]
  const title=LANDMARK_TITLES[p.name]??(block?'BLK '+block:p.name.startsWith('Building')?'':p.name.toUpperCase())
  if(title)scene.add.text(at.x,at.y,title,{fontFamily:'Outfit',fontSize:block&&!LANDMARK_TITLES[p.name]?10:12,fontStyle:'bold',color:'#fff8e8',backgroundColor:block&&!LANDMARK_TITLES[p.name]?accent:'#b5553c',padding:{x:4,y:2}}).setOrigin(.5,1).setDepth(depth+.1)
  return baked
}

const MINOR=/^(service|residential|construction|proposed)$/
type Seg={a:Point;b:Point;dx:number;dy:number;len:number;width:number;way:MapProp}
const segments=(ways:MapProp[])=>ways.flatMap(way=>(way.path??[]).slice(1).map((b,i):Seg=>{const a=way.path![i],dx=b.x-a.x,dy=b.y-a.y;return{a,b,dx,dy,len:Math.hypot(dx,dy),width:Number(way.properties.width)||1,way}})).filter(s=>s.len>0)

/** Roads are drawn in passes over the whole network (verge, kerb, asphalt, then markings) so junctions and
 *  bends join into one continuous surface instead of showing kerb seams and holes between overlapping segments. */
export function geographicRoads(scene: Phaser.Scene, props: MapProp[]) {
  const g=scene.add.graphics().setDepth(-1999.5)
  const roads=segments(props.filter(p=>p.kind==='geoRoad')),paths=segments(props.filter(p=>p.kind==='geoPath'))
  const strip=(s:Seg,offset:number,thickness:number,color:string,start=0,end=1)=>{
    const {a,dx,dy,len}=s,nx=-dy/len,ny=dx/len
    poly(g,color,[[a.x+dx*start+nx*offset,a.y+dy*start+ny*offset],[a.x+dx*end+nx*offset,a.y+dy*end+ny*offset],[a.x+dx*end+nx*(offset+thickness),a.y+dy*end+ny*(offset+thickness)],[a.x+dx*start+nx*(offset+thickness),a.y+dy*start+ny*(offset+thickness)]])
  }
  const disc=(c:Point,r:number,color:string)=>poly(g,color,Array.from({length:10},(_,i)=>[c.x+Math.cos(i/10*Math.PI*2)*r,c.y+Math.sin(i/10*Math.PI*2)*r] as [number,number]))
  const main=(s:Seg)=>!MINOR.test(s.way.name)&&s.width>=1.6
  // Footpaths underneath everything; sheltered linkways get tiles, posts and a roof.
  for(const s of paths){
    if(!s.way.properties.covered){strip(s,-.3,.6,'#e7dcc6');continue}
    const {a,b,dx,dy,len}=s
    strip(s,-.45,.9,'#c98f6a');strip(s,-.45,.08,'#efe3c8');strip(s,.37,.08,'#efe3c8')
    for(let n=0;n<len;n+=2)for(const o of [-.42,.34])box(g,a.x+dx*n/len-dy/len*o,a.y+dy*n/len+dx/len*o,.08,.08,22,['#5f8f6e','#4b7458','#3a5c46'])
    // Roof at the segment's front depth, see-through enough to keep people beneath readable.
    const roof=scene.add.graphics().setDepth(depthAt(Math.max(a.x,b.x),Math.max(a.y,b.y))).setAlpha(.6)
    const nx=-dy/len,ny=dx/len,edge=(o:number,h:number)=>[[a.x+nx*o,a.y+ny*o,h],[b.x+nx*o,b.y+ny*o,h]] as [number,number,number][]
    poly(roof,'#4f8a6a',[...edge(-.55,24),...edge(.55,24).reverse()])
    poly(roof,'#6fae86',[...edge(-.5,26),...edge(.5,26).reverse()])
    poly(roof,'#3d6b52',[...edge(.55,22),...edge(.55,24).reverse()])
  }
  // Grass verges along main avenues, then one kerb surface, then one asphalt surface with rounded joints.
  for(const s of roads.filter(main)){strip(s,-s.width/2-1.15,.9,'#8fb06a');strip(s,s.width/2+.25,.9,'#8fb06a');disc(s.a,s.width/2+1.15,'#8fb06a');disc(s.b,s.width/2+1.15,'#8fb06a')}
  for(const s of roads){strip(s,-s.width/2-.25,s.width+.5,'#d6cfbf');disc(s.a,s.width/2+.25,'#d6cfbf');disc(s.b,s.width/2+.25,'#d6cfbf')}
  for(const s of roads){strip(s,-s.width/2,s.width,'#5d6266');disc(s.a,s.width/2,'#5d6266');disc(s.b,s.width/2,'#5d6266')}
  // Junctions: vertices shared by more than one way. Markings stop short of them so they never cross a side road.
  const count=new Map<string,number>(),key=(p:Point)=>`${Math.round(p.x*2)},${Math.round(p.y*2)}`
  for(const way of props.filter(p=>p.kind==='geoRoad'))for(const k of new Set((way.path??[]).map(key)))count.set(k,(count.get(k)??0)+1)
  const junctions=[...count].filter(([,n])=>n>1).map(([k])=>{const [x,y]=k.split(',').map(Number);return{x:x/2,y:y/2}})
  const nearJunction=(p:Point,r:number)=>junctions.some(j=>Math.abs(j.x-p.x)<r&&Math.abs(j.y-p.y)<r&&Math.hypot(j.x-p.x,j.y-p.y)<r)
  // Asphalt lookup (4-tile buckets): an edge line is painted only where the carriageway really ends, not where a
  // parallel or crossing way continues the asphalt (dual carriageways mapped as several OSM ways).
  const buckets=new Map<string,Seg[]>()
  for(const s of roads){const r=s.width/2+.5;for(let y=Math.floor((Math.min(s.a.y,s.b.y)-r)/4);y<=Math.floor((Math.max(s.a.y,s.b.y)+r)/4);y++)for(let x=Math.floor((Math.min(s.a.x,s.b.x)-r)/4);x<=Math.floor((Math.max(s.a.x,s.b.x)+r)/4);x++){const k=`${x},${y}`;(buckets.get(k)??buckets.set(k,[]).get(k)!).push(s)}}
  const onAsphalt=(p:Point,self:Seg)=>(buckets.get(`${Math.floor(p.x/4)},${Math.floor(p.y/4)}`)??[]).some(o=>{
    if(o===self)return false
    const t=Math.max(0,Math.min(1,((p.x-o.a.x)*o.dx+(p.y-o.a.y)*o.dy)/(o.len*o.len)))
    return Math.hypot(p.x-o.a.x-o.dx*t,p.y-o.a.y-o.dy*t)<o.width/2
  })
  for(const s of roads){
    if(MINOR.test(s.way.name))continue
    const clear=s.width/2+.8,nx=-s.dy/s.len,ny=s.dx/s.len
    for(let n=0;n<s.len;n+=.5){
      const at={x:s.a.x+s.dx*n/s.len,y:s.a.y+s.dy*n/s.len}
      if(nearJunction(at,clear))continue
      const t0=n/s.len,t1=Math.min(1,(n+.5)/s.len)
      for(const side of [-1,1]){
        const beyond={x:at.x+nx*side*(s.width/2+.3),y:at.y+ny*side*(s.width/2+.3)}
        if(!onAsphalt(beyond,s))strip(s,side<0?-s.width/2+.08:s.width/2-.13,.05,'#e9e4d6',t0,t1)
      }
      // Centre dashes only where this way is the whole carriageway, not one lane of a wider mapped road.
      if(onAsphalt({x:at.x+nx*(s.width/2+.3),y:at.y+ny*(s.width/2+.3)},s)||onAsphalt({x:at.x-nx*(s.width/2+.3),y:at.y-ny*(s.width/2+.3)},s))continue
      // Two-way roads: dashed centre line (traffic keeps left either side of it).
      if(!s.way.properties.oneway&&n%1.5<.5)strip(s,-.025,.05,'#f2e7c9',t0,Math.min(1,(n+.3)/s.len))
    }
  }
  // Zebra crossings only where a mapped footpath crosses a main road away from junctions, at most one per 6 tiles.
  const crossings:Point[]=[]
  for(const s of roads.filter(main))for(const w of paths){
    if(w.way.properties.covered)continue
    const den=s.dx*w.dy-s.dy*w.dx
    if(Math.abs(den)<1e-6)continue
    const t=((w.a.x-s.a.x)*w.dy-(w.a.y-s.a.y)*w.dx)/den,u=((w.a.x-s.a.x)*s.dy-(w.a.y-s.a.y)*s.dx)/den
    if(t<=0||t>=1||u<=0||u>=1)continue
    const at={x:s.a.x+s.dx*t,y:s.a.y+s.dy*t}
    if(nearJunction(at,s.width)||crossings.some(c=>Math.hypot(c.x-at.x,c.y-at.y)<6))continue
    crossings.push(at)
    const half=.6/s.len
    for(let o=-s.width/2+.15;o<s.width/2-.2;o+=.42)strip(s,o,.24,'#f4f1e6',t-half,t+half)
  }
  bakeIntoGround(scene,g)
}
