// Real-game close-ups for the Singapore authenticity pass: HDB facade, void deck, shops, Minimart, landscaping, roads,
// at noon and at night, desktop and mobile. Spots are picked from the live estate layout, so they survive layout changes.
// Usage: node scripts/capture-authenticity.cjs <out-dir> [label] [base-url]   (needs a running `npm run dev` and Chrome)
const { chromium } = require('playwright'), path = require('node:path'), fs = require('node:fs')
const config = require('../src/game/maps/amk-config.json')
const [out = 'docs/sg-authenticity', label = 'after', base = 'http://localhost:5173'] = process.argv.slice(2)
const save = {
  version: 3, mapRevision: 'amk-central-v1@x2.5', name: 'Mei', scene: 'Neighbourhood', position: { x: config.start.x * 2.5, y: config.start.y * 2.5 }, walked: 0, tutorial: 'done', coins: 240, reducedMotion: true,
  avatar: { skin: 2, style: 1, hair: 1, topStyle: 1, top: 3, bottomStyle: 2, bottom: 1, shoeStyle: 0, shoes: 2, glasses: 0, accessory: 0 },
  investigation: { entered: false, walked: 0, clues: [], spokeToJun: false, choice: null }, shield: {}, collectedGuardians: [],
  escapeRoom: { currentLevelId: 'mysterious-house', mode: 'solo', inventory: [], puzzleStates: {}, drawerUnlocked: false, exitUnlocked: false, hints: {}, elapsedMs: 0 }, shop: {},
}
;(async () => {
  const browser = await chromium.launch({ executablePath: process.env.CHROME_PATH || 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: true, args: process.env.SOFTWARE_GL ? [] : ['--enable-gpu', '--use-angle=d3d11', '--ignore-gpu-blocklist'] })
  fs.mkdirSync(out, { recursive: true })
  try {
    for (const [time, hour] of [['day', '12:00'], ['night', '21:30']]) for (const [device, viewport, mobile] of [['desktop', { width: 1280, height: 800 }, false], ['mobile', { width: 390, height: 844 }, true]]) {
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
      // Spots from the live layout: the minimart door, the nearest void-deck block (front, under, facade), a shop row, a lawn.
      const spots = await p.evaluate(async () => {
        const { estate: E } = await import('/src/game/estate.ts')
        const door = E.hotspots.find(h => h.id === 'enter').at
        const d2 = b => Math.hypot(b.x + b.w / 2 - door.x, b.y + b.d / 2 - door.y)
        const decks = E.buildings.filter(b => b.deck && !b.unit).sort((a, b) => d2(a) - d2(b))
        const deck = decks[0], shops = E.buildings.filter(b => b.style === 'shops').sort((a, b) => d2(a) - d2(b))[0]
        const mid = b => b.alongX ? { x: b.x + b.w * .4, y: b.y + b.d } : { x: b.x + b.w, y: b.y + b.d * .4 }
        const under = b => b.alongX ? { x: b.x + b.w * .45, y: b.y + b.d - 1.4 } : { x: b.x + b.w - 1.4, y: b.y + b.d * .45 }
        const lawn = E.things.filter(t => t.kind === 'tree').sort((a, b) => Math.hypot(a.x - door.x, a.y - door.y) - Math.hypot(b.x - door.x, b.y - door.y))[3]
        const road = E.roads.filter(r => r.major).map(r => r.pts[Math.floor(r.pts.length / 2)]).sort((a, b) => Math.hypot(a.x - door.x, a.y - door.y) - Math.hypot(b.x - door.x, b.y - door.y))[0]
        const o = (p, dx, dy) => [p.x + dx, p.y + dy]
        const mall = E.buildings.filter(b => b.style === 'mall').sort((a, b) => b.w * b.d - a.w * a.d)[0]
        return { minimart: o(door, .5, 1.8), 'deck-front': o(mid(deck), deck.alongX ? 0 : 3, deck.alongX ? 3 : 0), 'void-deck': o(under(deck), 0, 0), facade: o(mid(decks[1] ?? deck), (decks[1] ?? deck).alongX ? 0 : 6, (decks[1] ?? deck).alongX ? 6 : 0), shops: o(mid(shops), shops.alongX ? 0 : 2, shops.alongX ? 2 : 0), landscape: o(lawn, 1, 1), road: o(road, 3, 3), ...(mall ? { mall: [mall.x + mall.w + 2, mall.y + mall.d + 2] } : {}) }
      })
      const fps = []
      for (const [name, [x, y]] of Object.entries(spots)) {
        if (time === 'night' && !['minimart', 'deck-front', 'void-deck', 'road', 'shops', 'mall'].includes(name)) continue
        for (const zoom of mobile ? [1] : [1, 1.5]) {
          await p.evaluate(([x, y, zoom]) => {
            const s = window.__shieldGame.scene.getScene('Neighbourhood')
            s.userZoom = zoom
            for (let r = 0; r < 12; r += .25) for (let a = 0; a < 16; a++) {
              const q = { x: x + Math.cos(a / 8 * Math.PI) * r, y: y + Math.sin(a / 8 * Math.PI) * r }
              if (s.free(q)) { s.player.move(q, 0, { x: 0, y: 1 }); s.moveCamera(); s.layout(); s.updateProximity(); return }
            }
          }, [x, y, zoom])
          await p.waitForTimeout(1500)
          fps.push(`${name}@${zoom} ${await p.evaluate(() => Math.round(window.__shieldGame.loop.actualFps))}`)
          await p.screenshot({ path: path.join(out, `${label}-${time}-${device}-${name}${zoom > 1 ? '-close' : ''}.png`) })
        }
      }
      console.log(time, device, '| fps', fps.join(', '), errors.length ? '| errors: ' + errors.slice(0, 3).join(' | ') : '| no page errors')
      await p.close()
    }
  } finally { await browser.close() }
})()
