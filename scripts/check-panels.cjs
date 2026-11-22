const {chromium}=require(require('path').join(require('os').tmpdir(),'shieldquest-qa/node_modules/playwright'));
(async()=>{const browser=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});try{
const page=await browser.newPage(),errors=[];page.on('pageerror',e=>errors.push(String(e)));
const panels=['friends','guardians','settings','missions','pack','map','profile','shop','pause','dialogue','evidence','controls','restart','spot','hold','influence','consequences','lead','defend'];
for(const size of [{width:1024,height:900},{width:390,height:844}]){
await page.setViewportSize(size);let baseline;
for(const panel of panels){
await page.goto('http://127.0.0.1:5173/scripts/panel-review.html?panel='+panel);await page.locator('dialog[open]').waitFor();await page.evaluate(()=>document.fonts.ready);await page.locator('dialog').evaluate(async d=>{await Promise.all(d.getAnimations().map(a=>a.finished.catch(()=>{})))});
const layout=await page.locator('dialog').evaluate(d=>{const rect=d.getBoundingClientRect(),css=getComputedStyle(d),heading=getComputedStyle(d.querySelector('.modal-heading h2')),close=d.querySelector('.close').getBoundingClientRect();return{overflow:d.scrollWidth>d.clientWidth,right:rect.right,bottom:rect.bottom,font:heading.fontFamily,titleSize:heading.fontSize,padding:css.padding,background:css.backgroundColor,border:css.borderColor,close:close.width}});
if(layout.overflow||layout.right>size.width+.5||layout.bottom>size.height+.5)throw Error(panel+' overflows '+JSON.stringify(layout));
if(panel==='friends')baseline=layout;
if(layout.font!==baseline.font||layout.titleSize!==baseline.titleSize||layout.background!==baseline.background||layout.border!==baseline.border||layout.close!==baseline.close)throw Error(panel+' styling differs from Friends '+JSON.stringify(layout));
await page.screenshot({path:`docs/geography/modal-${panel}-${size.width}.png`});
if(panel==='settings'){const toggle=page.getByRole('switch');await toggle.check();if(!await toggle.isChecked())throw Error('Motion switch failed')}
await page.keyboard.press('Escape');if(await page.locator('dialog[open]').count())throw Error(panel+' did not close');
}}
if(errors.length)throw Error(errors.join('\n'));console.log(`PASS: ${panels.length} dialogs at desktop/mobile; identical Friends header fonts, shell palette and close buttons; no overflow or page errors; switch and Escape verified.`)
}finally{await browser.close()}})().catch(e=>{console.error(e);process.exitCode=1});
