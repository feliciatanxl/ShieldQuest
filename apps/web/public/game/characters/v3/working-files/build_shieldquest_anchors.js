const fs=require('fs'), path=require('path'), zlib=require('zlib');
const root='C:\\Users\\felth\\AppData\\Local\\Temp\\ShieldQuest anchor pack';
for(const dir of ['characters/female','characters/male','characters/mixed','previews','style-guide','working-files'])fs.mkdirSync(path.join(root,dir),{recursive:true});
const rgb=h=>{h=h.replace('#','');return [parseInt(h.slice(0,2),16),parseInt(h.slice(2,4),16),parseInt(h.slice(4,6),16),255]};
function canvas(w,h){return {w,h,p:new Uint8Array(w*h*4)}}
function dot(a,x,y,c){x=Math.round(x);y=Math.round(y);if(x<0||y<0||x>=a.w||y>=a.h)return;let j=(y*a.w+x)*4,v=typeof c==='string'?rgb(c):c;a.p.set(v,j)}
function rect(a,x,y,w,h,c){for(let yy=y;yy<y+h;yy++)for(let xx=x;xx<x+w;xx++)dot(a,xx,yy,c)}
function poly(a,pts,c){let ys=pts.map(p=>p[1]),lo=Math.floor(Math.min(...ys)),hi=Math.ceil(Math.max(...ys));for(let y=lo;y<=hi;y++)for(let x=0;x<a.w;x++){let hit=false;for(let i=0,j=pts.length-1;i<pts.length;j=i++){let q=pts[i],r=pts[j];if((q[1]>y)!==(r[1]>y)&&x<(r[0]-q[0])*(y-q[1])/(r[1]-q[1])+q[0])hit=!hit}if(hit)dot(a,x,y,c)}}
function line(a,x1,y1,x2,y2,c){let n=Math.max(Math.abs(x2-x1),Math.abs(y2-y1));for(let i=0;i<=n;i++)dot(a,x1+(x2-x1)*i/n,y1+(y2-y1)*i/n,c)}
function ell(a,cx,cy,rx,ry,c){for(let y=cy-ry;y<=cy+ry;y++)for(let x=cx-rx;x<=cx+rx;x++)if(((x-cx)/rx)**2+((y-cy)/ry)**2<=1)dot(a,x,y,c)}
function blit(dst,src,x,y,scale=1){for(let sy=0;sy<src.h;sy++)for(let sx=0;sx<src.w;sx++){let j=(sy*src.w+sx)*4;if(!src.p[j+3])continue;let v=src.p.slice(j,j+4);rect(dst,x+sx*scale,y+sy*scale,scale,scale,v)}}
const crcTable=Array.from({length:256},(_,i)=>{for(let k=0;k<8;k++)i=i&1?0xedb88320^(i>>>1):i>>>1;return i>>>0});
function crc(b){let c=0xffffffff;for(let v of b)c=crcTable[(c^v)&255]^(c>>>8);return(c^0xffffffff)>>>0}
function chunk(t,b){let name=Buffer.from(t),size=Buffer.alloc(4),cc=Buffer.alloc(4);size.writeUInt32BE(b.length);cc.writeUInt32BE(crc(Buffer.concat([name,b])));return Buffer.concat([size,name,b,cc])}
function png(a,file){let raw=Buffer.alloc(a.h*(1+a.w*4));for(let y=0;y<a.h;y++){raw[y*(a.w*4+1)]=0;Buffer.from(a.p.subarray(y*a.w*4,(y+1)*a.w*4)).copy(raw,y*(a.w*4+1)+1)}let hdr=Buffer.alloc(13);hdr.writeUInt32BE(a.w,0);hdr.writeUInt32BE(a.h,4);hdr[8]=8;hdr[9]=6;fs.writeFileSync(file,Buffer.concat([Buffer.from([137,80,78,71,13,10,26,10]),chunk('IHDR',hdr),chunk('IDAT',zlib.deflateSync(raw)),chunk('IEND',Buffer.alloc(0))]))}
let chars=[
 {id:'F01',sex:'female',name:'Polytechnic student',skin:['#7d4a3d','#ae7058','#d69472','#f2bc91'],hair:'#29283b',hairHi:'#4b4252',style:'long',top:'#eee2c8',topHi:'#fff1d6',topShade:'#cfc0a4',pant:'#343950',pantHi:'#515971',shoe:'#f9f5e9',accent:'#36b4ac',item:'lanyard'},
 {id:'F02',sex:'female',name:'Secondary student',skin:['#a05d46','#ca8563','#e5a77a','#f7c79a'],hair:'#282c39',hairHi:'#53515c',style:'shoulder',top:'#f8f2e4',topHi:'#ffffff',topShade:'#d4ccbb',pant:'#435b78',pantHi:'#627b96',shoe:'#fbfaf1',accent:'#7a9dbe',item:'backpack'},
 {id:'F03',sex:'female',name:'Young working adult',skin:['#714d43','#a66d5b','#c99174','#e9b391'],hair:'#302a37',hairHi:'#5f4a59',style:'bob',top:'#b0d2c9',topHi:'#d8eee5',topShade:'#82afa6',pant:'#554a5c',pantHi:'#74647b',shoe:'#d1a982',accent:'#b77f68',item:'tote'},
 {id:'F04',sex:'female',name:'Malay young adult',skin:['#65473c','#97684f','#c78e68','#e6b183'],hair:'#748679',hairHi:'#a8b5a4',style:'hijab',top:'#e8ddc7',topHi:'#fff1d9',topShade:'#c2b69f',pant:'#77775b',pantHi:'#979878',shoe:'#f6eddf',accent:'#8a9b82',item:'crossbody'},
 {id:'F05',sex:'female',name:'Neighbourhood auntie',skin:['#8c5845','#bb7b5f','#dea17c','#f0bd91'],hair:'#453b48',hairHi:'#84757c',style:'wavy',top:'#a97789',topHi:'#dca0a4',topShade:'#805d77',pant:'#5c5965',pantHi:'#7a7680',shoe:'#77544c',accent:'#f2ca8e',item:'pattern'},
 {id:'F06',sex:'female',name:'Artsy uni student',skin:['#8a5945','#bb8062','#dfaa80','#f0c59a'],hair:'#322d33',hairHi:'#8a6b55',style:'messy',top:'#8b817f',topHi:'#b5a89f',topShade:'#605e65',pant:'#d7c4a8',pantHi:'#f1debe',shoe:'#f1e5cf',accent:'#d7a86a',item:'artsy'},
 {id:'M01',sex:'male',name:'Polytechnic student',skin:['#604037','#85533f','#b87955','#dca074'],hair:'#282a38',hairHi:'#484456',style:'textured',top:'#91b5c8',topHi:'#bfd8e0',topShade:'#688da7',pant:'#58574e',pantHi:'#747367',shoe:'#f3e9d8',accent:'#42b8aa',item:'cargo'},
 {id:'M02',sex:'male',name:'Secondary student',skin:['#7a4d3f','#a96a50','#d18f69','#e8b18c'],hair:'#282d35',hairHi:'#494d57',style:'short',top:'#e9eee5',topHi:'#ffffff',topShade:'#c8d4ce',pant:'#344f68',pantHi:'#526b80',shoe:'#f8f8ee',accent:'#8aa6b3',item:'backpack'},
 {id:'M03',sex:'male',name:'Delivery rider',skin:['#654239','#935d49','#be805d','#dfa681'],hair:'#353445',hairHi:'#565364',style:'helmet',top:'#c89758',topHi:'#edbb76',topShade:'#a9723e',pant:'#383d4b',pantHi:'#555d68',shoe:'#d6dce1',accent:'#e39b4b',item:'delivery'},
 {id:'M04',sex:'male',name:'Young office worker',skin:['#745447','#9b725c','#c59778','#ddb08b'],hair:'#292d36',hairHi:'#535460',style:'short',top:'#b9c8d8',topHi:'#e2edf0',topShade:'#889fb7',pant:'#383e52',pantHi:'#535d6c',shoe:'#6c5044',accent:'#9a684f',item:'messenger'},
 {id:'M05',sex:'male',name:'Indian young adult',skin:['#4b342e','#704a3a','#995f43','#bf8057'],hair:'#25282d',hairHi:'#434143',style:'curly',top:'#776c76',topHi:'#9c8d95',topShade:'#534d5d',pant:'#d1bea1',pantHi:'#e6d5ba',shoe:'#eee3ce',accent:'#d9b68f',item:'street'},
 {id:'M06',sex:'male',name:'Neighbourhood uncle',skin:['#745447','#9b725c','#c59778','#ddb08b'],hair:'#6f7077',hairHi:'#b0adb1',style:'grey',top:'#8da6a0',topHi:'#b5c9bf',topShade:'#6b8881',pant:'#998268',pantHi:'#b59d7c',shoe:'#775a4d',accent:'#e8d9ba',item:'polo'}
];
chars=chars.filter(c=>['F01','F04','M01'].includes(c.id));
const K='#292c3d',deep='#222638';
function draw(c,dir){
 let a=canvas(64,96),S=c.skin[2],Sl=c.skin[1],Sh=c.skin[3],back=dir==='back',side=dir==='left'||dir==='right',sg=dir==='left'?-1:1,center=side?32+sg*2:32;
 // Rear accessories and hair have their own silhouettes.
 if(c.item==='backpack'||c.item==='delivery'){
   let box=c.item==='delivery';rect(a,side?(sg===1?18:33):17,35,30,box?29:31,K);
   rect(a,side?(sg===1?20:35):19,37,26,box?25:27,box?'#aa6c3e':'#5b7189');
   rect(a,23,42,18,3,c.accent);if(box){rect(a,25,48,14,9,'#dba56a');rect(a,29,51,6,3,'#f4ddaa')}
 }
 if(c.style==='long'||c.style==='shoulder'||c.style==='bob'||c.style==='wavy'||c.style==='messy'){
   ell(a,center,28,side?14:17,c.style==='long'?20:17,K);
   rect(a,center-15,28,30,c.style==='long'?22:12,K);
   rect(a,center-13,29,26,c.style==='long'?20:10,c.hair);
   if(c.style==='long'){rect(a,center-13,43,6,12,c.hairHi);rect(a,center+7,43,6,12,c.hairHi)}
 }
 if(c.style==='hijab'){
   ell(a,center,27,18,20,K);ell(a,center,27,16,18,c.hair);
   poly(a,[[18,28],[24,33],[23,48],[16,54],[18,38]],K);
   poly(a,[[20,29],[25,34],[24,46],[18,51],[20,38]],c.hair);
   poly(a,[[42,30],[47,30],[51,47],[44,52],[39,39]],K);
   poly(a,[[42,31],[46,32],[48,46],[44,49],[40,38]],c.hairHi)
 }
 // Grounded feet: baseline y=91 for all poses.
 let legL=side?25:18,legR=side?33:36,legW=side?11:11;
 if(c.id==='M06'){legL=side?25:18;legR=side?33:36}
 if(c.id==='F03'||c.id==='F06'){legL=side?23:16;legR=side?35:35;legW=side?13:13}
 for(let x of [legL,legR]){rect(a,x,60,legW,24,K);rect(a,x+2,62,legW-4,c.id==='M06'?13:19,c.pant);rect(a,x+2,64,2,13,c.pantHi);rect(a,x+4,76,3,5,c.pantHi)}
 if(c.id==='M06'||c.id==='F02'||c.id==='M02'){let y=c.id==='M06'?74:75;for(let x of [legL,legR]){rect(a,x+2,y,legW-4,7,c.id==='M06'?S:'#f6f0df');rect(a,x+3,y+1,2,4,c.id==='M06'?Sh:'#ffffff')}}
 for(let x of [side?22:14,side?32:34]){
   rect(a,x,82,side?17:18,9,K);
   rect(a,x+2,83,side?13:14,5,c.shoe);
   if(c.id==='F05'||c.id==='M06'){rect(a,x+3,84,10,3,S);rect(a,x+2,84,12,2,c.shoe)}
   else {rect(a,x+3,84,10,1,c.topHi);rect(a,x+1,88,side?16:17,2,c.accent)}
 }
 // Arms frame a broad, comfortable top.
 let bodyLeft=side?23:19,bodyRight=side?42:45;
 rect(a,side?(sg===1?21:40):12,43,side?6:8,17,K);
 rect(a,side?(sg===1?22:41):13,49,side?4:6,11,S);
 if(!side){rect(a,46,43,7,17,K);rect(a,47,49,5,11,S)}
 poly(a,side?[[24,38],[40,38],[47,45],[45,53],[42,51],[43,64],[22,64],[22,51],[19,53],[20,45]]:
 [[21,38],[43,38],[50,42],[54,50],[48,54],[45,50],[46,64],[18,64],[19,50],[16,54],[10,50],[14,42]],K);
 poly(a,side?[[25,40],[39,40],[44,45],[43,50],[40,48],[41,62],[24,62],[24,48],[21,50],[22,45]]:
 [[22,40],[42,40],[48,44],[51,49],[47,51],[43,47],[44,62],[20,62],[21,47],[17,51],[13,49],[17,44]],c.top);
 rect(a,side?25:22,43,3,14,c.topHi);rect(a,side?39:41,47,2,11,c.topShade);rect(a,24,60,16,2,c.topShade);
 if(c.id==='F05'){for(let [x,y] of [[26,46],[34,44],[40,51],[27,56],[35,57]]){rect(a,x,y,3,2,c.accent);dot(a,x+1,y+1,'#fff0d2');dot(a,x-1,y+2,c.topShade)}}
 if(c.item==='cargo'){rect(a,19,68,8,6,K);rect(a,20,69,6,4,c.pantHi);rect(a,38,70,8,6,K);rect(a,39,71,6,4,c.pantHi)}
 if(c.item==='polo'){rect(a,29,41,7,6,c.topHi);rect(a,32,43,1,6,K);rect(a,39,48,3,2,c.accent);rect(a,23,48,19,2,c.accent);rect(a,25,55,14,2,c.topShade)}
 if(c.item==='tote'){let tx=side?(sg===1?42:14):43;rect(a,tx,48,3,23,K);rect(a,tx+1,49,1,14,c.accent);rect(a,tx-1,59,14,17,K);rect(a,tx,60,12,15,'#c99877');rect(a,tx+2,64,8,1,'#efcaa6')}
 if(c.item==='delivery'&&back){rect(a,20,39,24,26,K);rect(a,22,41,20,22,'#ae713c');rect(a,26,49,12,7,c.accent)}
 if(c.id==='F02'&&!side){poly(a,[[22,58],[42,58],[46,71],[18,71]],K);poly(a,[[23,60],[41,60],[44,69],[20,69]],c.pant);for(let x of [24,30,36,41])line(a,x,61,x+(x<32?-2:2),68,c.pantHi)}
 if(c.id==='M02'){rect(a,19,62,27,11,c.pant);rect(a,19,70,27,2,K);rect(a,23,44,13,2,c.topShade);rect(a,31,45,2,11,c.accent)}
 if(c.id==='F04'){poly(a,[[22,57],[42,57],[45,74],[19,74]],K);poly(a,[[23,58],[41,58],[43,72],[21,72]],c.pant);rect(a,21,41,4,19,c.topHi);rect(a,40,43,3,18,c.topShade)}
 if(c.id==='F06'){rect(a,20,41,7,22,c.topShade);rect(a,39,41,6,22,c.topShade);rect(a,26,42,13,19,'#e8d8c4');rect(a,27,46,12,7,'#abb8b7');rect(a,22,47,4,2,c.accent);rect(a,39,47,4,2,c.accent)}
 if(c.id==='M04'){rect(a,27,40,12,5,c.topHi);rect(a,31,42,2,18,c.topShade);rect(a,27,61,12,2,'#5b4d48');rect(a,31,61,4,2,'#c8a475')}
 if(c.id==='M05'){rect(a,21,41,8,21,c.topShade);rect(a,37,41,8,21,c.topShade);rect(a,29,42,8,19,'#e8dccb');rect(a,20,67,8,5,K);rect(a,21,68,6,3,c.pantHi);rect(a,38,67,8,5,K);rect(a,39,68,6,3,c.pantHi)}
 // Head over the body; head height and eye line stay fixed.
 rect(a,29,34,7,7,K);rect(a,30,34,5,6,S);
 ell(a,center,26,side?14:16,17,K);ell(a,center,26,side?12:14,15,c.hair);
 if(back){
   rect(a,center-11,27,22,10,c.hair);rect(a,center-8,16,15,3,c.hairHi);
   if(c.style==='long')rect(a,center-10,39,20,13,c.hair);
   if(c.style==='helmet'){rect(a,center-14,15,28,11,c.accent);rect(a,center-11,17,22,3,c.topHi)}
   if(c.style==='hijab'){poly(a,[[21,17],[32,11],[43,17],[48,33],[43,43],[22,43],[17,33]],K);poly(a,[[23,18],[32,13],[41,18],[46,33],[42,41],[23,41],[19,32]],c.hair);rect(a,25,23,13,3,c.hairHi);rect(a,37,39,5,13,c.hairHi)}
 } else if(side){
   poly(a,sg===1?[[26,20],[36,19],[43,24],[44,29],[40,34],[29,34],[25,29]]:
   [[20,24],[27,19],[38,20],[41,29],[35,34],[24,34],[20,29]],K);
   ell(a,center+sg*2,27,10,10,S);rect(a,center+sg*4,22,4,6,Sh);
   rect(a,center+sg*4,26,2,4,K);dot(a,center+sg*4,26,'#ffffff');
   rect(a,center+sg*6,31,2,1,Sl);rect(a,center-sg*8,20,5,12,c.hair);
   if(c.style==='helmet'){rect(a,center-13,13,26,11,c.accent);rect(a,center-10,15,16,3,c.topHi);rect(a,center+sg*5,22,9,3,K)}
   else if(c.style==='hijab'){
    poly(a,[[center-13,18],[center-3,12],[center+9,17],[center+11,31],[center+5,38],[center-8,35]],K);
    poly(a,[[center-11,19],[center-2,14],[center+7,19],[center+9,29],[center+3,35],[center-7,33]],c.hair);
    rect(a,center-sg*11,32,6,19,c.hairHi);rect(a,center+sg*8,28,2,8,c.hair);
    ell(a,center+sg*5,27,7,8,S);rect(a,center+sg*7,23,3,3,Sh);
    rect(a,center+sg*8,26,2,3,K);dot(a,center+sg*8,26,'#ffffff');
    dot(a,center+sg*11,30,Sl);rect(a,center+sg*6,33,3,1,K)
   }
   else {rect(a,center-8,14,13,4,c.hairHi);rect(a,center-sg*7,32,5,7,c.hair)}
 }else{
   poly(a,[[25,19],[39,19],[44,23],[43,32],[39,36],[27,36],[21,31],[21,24]],K);
   poly(a,[[25,20],[39,20],[42,23],[41,31],[38,34],[28,34],[24,30],[23,24]],S);
   rect(a,26,22,13,4,Sh);rect(a,25,29,4,2,Sl);rect(a,38,29,4,2,Sl);
   rect(a,27,26,3,4,K);rect(a,36,26,3,4,K);dot(a,28,26,'#ffffff');dot(a,37,26,'#ffffff');
   rect(a,26,31,3,1,'#e88989');rect(a,38,31,3,1,'#e88989');
   if(c.id==='F05'||c.id==='M06'){rect(a,29,31,8,1,K);rect(a,31,32,4,1,K)}
   else if(c.id==='F02'||c.id==='M01'){rect(a,30,31,6,1,K);rect(a,31,32,4,1,'#a74f58')}
   else {rect(a,31,32,4,1,K);dot(a,32,33,Sh)}
   if(c.id==='F06'||c.id==='M04'||c.id==='M06'){rect(a,26,25,5,6,K);rect(a,35,25,5,6,K);rect(a,27,26,3,4,Sh);rect(a,36,26,3,4,Sh);rect(a,31,26,4,1,K);dot(a,28,27,K);dot(a,37,27,K)}
   if(c.style==='helmet'){rect(a,20,13,25,11,K);rect(a,22,14,21,9,c.accent);rect(a,25,16,16,3,c.topHi);rect(a,20,21,27,3,K)}
   else if(c.style==='textured'){for(let [x,y] of [[22,17],[26,14],[31,15],[36,13],[41,16]])rect(a,x,y,5,5,c.hair);rect(a,25,15,9,2,c.hairHi)}
   else if(c.style==='hijab'){poly(a,[[20,21],[23,14],[31,10],[39,12],[45,18],[45,26],[41,24],[39,21],[27,21],[23,25]],K);poly(a,[[22,21],[25,15],[31,12],[39,14],[43,19],[42,23],[39,19],[27,19],[24,23]],c.hair);poly(a,[[21,30],[25,33],[29,37],[40,35],[45,27],[46,38],[40,43],[24,40],[18,36]],c.hair);rect(a,20,31,4,11,c.hairHi);rect(a,37,17,4,2,c.hairHi)}
   else if(c.style==='curly'){for(let [x,y] of [[20,18],[23,14],[28,12],[33,13],[38,13],[42,17],[23,21],[39,20]])ell(a,x,y,4,4,c.hair);for(let [x,y] of [[24,14],[31,13],[38,16]])rect(a,x,y,2,2,c.hairHi)}
   else if(c.style==='messy'){for(let [x,y] of [[21,17],[26,14],[31,11],[36,15],[41,14]])poly(a,[[x,y+6],[x+2,y],[x+6,y+5]],c.hair);rect(a,22,20,22,4,c.hair);rect(a,39,18,5,3,c.hairHi)}
   else if(c.style==='grey'||c.style==='short'){rect(a,22,16,22,7,c.hair);rect(a,27,14,13,3,c.hairHi)}
   else {poly(a,[[21,20],[24,15],[31,13],[40,14],[44,19],[42,23],[36,19],[31,21],[23,24]],c.hair);rect(a,25,16,11,2,c.hairHi);
    if(c.style==='wavy'){rect(a,19,27,4,6,c.hairHi);rect(a,42,28,4,5,c.hairHi)}}
 }
 // Front-specific accessories remain visible over the face and shirt.
 if(!back&&(c.item==='lanyard'||c.id==='M01')){line(a,28,39,31,50,c.accent);line(a,36,39,33,50,c.accent);rect(a,29,49,8,8,K);rect(a,30,50,6,6,'#fff8e9');rect(a,31,51,4,2,c.accent)}
 if(c.item==='backpack'&&!back){rect(a,19,42,3,14,c.accent);rect(a,42,42,3,14,c.accent)}
 if(c.item==='delivery'&&!back){rect(a,25,45,14,5,'#f2d3a6');rect(a,30,46,4,3,K)}
 if(c.id==='F02'||c.id==='M02'){if(!back)rect(a,35,46,5,2,c.accent)}
 if(c.id==='F03'){rect(a,23,45,4,3,c.topHi);rect(a,38,45,4,3,c.topHi)}
 if(c.item==='crossbody'&&!back){line(a,22,41,41,61,c.accent);line(a,23,41,42,61,K);rect(a,38,57,13,14,K);rect(a,39,58,11,12,'#a47563');rect(a,42,61,5,2,c.accent)}
 if(c.item==='messenger'&&!back){line(a,43,41,20,64,c.accent);line(a,42,41,19,64,K);rect(a,13,60,15,14,K);rect(a,14,61,13,12,'#9b694f');rect(a,17,64,7,2,'#caa786')}
 if(c.item==='artsy'&&!back){rect(a,29,37,7,3,'#e8cfac');rect(a,28,39,9,2,K);rect(a,28,40,9,2,'#777c80');rect(a,18,54,4,10,K);rect(a,17,61,10,12,K);rect(a,18,62,8,10,'#9a756c');rect(a,20,65,4,2,c.accent)}
 if(c.item==='street'&&!back){line(a,25,39,40,59,'#e9dccb');rect(a,25,58,18,4,K);rect(a,26,59,16,2,c.topShade);rect(a,22,44,4,3,c.accent)}
 // Pixel highlights and folds add texture without blurring.
 if(!back){dot(a,25,47,c.topHi);dot(a,26,48,c.topHi);line(a,23,57,25,59,c.topShade);dot(a,40,57,c.topShade);dot(a,41,58,c.topShade);dot(a,24,75,c.pantHi);dot(a,40,77,c.pantHi)}
 // Anchor-specific finishing: fitted pixel clusters, tiny seams, and personality cues.
 if(c.id==='F01'){
   if(back){rect(a,21,34,5,18,c.hairHi);rect(a,37,36,4,16,c.hairHi);line(a,25,41,29,45,c.hair);rect(a,24,57,15,2,c.topShade)}
   else if(side){rect(a,center-sg*10,32,4,19,c.hairHi);rect(a,center-sg*9,47,3,7,c.hair);dot(a,center+sg*8,30,'#e88885')}
   else {poly(a,[[24,16],[28,13],[31,13],[28,17],[25,19]],c.hairHi);rect(a,39,18,2,7,c.hairHi);dot(a,25,30,'#e88989');dot(a,40,30,'#e88989');line(a,30,31,35,31,K);dot(a,32,32,'#fff0de')}
   rect(a,20,45,2,8,c.topShade);rect(a,42,47,2,6,c.topShade);line(a,22,61,39,61,c.topShade);
   rect(a,26,43,3,2,c.topHi);rect(a,36,44,2,3,c.topHi);
   for(let x of [16,36]){rect(a,x+3,85,4,1,'#bdc9c5');dot(a,x+8,86,'#bdc9c5')}
   if(!side){rect(a,18,68,2,8,c.pantHi);rect(a,44,67,2,9,c.pantHi)}
 }
 if(c.id==='M01'){
   if(!back&&!side){rect(a,27,24,3,1,c.hair);rect(a,36,24,3,1,c.hair);rect(a,30,31,6,1,K);rect(a,31,32,4,1,Sh)}
   if(back){rect(a,23,42,18,2,c.topShade);rect(a,24,49,16,2,c.topHi);rect(a,24,56,14,2,c.topShade)}
   for(let [x,y] of (side?[[26,66],[34,68]]:[[20,66],[39,68]])){rect(a,x,y,side?6:8,7,K);rect(a,x+1,y+1,side?4:6,5,c.pantHi);rect(a,x+2,y+2,side?2:4,1,c.topShade);rect(a,x+3,y+5,2,1,K)}
   rect(a,22,57,4,2,c.topShade);rect(a,40,57,3,2,c.topShade);if(!side){rect(a,49,55,4,2,K);rect(a,49,55,3,1,c.accent)}
   rect(a,16,85,9,1,'#c7d0c8');rect(a,36,85,9,1,'#c7d0c8');
   if(!back){rect(a,24,46,3,4,c.topHi);rect(a,38,43,4,3,c.topShade)}
 }
 if(c.id==='F04'){
   if(back){poly(a,[[25,32],[40,32],[44,46],[40,55],[36,53],[35,44],[24,42]],c.hairHi);line(a,27,20,39,20,'#aebba9')}
   else if(side){rect(a,center-sg*10,35,3,14,'#aab7a4');line(a,center-sg*4,39,center-sg*1,48,c.hairHi);dot(a,center+sg*8,30,'#d7797b')}
   else {line(a,24,19,36,16,c.hairHi);line(a,28,38,35,40,c.hairHi);rect(a,40,34,3,7,'#aab7a4');rect(a,26,30,2,1,'#dd8980');rect(a,39,30,2,1,'#dd8980')}
   rect(a,23,47,2,15,c.topShade);rect(a,40,44,2,16,c.topHi);rect(a,27,58,10,2,c.topShade);
   rect(a,40,59,8,2,'#d09f80');rect(a,41,63,4,2,'#d6b198');rect(a,22,71,4,2,c.pantHi);rect(a,39,70,3,2,c.pantHi);
   for(let x of [16,35]){rect(a,x+3,85,6,1,'#c7d3cb');rect(a,x+6,88,7,1,c.accent)}
 }
 return a
}
const poses=['front','back','left','right'], rendered={};
for(let c of chars){rendered[c.id]={};for(let dir of poses){let a=draw(c,dir);rendered[c.id][dir]=a;png(a,path.join(root,'characters',c.sex,`${c.id}_${dir}.png`))}}
// Exact grid sheet for game-engine slicing: 4 columns × 8 rows, no gutters.
let sheet=canvas(64*4,96*3);chars.forEach((c,row)=>poses.forEach((dir,col)=>blit(sheet,rendered[c.id][dir],col*64,row*96)));png(sheet,path.join(root,'working-files','anchor_3x4_64x96.png'));
// Pixel UI drawing and compact block-letter labels.
const glyph={A:['010','101','111','101','101'],B:['110','101','110','101','110'],C:['011','100','100','100','011'],D:['110','101','101','101','110'],E:['111','100','110','100','111'],F:['111','100','110','100','100'],G:['011','100','101','101','011'],H:['101','101','111','101','101'],I:['111','010','010','010','111'],J:['011','001','001','101','010'],K:['101','101','110','101','101'],L:['100','100','100','100','111'],M:['101','111','111','101','101'],N:['101','111','111','111','101'],O:['010','101','101','101','010'],P:['110','101','110','100','100'],R:['110','101','110','101','101'],S:['011','100','010','001','110'],T:['111','010','010','010','010'],U:['101','101','101','101','111'],V:['101','101','101','101','010'],W:['101','101','111','111','101'],X:['101','101','010','101','101'],Y:['101','101','010','010','010'],'0':['111','101','101','101','111'],'1':['010','110','010','010','111'],'2':['110','001','010','100','111'],'3':['110','001','010','001','110'],'4':['101','101','111','001','001'],'5':['111','100','110','001','110'],'6':['011','100','110','101','010'],'7':['111','001','010','010','010'],'8':['010','101','010','101','010'],'9':['010','101','011','001','110'],' ':['000','000','000','000','000']};
function label(a,str,x,y,color,scale=2){for(let ch of str.toUpperCase()){let g=glyph[ch]||glyph[' '];for(let yy=0;yy<5;yy++)for(let xx=0;xx<3;xx++)if(g[yy][xx]==='1')rect(a,x+xx*scale,y+yy*scale,scale,scale,color);x+=4*scale}}
function panel(a,x,y,w,h){rect(a,x,y,w,h,'#344257');rect(a,x+2,y+2,w-4,h-4,'#f3ead7');rect(a,x+5,y+5,w-10,h-10,'#e5ddcd')}
const bg='#dbe7df';
let sel=canvas(900,370);rect(sel,0,0,900,370,bg);rect(sel,0,0,900,55,'#283e49');label(sel,'SHIELDQUEST  THREE ANCHORS',30,19,'#f8ead4',3);
chars.forEach((c,i)=>{let x=25+i*290,y=72;panel(sel,x,y,270,273);rect(sel,x+8,y+10,254,205,'#c8dcd2');rect(sel,x+8,y+180,254,35,'#adbeae');blit(sel,rendered[c.id].front,x+46,y+5,2);label(sel,c.id,x+16,y+225,'#344257',3);label(sel,c.name,x+16,y+250,'#526776',2)});
png(sel,path.join(root,'previews','anchor_lineup.png'));
let featured=['F01','M01','F04'];let comp=canvas(1110,665);rect(comp,0,0,comp.w,comp.h,'#dbe7df');rect(comp,0,0,comp.w,48,'#283e49');label(comp,'FRONT  BACK  LEFT  RIGHT',250,16,'#fff2d8',3);
featured.forEach((id,i)=>{let x=20,y=60+i*198;rect(comp,x,y,1070,189,i%2?'#e9eee6':'#f3ead7');label(comp,id,x+12,y+74,'#344257',3);poses.forEach((dir,j)=>{rect(comp,x+111+j*238,y+4,224,178,'#c4d4ca');rect(comp,x+111+j*238,y+155,224,27,'#a7bcad');blit(comp,rendered[id][dir],x+158+j*238,y+1,2);label(comp,dir,x+116+j*238,y+169,'#516872',1)})});
png(comp,path.join(root,'previews','direction_sheet.png'));
let guide=canvas(1040,630);rect(guide,0,0,1040,630,'#e9e5d8');rect(guide,0,0,1040,58,'#283e49');label(guide,'SHIELDQUEST  PIXEL STYLE GUIDE',30,20,'#fff2d9',3);
panel(guide,22,75,415,530);label(guide,'SHARED PALETTE',42,97,'#33424d',3);
let sw=['#292c3d','#4b4252','#f2bc91','#d69472','#995f43','#eee2c8','#cfc0a4','#36b4ac','#b0d2c9','#a97789','#748679','#c89758','#343950','#554a5c','#f9f5e9'];
sw.forEach((v,i)=>{let x=44+(i%3)*122,y=142+Math.floor(i/3)*83;rect(guide,x-2,y-2,62,52,'#344257');rect(guide,x,y,58,48,v)});
panel(guide,452,75,565,530);label(guide,'SCALE  64 X 96',474,97,'#33424d',3);
blit(guide,rendered.F04.front,460,141,3);blit(guide,rendered.M01.front,700,141,3);
label(guide,'2 PX OUTLINE',480,457,'#344257',2);label(guide,'TOP LEFT LIGHT',480,487,'#344257',2);label(guide,'FACE AND CLOTHES',480,517,'#344257',2);label(guide,'FEET ON Y 91',480,547,'#344257',2);
png(guide,path.join(root,'style-guide','pixel_style_guide.png'));
// Cozy HDB pixel mockup: repeated void-deck columns, shophouse awnings and greenery.
let m=canvas(960,560);rect(m,0,0,960,560,'#b5d5d4');rect(m,0,0,960,90,'#c9e3de');
rect(m,0,80,960,296,'#e8d8bc');rect(m,0,90,960,9,'#c4ae96');
for(let row=0;row<3;row++)for(let col=0;col<12;col++){let x=25+col*78,y=112+row*82;rect(m,x-3,y-3,58,59,'#b7a891');rect(m,x,y,52,53,'#7c9fa1');rect(m,x+3,y+3,46,47,'#a9c7c2');rect(m,x+24,y+3,3,47,'#eee4cd');rect(m,x+3,y+24,46,3,'#eee4cd');rect(m,x+5,y+5,17,16,'#dfd6bb');rect(m,x+29,y+30,17,16,'#dfd6bb')}
rect(m,0,356,960,13,'#ab947a');rect(m,0,369,960,71,'#ded0b3');for(let x=72;x<960;x+=184){rect(m,x,369,20,71,'#bda98b');rect(m,x+2,370,16,67,'#eddfc4')}
// Void deck wayfinding, minimart awning, letter boxes, and textured tiled floor.
rect(m,105,370,150,52,'#455f61');rect(m,110,375,140,42,'#88aaa7');rect(m,110,375,140,10,'#e9c47f');label(m,'MINIMART',131,389,'#fff4d5',2);
rect(m,350,370,95,56,'#b78b70');for(let y=375;y<419;y+=10)for(let x=355;x<441;x+=20){rect(m,x,y,17,8,'#d2b39a');rect(m,x+3,y+2,3,2,'#9d796c')}
rect(m,488,381,85,28,'#f3e3c0');label(m,'BLK 128',498,389,'#405b60',2);
for(let x=0;x<960;x+=58){rect(m,x,444,1,31,'#c2b39d');rect(m,x+25,475,1,48,'#b7aa9e')}
rect(m,0,439,960,121,'#a1b9a4');rect(m,0,472,960,88,'#a2a099');rect(m,0,477,960,8,'#ebe0c9');for(let x=15;x<960;x+=84)rect(m,x,526,40,2,'#ded3bd');
for(let x of [28,315,635,900]){rect(m,x+27,391,11,75,'#665848');ell(m,x+32,378,38,27,'#547f62');ell(m,x+14,386,22,22,'#6b9772');ell(m,x+51,383,24,23,'#749c74');rect(m,x+3,456,62,13,'#9a785e');rect(m,x+7,453,54,9,'#b28e70')}
rect(m,250,408,88,18,'#617a79');rect(m,256,427,6,30,'#617a79');rect(m,326,427,6,30,'#617a79');
['F01','M01','F04'].forEach((id,i)=>{let x=200+i*240;rect(m,x+17,493,32,3,'#857f76');blit(m,rendered[id].front,x,401,1)});
rect(m,16,16,283,34,'#344d57');label(m,'SHIELDQUEST SG',30,27,'#f9e8c6',3);
png(m,path.join(root,'previews','hdb_neighbourhood_mockup.png'));
let manifest={canvas:[64,96],baseline:91,poses,characters:chars.map(c=>({id:c.id,name:c.name,gender:c.sex})),spritesheet:{file:'working-files/anchor_3x4_64x96.png',columns:poses,rows:chars.map(c=>c.id),cell:[64,96]},previews:['anchor_lineup.png','direction_sheet.png','hdb_neighbourhood_mockup.png'],styleGuide:'style-guide/pixel_style_guide.png',note:'Original pixel characters. Directional sprites are separately composed; no smoothing or horizontal flip.'};
fs.writeFileSync(path.join(root,'manifest.json'),JSON.stringify(manifest,null,2));
fs.copyFileSync(__filename,path.join(root,'working-files','build_shieldquest_anchors.js'));
console.log(JSON.stringify({root,poses:12,files:fs.readdirSync(path.join(root,'characters','female')).length+fs.readdirSync(path.join(root,'characters','male')).length,previews:manifest.previews},null,2));
