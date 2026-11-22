// Deterministic validation/assembly only. No network or generation calls.
const fs = require('node:fs')
const assert = require('node:assert/strict')
const { decode, encode } = require('./png.cjs')
const source = process.argv[2] || 'src/game/assets/pixellab/modules/hdb-bay-64.png'
const template = decode('docs/hdb-templates/bay.png'), image = decode(source)
assert.deepEqual([image.w,image.h],[64,96], 'Exact native module canvas required')
let outside = 0, missing = 0, partial = 0, opaque = 0
for (let i=0; i<64*96; i++) {
 const a=template.data[i*4+3],b=image.data[i*4+3]
 outside += !a && !!b; missing += !!a && !b; partial += b>0 && b<255; opaque += b===255
}
assert.equal(outside,0,'No paint may extend outside the template')
assert.equal(missing,0,'Every face pixel must remain covered')
assert.equal(partial,0,'Hard alpha edges required')
const sheet={w:192,h:288,data:Buffer.alloc(192*288*4)}
const expected=Buffer.alloc(192*288),coverage=Buffer.alloc(192*288)
for(let floor=0;floor<3;floor++)for(let bay=0;bay<3;bay++) {
 const ox=bay*64,oy=bay*32+floor*64
 for(let y=0;y<96;y++)for(let x=0;x<64;x++) {
  const src=(y*64+x)*4, dest=(y+oy)*sheet.w+x+ox
  if(template.data[src+3])expected[dest]=1
  if(image.data[src+3]) { image.data.copy(sheet.data,dest*4,src,src+4);coverage[dest]=1 }
 }
}
assert.deepEqual(coverage,expected,'Repeat coverage must match the exact template assembly')
encode('docs/precinct-review/stage1-repeat-3x3.png',sheet)
const scale=3,preview={w:sheet.w*scale,h:sheet.h*scale,data:Buffer.alloc(sheet.w*scale*sheet.h*scale*4)}
for(let y=0;y<preview.h;y++)for(let x=0;x<preview.w;x++) {
 const src=(Math.floor(y/scale)*sheet.w+Math.floor(x/scale))*4,dst=(y*preview.w+x)*4
 const a=sheet.data[src+3]/255
 for(let c=0;c<3;c++)preview.data[dst+c]=Math.round(sheet.data[src+c]*a+[39,57,65][c]*(1-a))
 preview.data[dst+3]=255
}
encode('docs/precinct-review/stage1-repeat-preview.png',preview)
const report={source,width:64,height:96,anchor:{x:0,y:64},bayOffset:{x:64,y:32},storeyOffset:{x:0,y:-64},opaquePixels:opaque,transparentPixels:6144-opaque,addedExteriorPixels:outside,missingFacePixels:missing,semiTransparentPixels:partial,templateAlphaExact:true,repeatCoverageExact:true,note:'Pixel geometry and repeat coverage are exact. Material seams still require visual inspection; no automatic texture retouch or paid retry was performed.'}
fs.writeFileSync('docs/precinct-review/stage1-validation.json',JSON.stringify(report,null,2)+'\n')
console.log(JSON.stringify(report))
