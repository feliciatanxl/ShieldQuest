import type Phaser from 'phaser'
import type { Point } from '../state/saveGame'
import type { MapProp } from './maps'
import { project, depthAt } from './isometric'
import { poly, box, floor } from './worldArt'

export { footprint, insidePolygon } from './geoPolygon'
import { footprint, insidePolygon } from './geoPolygon'
const STOREY=30, DECK=38
type Mass={p:MapProp;graphics:Phaser.GameObjects.RenderTexture;silhouettes:Point[][]}
const geographicMasses = new WeakMap<Phaser.Scene, Mass[]>()
function obscures(m:Mass,at:Point){
  if(depthAt(at.x,at.y)>m.graphics.depth)return false
  const feet=project(at.x,at.y)
  return m.silhouettes.some(poly=>insidePolygon(feet,poly)||insidePolygon({x:feet.x,y:feet.y-12},poly))
}
export const geographicallyCovered=(scene:Phaser.Scene,at:Point)=>(geographicMasses.get(scene)??[]).some(m=>obscures(m,at))
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
  if(!geographicMasses.has(scene)) { geographicMasses.set(scene,[]); scene.events.once('shutdown',()=>geographicMasses.delete(scene)) }
  const ground=scene.add.graphics().setDepth(-1999)
  poly(ground,'#24332f',points.map(a=>[a.x+.6,a.y+.15]),.22)
  // Render faces from back to front. Shared materials and screen-left sunlight.
  const faces=points.map((a,i)=>({a,b:points[(i+1)%points.length]})).sort((u,v)=>(u.a.x+u.a.y+u.b.x+u.b.y)-(v.a.x+v.a.y+v.b.x+v.b.y))
  for(const {a,b} of faces){
    const length=Math.hypot(b.x-a.x,b.y-a.y)
    if(length<.1)continue
    const face=(s:number,t:number,low:number,high:number,color:string)=>poly(g,color,[[a.x+(b.x-a.x)*s,a.y+(b.y-a.y)*s,low],[a.x+(b.x-a.x)*t,a.y+(b.y-a.y)*t,low],[a.x+(b.x-a.x)*t,a.y+(b.y-a.y)*t,high],[a.x+(b.x-a.x)*s,a.y+(b.y-a.y)*s,high]])
    face(0,1,z,height,Math.abs(b.x-a.x)>Math.abs(b.y-a.y)?'#e8ddc5':'#b7c3b2')
    for(let level=0;level<levels;level++){
      const low=z+level*STOREY
      face(0,1,low,low+2,'#909e91')
      const bays=Math.max(1,Math.floor(length/.85))
      for(let bay=0;bay<bays;bay++){
        const s=(bay+.18)/bays,t=(bay+.78)/bays
        face(s,t,low+8,low+23,'#516568')
        face(s,(s+t)/2,low+9,low+22,'#7d9693')
        if(deck&&bay%4===1){face(s,t,low+4,low+7,'#d1d2c6');face(s,t,low+5,low+6,'#929f98')}
        if(deck&&bay%5===3){face(s,t,low+2,low+3,'#8b9187')}
        if(deck&&bay%3===0)face(s,t,low+2,low+4,'#bfc4b7')
      }
    }
    if(deck){
      for(let n=0;n<length;n+=2.5){const t=n/length;box(g,a.x+(b.x-a.x)*t,a.y+(b.y-a.y)*t,.22,.22,z,['#c9cebe','#b0b7a8','#8b968a'])}
    }
  }
  poly(g,'#bfc4b7',points.map(a=>[a.x,a.y,height]))
  poly(g,'#9fa99d',points.map(a=>[a.x,a.y,height+3]),.55)
  const c={x:p.x+p.w/2,y:p.y+p.d/2}
  if(deck&&insidePolygon(c,points))box(g,c.x,c.y,.5,.5,z,['#c9cebe','#b0b7a8','#8b968a'])
  if(insidePolygon(c,points)&&levels>3)box(g,c.x-.4,c.y-.4,.8,.8,12,['#d4d4c3','#b1b7a7','#8c998e'],height+3)
  const projected=points.map(a=>project(a.x,a.y))
  const left=Math.floor(Math.min(...projected.map(a=>a.x)))-3,top=Math.floor(Math.min(...projected.map(a=>a.y))-height-20)
  const right=Math.ceil(Math.max(...projected.map(a=>a.x)))+3,bottom=Math.ceil(Math.max(...projected.map(a=>a.y)))+3
  const baked=scene.add.renderTexture(left,top,right-left,bottom-top).setOrigin(0).setDepth(depth)
  baked.draw(g,-left,-top);g.destroy()
  const silhouettes=[points.map(a=>project(a.x,a.y,height)),...faces.map(({a,b})=>[project(a.x,a.y,z),project(b.x,b.y,z),project(b.x,b.y,height),project(a.x,a.y,height)])]
  geographicMasses.get(scene)!.push({p,graphics:baked,silhouettes})
  const at=project(p.x+p.w/2,p.y+p.d/2,height+8)
  const title=p.name==='Ang Mo Kio Hub'?'AMK HUB · BUS INTERCHANGE':p.name==='Ang Mo Kio'?'ANG MO KIO MRT':p.properties.number==='724'?'724 · MARKET & FOOD CENTRE':p.name.startsWith('Building')?'':p.name
  if(title)scene.add.text(at.x,at.y,title,{fontFamily:'Outfit',fontSize:12,color:'#f5f0db',backgroundColor:'#304e48',padding:{x:4,y:2}}).setOrigin(.5,1).setDepth(depth+.1)
  return baked
}

export function geographicRoads(scene: Phaser.Scene, props: MapProp[]) {
  const g=scene.add.graphics().setDepth(-1999.5)
  for(const r of props.filter(p=>p.kind==='geoRoad'||p.kind==='geoPath')){
    const path=r.path??[],width=Number(r.properties.width)
    for(let i=1;i<path.length;i++){
      const a=path[i-1],b=path[i],dx=b.x-a.x,dy=b.y-a.y,len=Math.hypot(dx,dy)
      if(!len)continue
      const strip=(offset:number,thickness:number,color:string,start=0,end=1)=>{
        const nx=-dy/len,ny=dx/len
        poly(g,color,[[a.x+dx*start+nx*offset,a.y+dy*start+ny*offset],[a.x+dx*end+nx*offset,a.y+dy*end+ny*offset],[a.x+dx*end+nx*(offset+thickness),a.y+dy*end+ny*(offset+thickness)],[a.x+dx*start+nx*(offset+thickness),a.y+dy*start+ny*(offset+thickness)]])
      }
      if(r.kind==='geoRoad'){
        strip(-width/2-.2,width+.4,'#b8bcaf')
        strip(-width/2,width,'#62696a')
        strip(-width/2,.045,'#c1c2b5');strip(width/2,.045,'#c1c2b5')
        if(!r.properties.oneway)for(let n=0;n<len;n+=1.5)strip(0,.045,'#e1dbc4',n/len,Math.min(1,(n+.65)/len))
      } else if(r.properties.covered){
        // Source-backed sheltered paths, broken into independently editable objects.
        strip(-.2,.4,'#a9b8ad')
        for(let n=0;n<len;n+=3)floor(g,a.x+dx*n/len,a.y+dy*n/len,.12,.12,'#677f73')
      }
    }
  }
}
