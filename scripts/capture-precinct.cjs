// Real-game captures of the Sunshine Minimart precinct for review against the locked references
// (docs/art-direction/reference-*.webp): golden hour 17:30, evening 19:15, late night 23:00; desktop and mobile.
// Usage: node scripts/capture-precinct.cjs <out-dir> [only-spot] [base-url]   (needs a running `npm run dev` and Chrome)
const { chromium } = require('playwright'), path = require('node:path'), fs = require('node:fs')
const [out = 'docs/precinct', only, base = 'http://localhost:5173'] = process.argv.slice(2)
const save = {
  version: 3, mapRevision: 'amk-central-v1@x2.5', name: 'Mei', scene: 'Neighbourhood', position: { x: 256.1, y: 252 }, walked: 0, tutorial: 'done', coins: 240, reducedMotion: true,
  avatar: { skin: 2, style: 1, hair: 1, topStyle: 1, top: 3, bottomStyle: 2, bottom: 1, shoeStyle: 0, shoes: 2, glasses: 0, accessory: 0 },
  investigation: { entered: false, walked: 0, clues: [], spokeToJun: false, choice: null }, shield: {}, collectedGuardians: [],
  escapeRoom: { currentLevelId: 'mysterious-house', mode: 'solo', inventory: [], puzzleStates: {}, drawerUnlocked: false, exitUnlocked: false, hints: {}, elapsedMs: 0 }, shop: {},
}
// Gameplay-tile spots: [x, y, zoom multiplier]. "hero" frames the minimart door, the void deck and the covered walkway.
const SPOTS = { hero: [254.2, 254.4, 1], facade: [263.2, 225.5, 1], 'void-deck': [258.8, 232, 1.5], minimart: [255.2, 252.3, 1.5], walkway: [247.6, 236, 1], 'bus-stop': [237.3, 296.5, 1], dialogue: [254.6, 262.7, 1], resident: [249.4, 243.4, 1] }
const TIMES = (process.env.TIMES ? process.env.TIMES.split(',') : ['golden', 'evening', 'night']).map(t => [t, { golden: '17:30', evening: '19:15', night: '23:00' }[t]])
;(async () => {
  const browser = await chromium.launch({ executablePath: process.env.CHROME_PATH || 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: true, args: ['--enable-gpu', '--use-angle=d3d11', '--ignore-gpu-blocklist'] })
  fs.mkdirSync(out, { recursive: true })
  try {
    for (const [time, hour] of TIMES) for (const [device, viewport, mobile] of [['desktop', { width: 1280, height: 800 }, false], ['mobile', { width: 390, height: 844 }, true]]) {
      if (mobile && time === 'night') continue
      const p = await browser.newPage({ viewport, isMobile: mobile, hasTouch: mobile })
      await p.addInitScript(([save, hour]) => {
        const Real = Date, at = new Real(`2026-11-25T${hour}:00+08:00`).getTime(), start = Real.now()
        globalThis.Date = class extends Real { constructor(...a) { super(...(a.length ? a : [at + Real.now() - start])) } static now() { return at + Real.now() - start } }
        if (!sessionStorage.getItem('seeded')) { localStorage.setItem('shieldquest.phase1', JSON.stringify(save)); sessionStorage.setItem('seeded', '1') }
      }, [save, hour])
      const errors = []; p.on('pageerror', e => errors.push(String(e).slice(0, 200)))
      await p.goto(base + '/')
      await p.getByRole('button', { name: /Continue/ }).click()
      await p.waitForFunction(() => window.__shieldGame?.scene.getScene('Neighbourhood')?.player, null, { timeout: 60000 })
      await p.waitForTimeout(2000)
      const fps = []
      for (const [name, [x, y, zoom]] of Object.entries(SPOTS)) {
        if (only && name !== only) continue
        if (mobile && !['hero', 'void-deck', 'minimart', 'dialogue'].includes(name)) continue
        await p.evaluate(([x, y, zoom]) => {
          const s = window.__shieldGame.scene.getScene('Neighbourhood')
          s.userZoom = zoom
          for (let r = 0; r < 12; r += .25) for (let a = 0; a < 16; a++) {
            const q = { x: x + Math.cos(a / 8 * Math.PI) * r, y: y + Math.sin(a / 8 * Math.PI) * r }
            if (s.free(q)) { s.player.move(q, 0, { x: -1, y: 0 }); s.moveCamera(); s.layout(); s.updateProximity(); return }
          }
        }, [x, y, zoom])
        await p.waitForTimeout(3600)
        fps.push(`${name} ${await p.evaluate(() => Math.round(window.__shieldGame.loop.actualFps))}`)
        await p.screenshot({ path: path.join(out, `${time}-${device}-${name}.png`) })
      }
      console.log(time, device, '| fps', fps.join(', '), errors.length ? '| errors: ' + errors.slice(0, 3).join(' | ') : '| no page errors')
      await p.close()
    }
  } finally { await browser.close() }
})()
