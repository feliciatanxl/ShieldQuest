import fs from 'node:fs'
// OSM API provides complete ways crossing the bounding box. Run explicitly to refresh.
const url='https://www.openstreetmap.org/api/0.6/map?bbox=103.841,1.365,103.852,1.375'
const response=await fetch(url,{headers:{'User-Agent':'ShieldQuest educational geographic reconstruction/1.0'},signal:AbortSignal.timeout(60000)})
if(!response.ok)throw Error(`OSM download failed: ${response.status}`)
const xml=await response.text()
const decode=s=>s.replaceAll('&amp;','&').replaceAll('&quot;','"').replaceAll('&apos;',"'").replaceAll('&lt;','<').replaceAll('&gt;','>')
const tags=s=>Object.fromEntries([...s.matchAll(/<tag k="([^"]*)" v="([^"]*)"/g)].map(m=>[decode(m[1]),decode(m[2])]))
const nodes=new Map([...xml.matchAll(/<node\b([^>]*?)(?:\/>|>([\s\S]*?)<\/node>)/g)].map(m=>{
 const a=Object.fromEntries([...m[1].matchAll(/(\w+)="([^"]*)"/g)].map(x=>[x[1],x[2]]))
 return[a.id,{lat:+a.lat,lon:+a.lon,tags:tags(m[2]||'')}]
}))
const ways=[...xml.matchAll(/<way\b([^>]*)>([\s\S]*?)<\/way>/g)].map(m=>({id:+m[1].match(/id="(\d+)"/)[1],tags:tags(m[2]),geometry:[...m[2].matchAll(/<nd ref="(\d+)"/g)].map(n=>nodes.get(n[1])).filter(Boolean).map(({lat,lon})=>({lat,lon}))}))
const elements=[...ways,...[...nodes].filter(([,n])=>n.tags.public_transport).map(([id,n])=>({id:+id,...n}))]
fs.mkdirSync('docs/geography',{recursive:true})
fs.writeFileSync('docs/geography/amk-osm.json',JSON.stringify({license:'ODbL 1.0',attribution:'© OpenStreetMap contributors',source:url,retrieved:new Date().toISOString(),elements}))
console.log(`Saved ${elements.length} OSM features. Run node scripts/import-amk.mjs and inspect the diff before accepting an update.`)
