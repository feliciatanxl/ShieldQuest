// Real-game screenshots of representative Sunshine Estate spots at gameplay zoom, desktop and mobile.
// Usage: node scripts/capture-world.cjs <out-dir> [label]   (needs Chrome; set CHROME_PATH elsewhere)
const { chromium } = require('playwright'), path = require('node:path'), fs = require('node:fs')
const [out = 'docs/world-shots', label = 'now', only] = process.argv.slice(2)
const SPOTS = { start: [99.7, 98.9], minimart: [104.1, 87.7], 'freeze-frame': [62.4, 71.4], 'block-160': [70, 30], junction: [80, 96] }
;(async () => {
  const { createServer } = await import('vite')
  const server = await createServer({ server: { host: '127.0.0.1', port: 5177, strictPort: true } }); await server.listen()
  const browser = await chromium.launch({ executablePath: process.env.CHROME_PATH || 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: true })
  fs.mkdirSync(out, { recursive: true })
  try {
    for (const [device, viewport] of [['desktop', { width: 1280, height: 800 }], ['mobile', { width: 390, height: 844 }]]) {
      if (only && only !== device) continue
      const p = await browser.newPage({ viewport })
      // Pin Singapore noon so day lighting is comparable between runs; one extra shot at 9 pm shows the night look.
      await p.addInitScript(() => { const Real = Date, noon = new Real('2026-11-25T12:00:00+08:00').getTime(), start = Real.now()
        window.__clock = noon; globalThis.Date = class extends Real { constructor(...a) { super(...(a.length ? a : [window.__clock + Real.now() - start])) } static now() { return window.__clock + Real.now() - start } } })
      const errors = []; p.on('pageerror', e => errors.push(String(e)))
      await p.goto('http://127.0.0.1:5177/scripts/amk-review.html')
      await p.waitForFunction(() => window.__amkReady, null, { timeout: 120000 })
      await p.addStyleTag({ content: 'nav,output{display:none!important}' })
      const fps = []
      for (const [name, [x, y]] of Object.entries(SPOTS)) {
        await p.evaluate(([x, y]) => {
          window.__amkReview.setView('')
          const s = window.__shieldGame.scene.getScene('Neighbourhood')
          s.launch.reducedMotion = true; s.player.move({ x, y }, 0, { x: 0, y: 0 }); s.moveCamera(); s.layout(); s.follow()
        }, [x, y])
        await p.waitForTimeout(1200)
        fps.push(await p.evaluate(() => Math.round(window.__shieldGame.loop.actualFps) + '@' + window.__shieldGame.scene.getScene('Neighbourhood').cameras.main.zoom.toFixed(2)))
        await p.screenshot({ path: path.join(out, `${label}-${device}-${name}.png`) })
      }
      await p.evaluate(() => { window.__clock = new Date('2026-11-25T13:00:00Z').getTime() })
      await p.waitForTimeout(1500)
      await p.screenshot({ path: path.join(out, `${label}-${device}-night.png`) })
      console.log(device, 'fps', fps.join(','), errors.length ? 'errors: ' + errors.slice(0, 2).join(' | ') : 'no page errors')
      await p.close()
    }
  } finally { await browser.close(); await server.close() }
})()
