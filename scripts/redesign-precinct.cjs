// Reproducible Tiled edit. Stable quest objects, coordinates and IDs stay intact.
const fs = require('node:fs')
const file = 'src/game/maps/neighbourhood.tmj'
const map = JSON.parse(fs.readFileSync(file, 'utf8'))
if (map.layers.some(l => l.objects?.some(o => o.name === 'Sunshine Court precinct'))) throw new Error('Sunshine Court is already applied; do not duplicate the migration.')
const layer = map.layers.find(l => l.name === 'Scenery and hotspots')
const ground = map.layers.find(l => l.type === 'tilelayer')
const props = values => Object.entries(values).map(([name,value]) => ({name,type:typeof value === 'number' ? 'float' : typeof value === 'boolean' ? 'bool' : 'string',value}))
const rect = (o,x,y,w,d) => Object.assign(o,{x:x*32,y:y*32,width:w*32,height:d*32})
const get = id => layer.objects.find(o => o.id === id)
const add = (type,name,x,y,w,d,properties={}) => {const o={id:map.nextobjectid++,name,type,rotation:0,visible:true,properties:props(properties)};rect(o,x,y,w,d);layer.objects.push(o);return o}
const move = (id,x,y,w,d) => rect(get(id),x,y,w,d)
const paint = (x,y,w,d,kind) => {for(let j=Math.max(0,Math.floor(y));j<Math.min(map.height,Math.ceil(y+d));j++)for(let i=Math.max(0,Math.floor(x));i<Math.min(map.width,Math.ceil(x+w));i++)ground.data[j*map.width+i]=kind*4+1+((i*7+j*13)&3)}
const block = (id,x,y,w,d,floors,accent) => {move(id,x,y,w,d);get(id).properties=props({number:get(id).name.replace('Block ',''),voidDeck:true,bay:2,floors,accent})}
// A residential superblock between two avenues. The former cross-road becomes a garden walk.
paint(0,18,19,24,0)
paint(0,18,19,1,1);paint(18,18,1,24,1);paint(0,41,19,1,1)
paint(2,19,1,22,1);paint(9,19,2,22,1);paint(3,22,15,2,1);paint(3,31,15,2,1)
paint(3,39,15,2,1);paint(10,36,8,5,1)
paint(12,23,5,4,3) // mission house keeps its existing footprint and door
paint(4,24,4,6,1);paint(10,27,3,3,1)
// Existing east avenue remains continuous; one narrow access spur serves the carpark.
move(3,22,28,52,3)
add('road','Sunshine Close access',16,29,6,2,{access:true})
paint(16,29,6,2,2);paint(13,28,4,4,1)
add('parking','Sunshine Close surface carpark',13,28,3,4)
add('parkedCar','Resident car',13.2,28.25,.7,.95,{colour:'#8b9a98'})
add('parkedCar','Resident car',13.2,30.75,.7,.95,{colour:'#a9aaa0'})
add('parkedCar','Resident car',15.1,29.5,.7,.95,{colour:'#927d76'})
// Remove crossings and lights that only served the deleted cross-road.
const remove = new Set([11,20,146,147,168,169,336,337,338,339,204,205,206,215,216,246,251])
layer.objects = layer.objects.filter(o=>!remove.has(o.id))
block(42,.8,20,2,8,8,'#9ea994')
block(55,.8,31,2,8,6,'#9ea994')
add('block','Block 112',8.4,19.4,10,2,{number:'112',voidDeck:true,bay:2,floors:4,accent:'#b8a28b'})
get(329).properties=props({number:'110',voidDeck:true,bay:2,floors:4,accent:'#b8a28b'})
move(44,4.5,24.2,2.7,2.7);move(45,4.5,28,2.5,2.5)
move(46,10.9,28,1.6,1.3);move(47,6.1,30.5,1.6,1.3)
move(252,11.2,30,1.1,.58)
// Continuous covered spine meets the open bays of 112 and 110, with a branch to the western blocks.
for (const [x,y,w,d] of [[9.25,21.5,1,3],[9.25,24.5,1,3],[9.25,27.5,1,3],[9.25,30.5,1,3],[2.25,22.4,3.5,1],[5.75,22.4,3.5,1],[9.25,32.5,3.1,1]]) add('linkway','Sunshine Court sheltered walk',x,y,w,d)
move(333,15.6,36.1,1,2.7);move(334,15.6,38.7,1,2.4)
// A low kopitiam overlooks the shared court, rather than another isolated monument.
add('building','Sunshine Court Kopitiam',3.5,19.4,3.6,2.4,{sprite:'kopi',sign:'SUNSHINE COURT|KOPITIAM'})
paint(3,19,4,4,1)
add('kopitiam','Court coffee table',6.8,21.8,.5,.5)
for (const [x,y] of [[3.4,26.7],[7.6,27.2],[11.7,27.3],[17.5,32],[3,39.7],[8.1,39.7]]) add('tree','Courtyard shade tree',x,y,.6,.6)
add('bench','Court seating',6.7,26.9,.9,.5)
add('bench','Garden seating',11,29.6,.9,.5)
add('bikes','Block 112 cycle stands',17,21.7,.9,.9)
add('sign','Sunshine Court wayfinding',10.8,32.3,1,.5,{text:'SUNSHINE COURT'})
// A single unified detail zone replaces the narrow Block 110 demonstration area.
move(361,0,18,23,28);get(361).name='Sunshine Court precinct';get(361).properties=props({surface:'estate'})
// Keep existing resident routes on the continuous public pedestrian network.
const residents = map.layers.find(l=>l.name==='Residents')
const route = (id,points) => {const o=residents.objects.find(o=>o.id===id);o.x=points[0][0]*32;o.y=points[0][1]*32;o.polyline=points.map(([x,y])=>({x:x*32-o.x,y:y*32-o.y}))}
route(321,[[8.6,27.45],[9,27.45],[9,30.8],[12.7,30.8],[12.7,33],[18.6,33]])
map.nextobjectid=Math.max(map.nextobjectid,...map.layers.flatMap(l=>(l.objects||[]).map(o=>o.id+1)))
fs.writeFileSync(file,JSON.stringify(map,null,1)+'\n')
