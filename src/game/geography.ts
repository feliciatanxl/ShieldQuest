import type Phaser from 'phaser'
import type { Point } from '../state/saveGame'
import type { MapProp } from './maps'
import { project, depthAt } from './isometric'
import { poly, box, floor } from './worldArt'
import { LANDMARK_TITLES } from './sunshineEstate'

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
function obscures(m:Mass,at:Point,lift=12){
  const r=m.p
  if(at.x>r.x+r.w+1||at.y>r.y+r.d+1||at.x+at.y<r.x+r.y-2)return false
  const feet=project(at.x,at.y)
  if(!m.silhouettes.some(poly=>insidePolygon(feet,poly)||insidePolygon({x:feet.x,y:feet.y-lift},poly)))return false
  return behind(m,at)
}
/** Characters behind a block draw beneath it, so they never appear to walk across its roof or walls. */
export function geographicCoverDepth(scene:Phaser.Scene,at:Point){
  let depth=Infinity
  for(const m of geographicMasses.get(scene)??[])if(obscures(m,at,28))depth=Math.min(depth,m.graphics.depth-.02)
  return depth
}
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
  const points=footprint(p), levels=Number(p.properties.levels), deck=Boolean(p.properties.residential)
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
  // Render faces from back to front. Shared materials and screen-left sunlight.
  const variant=Math.abs(Number(p.properties.osmId)||0)%3
  const faces=points.map((a,i)=>({a,b:points[(i+1)%points.length]})).sort((u,v)=>(u.a.x+u.a.y+u.b.x+u.b.y)-(v.a.x+v.a.y+v.b.x+v.b.y))
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
      const openings=length<4?0:Math.max(1,Math.round(length/7))
      const gap=(n:number)=>openings>0&&Array.from({length:openings},(_,k)=>(k+.5)*length/openings).some(c=>Math.abs(n-c)<.9)
      for(let n=0;n<length;n+=.3)if(!gap(n)){face(n/length,Math.min(1,(n+.3)/length),0,9,'#cfc3a8');face(n/length,Math.min(1,(n+.3)/length),9,11,'#7fa86a')}
      for(let n=0;n<length;n+=1.5){const t=n/length;box(g,a.x+(b.x-a.x)*t,a.y+(b.y-a.y)*t,.22,.22,z,['#f3ead8','#d8cbb2','#b3a68e'])}
      if(length===longest){
        // Lift lobby and stair core: a full-height tower in the accent colour, glass lobby at the void deck.
        face(.46,.54,0,height+10,accent);face(.475,.525,2,z-6,'#46606a');face(.48,.5,4,z-8,'#8fb4b8')
        for(let level=0;level<levels;level++)face(.47,.53,z+level*STOREY+10,z+level*STOREY+20,'#e9e1cc')
      }
    }
  }
  poly(g,deck?'#efe6d2':'#f1e6d1',points.map(a=>[a.x,a.y,height]))
  poly(g,deck?'#d5c7ab':'#d9c6a6',points.map(a=>[a.x,a.y,height+3]),.55)
  const c={x:p.x+p.w/2,y:p.y+p.d/2}
  if(deck&&insidePolygon(c,points))box(g,c.x,c.y,.5,.5,z,['#f3ead8','#d8cbb2','#b3a68e'])
  if(insidePolygon(c,points)&&levels>3)box(g,c.x-.4,c.y-.4,.8,.8,12,['#f1ead9','#cfc4ad','#a99c84'],height+3)
  const projected=points.map(a=>project(a.x,a.y))
  const left=Math.floor(Math.min(...projected.map(a=>a.x)))-3,top=Math.floor(Math.min(...projected.map(a=>a.y))-height-20)
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

export function geographicRoads(scene: Phaser.Scene, props: MapProp[]) {
  const g=scene.add.graphics().setDepth(-1999.5)
  // Paths first so carriageways cover them; zebras last so no later road segment hides one.
  const ways=props.filter(p=>p.kind==='geoRoad'||p.kind==='geoPath').sort((a,b)=>Number(a.kind==='geoRoad')-Number(b.kind==='geoRoad'))
  const zebras:(()=>void)[]=[]
  // Footpath segments, for zebra crossings where one crosses a named road.
  const walks=ways.filter(w=>w.kind==='geoPath'&&!w.properties.covered).flatMap(w=>(w.path??[]).slice(1).map((b,i)=>[w.path![i],b] as const))
  for(const r of ways){
    const path=r.path??[],width=Number(r.properties.width)
    for(let i=1;i<path.length;i++){
      const a=path[i-1],b=path[i],dx=b.x-a.x,dy=b.y-a.y,len=Math.hypot(dx,dy)
      if(!len)continue
      const strip=(offset:number,thickness:number,color:string,start=0,end=1)=>{
        const nx=-dy/len,ny=dx/len
        poly(g,color,[[a.x+dx*start+nx*offset,a.y+dy*start+ny*offset],[a.x+dx*end+nx*offset,a.y+dy*end+ny*offset],[a.x+dx*end+nx*(offset+thickness),a.y+dy*end+ny*(offset+thickness)],[a.x+dx*start+nx*(offset+thickness),a.y+dy*start+ny*(offset+thickness)]])
      }
      if(r.kind==='geoRoad'){
        strip(-width/2-.25,width+.5,'#d6cfbf')
        strip(-width/2,width,'#5d6266')
        strip(-width/2,.06,'#e9e4d6');strip(width/2-.06,.06,'#e9e4d6')
        if(!r.properties.oneway)for(let n=0;n<len;n+=1.5)strip(-.025,.05,'#f2e7c9',n/len,Math.min(1,(n+.65)/len))
        if(!/^(service|residential|construction|proposed)$/.test(r.name)&&width>1.2)for(const [c,d] of walks){
          // Segment intersection: t along the road, u along the footpath.
          const ex=d.x-c.x,ey=d.y-c.y,den=dx*ey-dy*ex
          if(Math.abs(den)<1e-6)continue
          const t=((c.x-a.x)*ey-(c.y-a.y)*ex)/den,u=((c.x-a.x)*dy-(c.y-a.y)*dx)/den
          if(t<=0||t>=1||u<=0||u>=1)continue
          const half=.6/len
          zebras.push(()=>{for(let o=-width/2+.15;o<width/2-.2;o+=.42)strip(o,.24,'#f4f1e6',t-half,t+half)})
        }
      } else if(r.properties.covered){
        // Sheltered walkway: warm tiled path, cream edges and green posts every few metres.
        strip(-.45,.9,'#c98f6a');strip(-.45,.08,'#efe3c8');strip(.37,.08,'#efe3c8')
        for(let n=0;n<len;n+=2)for(const o of [-.42,.34])box(g,a.x+dx*n/len-dy/len*o,a.y+dy*n/len+dx/len*o,.08,.08,22,['#5f8f6e','#4b7458','#3a5c46'])
        // Linkway roof: drawn per segment at its front depth, see-through enough to keep people beneath readable.
        const roof=scene.add.graphics().setDepth(depthAt(Math.max(a.x,b.x),Math.max(a.y,b.y))).setAlpha(.6)
        const nx=-dy/len,ny=dx/len,edge=(o:number,h:number)=>[[a.x+nx*o,a.y+ny*o,h],[b.x+nx*o,b.y+ny*o,h]] as [number,number,number][]
        poly(roof,'#4f8a6a',[...edge(-.55,24),...edge(.55,24).reverse()])
        poly(roof,'#6fae86',[...edge(-.5,26),...edge(.5,26).reverse()])
        poly(roof,'#3d6b52',[...edge(.55,22),...edge(.55,24).reverse()])
      } else strip(-.3,.6,'#e7dcc6')
    }
  }
  zebras.forEach(draw=>draw())
}
