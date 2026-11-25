// Screenshots of the Habbo-style vertical slice (scripts/habbo-slice.html) at desktop and mobile sizes.
// Usage: node scripts/capture-slice.cjs <out-dir> [label] [scenes, comma separated]   (needs Chrome; set CHROME_PATH elsewhere)
// Set SLICE_URL (e.g. http://127.0.0.1:5173) to reuse a running dev server instead of starting one.
const { chromium } = require('playwright'), path = require('node:path'), fs = require('node:fs')
const [out = 'docs/habbo-slice', label = 'after', only = 'Precinct,Minimart'] = process.argv.slice(2)
// Player spots per scene, in tiles: [name, x, y, zoom?] (zoom overrides the scene's own whole-number zoom).
const SPOTS = {
  Precinct: [['street', 12.4, 16.2], ['void-deck', 11, 5.6], ['minimart', 24.9, 8.6], ['bus-stop', 3.6, 16.95], ['overview', 15, 12, 1]],
  Minimart: [['interior', 7.72, 7.22]],
}
;(async () => {
  const base = process.env.SLICE_URL || 'http://127.0.0.1:5178'
  const server = process.env.SLICE_URL ? undefined : await (await import('vite')).createServer({ server: { host: '127.0.0.1', port: 5178, strictPort: true } })
  await server?.listen()
  const browser = await chromium.launch({ executablePath: process.env.CHROME_PATH || 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: true })
  fs.mkdirSync(out, { recursive: true })
  try {
    for (const [device, viewport] of [['desktop', { width: 1280, height: 800 }], ['mobile', { width: 390, height: 844 }]]) {
      for (const scene of only.split(',')) {
        const p = await browser.newPage({ viewport, deviceScaleFactor: 1 })
        const errors = []; p.on('pageerror', e => errors.push(String(e))); p.on('console', m => m.type() === 'error' && errors.push(m.text()))
        await p.goto(`${base}/scripts/habbo-slice.html?still&scene=${scene}`)
        await p.waitForFunction(() => window.__sliceReady, null, { timeout: 60000 }).catch(e => { throw new Error(errors.join(' | ') || e.message) })
        const fps = []
        for (const [name, x, y, zoom] of SPOTS[scene] ?? []) {
          await p.evaluate(([scene, x, y, zoom]) => {
            const s = window.__shieldGame.scene.getScene(scene)
            s.player.move({ x, y }, 0, { x: 0, y: 0 }); s.moveCamera?.(); s.updateProximity?.(); s.world.tick?.(0, 16, { x, y }, true); s.layout(); if (zoom) s.focusCamera(zoom)
          }, [scene, x, y, zoom])
          await p.waitForTimeout(900)
          fps.push(name + ' ' + await p.evaluate(() => Math.round(window.__shieldGame.loop.actualFps)))
          await p.screenshot({ path: path.join(out, `${label}-${device}-${name}.png`) })
        }
        console.log(device, scene, 'fps', fps.join(', '), errors.length ? 'errors: ' + errors.slice(0, 3).join(' | ') : 'no page errors')
        await p.close()
      }
    }
  } finally { await browser.close(); await server?.close() }
})()
