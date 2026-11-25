// Real-game screenshots of the migrated Sunshine Estate through the normal main menu (Continue), desktop and mobile.
// Usage: node scripts/capture-estate.cjs <out-dir> [label] [base-url]   (needs a running `npm run dev` and Chrome)
// The saved game is a source-revision save (5 m map) placed at the old start, so the run also exercises save migration.
const { chromium } = require('playwright'), path = require('node:path'), fs = require('node:fs')
const config = require('../src/game/maps/amk-config.json')
const [out = 'docs/estate-migration', label = 'after', base = 'http://127.0.0.1:5173'] = process.argv.slice(2)
const S = 2.5, e = p => [p.x * S, p.y * S]
// Gameplay-tile spots: the start, each mission door, a void deck, the town centre and a park edge.
const SPOTS = { start: e(config.start), minimart: e(config.entrances.shop), 'freeze-frame': e(config.entrances.houseH), whisper: e(config.entrances.houseI), mystery: e(config.entrances.house), avenue: [200, 240], park: [120, 90] }
const save = {
  version: 3, mapRevision: config.revision, name: 'Mei', scene: 'Neighbourhood', position: config.start, walked: 0, tutorial: 'done', coins: 240, reducedMotion: true,
  avatar: { skin: 2, style: 1, hair: 1, topStyle: 1, top: 3, bottomStyle: 2, bottom: 1, shoeStyle: 0, shoes: 2, glasses: 0, accessory: 0 },
  investigation: { entered: false, walked: 0, clues: [], spokeToJun: false, choice: null }, shield: {}, collectedGuardians: [],
  escapeRoom: { currentLevelId: 'mysterious-house', mode: 'solo', inventory: [], puzzleStates: {}, drawerUnlocked: false, exitUnlocked: false, hints: {}, elapsedMs: 0 }, shop: {},
}
;(async () => {
  const browser = await chromium.launch({ executablePath: process.env.CHROME_PATH || 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: true })
  fs.mkdirSync(out, { recursive: true })
  try {
    for (const [device, viewport, mobile] of [['desktop', { width: 1280, height: 800 }, false], ['mobile', { width: 390, height: 844 }, true]]) {
      const p = await browser.newPage({ viewport, isMobile: mobile, hasTouch: mobile })
      await p.addInitScript(([save]) => {
        const Real = Date, noon = new Real('2026-11-25T12:00:00+08:00').getTime(), start = Real.now()
        globalThis.Date = class extends Real { constructor(...a) { super(...(a.length ? a : [noon + Real.now() - start])) } static now() { return noon + Real.now() - start } }
        if (!sessionStorage.getItem('seeded')) { localStorage.setItem('shieldquest.phase1', JSON.stringify(save)); sessionStorage.setItem('seeded', '1') }
      }, [save])
      const errors = []; p.on('pageerror', e => errors.push(String(e).slice(0, 200)))
      await p.goto(base + '/')
      await p.getByRole('button', { name: /Continue/ }).click()
      await p.waitForFunction(() => window.__shieldGame?.scene.getScene('Neighbourhood')?.player, null, { timeout: 60000 })
      await p.waitForTimeout(2500)
      const migrated = await p.evaluate(() => JSON.parse(localStorage.getItem('shieldquest.phase1')).mapRevision)
      await p.screenshot({ path: path.join(out, `${label}-${device}-menu-continue.png`) })
      const fps = []
      for (const [name, [x, y]] of Object.entries(SPOTS)) {
        const ok = await p.evaluate(([x, y]) => {
          const s = window.__shieldGame.scene.getScene('Neighbourhood')
          // Stand on the nearest walkable tile to the spot.
          for (let r = 0; r < 12; r += .5) for (let a = 0; a < 16; a++) {
            const q = { x: x + Math.cos(a / 8 * Math.PI) * r, y: y + Math.sin(a / 8 * Math.PI) * r }
            if (s.free(q)) { s.player.move(q, 0, { x: 0, y: 1 }); s.moveCamera(); s.layout(); s.updateProximity(); return true }
          }
          return false
        }, [x, y])
        await p.waitForTimeout(1800)
        fps.push(`${name} ${await p.evaluate(() => Math.round(window.__shieldGame.loop.actualFps))}${ok ? '' : ' (no free tile)'}`)
        await p.screenshot({ path: path.join(out, `${label}-${device}-${name}.png`) })
      }
      const memory = await p.evaluate(() => performance.memory ? Math.round(performance.memory.usedJSHeapSize / 1048576) + ' MB JS heap' : '')
      console.log(device, 'save revision now', migrated, '| fps', fps.join(', '), '|', memory, errors.length ? '| errors: ' + errors.slice(0, 3).join(' | ') : '| no page errors')
      await p.close()
    }
  } finally { await browser.close() }
})()
