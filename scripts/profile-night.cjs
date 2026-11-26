// Night-time frame profile of the real game: FPS per variant (as is / light pools hidden / tint pass off) and a CPU
// profile of the hot functions. Usage: node scripts/profile-night.cjs [base-url] [hour]
const { chromium } = require('playwright')
const config = require('../src/game/maps/amk-config.json')
const [base = 'http://localhost:5173', hour = '21:30'] = process.argv.slice(2)
const save = {
  version: 3, mapRevision: 'amk-central-v1@x2.5', name: 'Mei', scene: 'Neighbourhood', position: { x: 254.2, y: 254.4 }, walked: 0, tutorial: 'done', coins: 240, reducedMotion: true,
  avatar: { skin: 2, style: 1, hair: 1, topStyle: 1, top: 3, bottomStyle: 2, bottom: 1, shoeStyle: 0, shoes: 2, glasses: 0, accessory: 0 },
  investigation: { entered: false, walked: 0, clues: [], spokeToJun: false, choice: null }, shield: {}, collectedGuardians: [],
  escapeRoom: { currentLevelId: 'mysterious-house', mode: 'solo', inventory: [], puzzleStates: {}, drawerUnlocked: false, exitUnlocked: false, hints: {}, elapsedMs: 0 }, shop: {},
}
;(async () => {
  const browser = await chromium.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: true, args: ['--enable-gpu', '--use-angle=d3d11', '--ignore-gpu-blocklist'] })
  const p = await browser.newPage({ viewport: { width: 1280, height: 800 } })
  await p.addInitScript(([save, hour]) => {
    const Real = Date, at = new Real(`2026-11-25T${hour}:00+08:00`).getTime(), start = Real.now()
    globalThis.Date = class extends Real { constructor(...a) { super(...(a.length ? a : [at + Real.now() - start])) } static now() { return at + Real.now() - start } }
    localStorage.setItem('shieldquest.phase1', JSON.stringify(save))
  }, [save, hour])
  await p.goto(base + '/')
  await p.getByRole('button', { name: /Continue/ }).click()
  await p.waitForFunction(() => window.__shieldGame?.scene.getScene('Neighbourhood')?.player, null, { timeout: 60000 })
  console.log('renderer', await p.evaluate(() => { const g = window.__shieldGame.renderer.gl; const d = g && g.getExtension('WEBGL_debug_renderer_info'); return d ? g.getParameter(d.UNMASKED_RENDERER_WEBGL) : 'canvas' }))
  await p.waitForTimeout(3000)
  const fps = async () => { await p.waitForTimeout(2500); return p.evaluate(() => Math.round(window.__shieldGame.loop.actualFps)) }
  const stats = await p.evaluate(() => { const s = window.__shieldGame.scene.getScene('Neighbourhood'); const l = s.children.list; return { objects: l.length, emissive: l.filter(o => o.getData?.('emissive')).length, visible: l.filter(o => o.visible).length } })
  console.log('objects', stats)
  console.log('as is', await fps())
  await p.evaluate(() => { const s = window.__shieldGame.scene.getScene('Neighbourhood'); s.children.list.filter(o => o.getData?.('emissive')).forEach(o => { o.setData('emissive-off', true); o.setAlpha(0) }) })
  console.log('emissive alpha 0', await fps())
  const client = await p.context().newCDPSession(p)
  await client.send('Profiler.enable'); await client.send('Profiler.start')
  await p.waitForTimeout(3000)
  const { profile } = await client.send('Profiler.stop')
  const self = new Map(), dt = profile.timeDeltas, byId = new Map(profile.nodes.map(n => [n.id, n]))
  profile.samples.forEach((id, i) => { const n = byId.get(id), k = `${n.callFrame.functionName || '(anon)'} ${n.callFrame.url.split('/').pop()}:${n.callFrame.lineNumber}`; self.set(k, (self.get(k) || 0) + (dt[i] || 0)) })
  const total = [...self.values()].reduce((a, b) => a + b, 0)
  console.log([...self].sort((a, b) => b[1] - a[1]).slice(0, 18).map(([k, v]) => `${(v / total * 100).toFixed(1)}% ${k}`).join('\n'))
  await browser.close()
})()
