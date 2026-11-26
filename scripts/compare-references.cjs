// Side-by-side sheets: each locked reference next to real gameplay captures of the precinct, for visual review.
// Usage: node scripts/compare-references.cjs [precinct-dir]   (after scripts/capture-precinct.cjs)
const { chromium } = require('playwright'), fs = require('node:fs'), path = require('node:path')
const dir = process.argv[2] || 'docs/precinct'
const img = f => `data:image/${f.endsWith('.webp') ? 'webp' : 'png'};base64,${fs.readFileSync(f).toString('base64')}`
const SHEETS = {
  'compare-day': ['docs/art-direction/reference-day.webp', 'golden-desktop-dialogue.png', 'golden-desktop-walkway.png', 'golden-desktop-hero.png'],
  'compare-evening': ['docs/art-direction/reference-evening.webp', 'evening-desktop-resident.png', 'evening-desktop-walkway.png', 'night-desktop-bus-stop.png'],
}
;(async () => {
  const b = await chromium.launch({ executablePath: process.env.CHROME_PATH || 'C:/Program Files/Google/Chrome/Application/chrome.exe' })
  const p = await b.newPage({ viewport: { width: 1640, height: 960 } })
  for (const [name, [ref, ...shots]] of Object.entries(SHEETS)) {
    const cell = (src, label) => `<figure><img src="${src}"><figcaption>${label}</figcaption></figure>`
    await p.setContent(`<style>body{margin:0;background:#1f1a16;color:#f3e9d2;font:13px Outfit,sans-serif;display:grid;grid-template-columns:1fr 1fr;gap:8px;padding:8px}
      figure{margin:0}img{width:100%;display:block;border:2px solid #24160c}figcaption{padding:3px 2px}</style>
      ${cell(img(ref), 'LOCKED REFERENCE (concept art)')}${shots.map(s => cell(img(path.join(dir, s)), 'ACTUAL GAME: ' + s.replace('.png', ''))).join('')}`)
    await p.screenshot({ path: path.join(dir, name + '.png'), fullPage: true })
  }
  await b.close()
})()
