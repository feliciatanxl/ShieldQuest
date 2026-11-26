import Phaser from 'phaser'
import {nightStrength} from '../state/singaporeWeather'
import type {MapProp} from './maps'
import {project} from './isometric'
import {updateGeographicLighting} from './geography'

/** Singapore's solar cycle: cool ambient dusk, lit windows and soft shelter/entrance pools. */
export function estateLighting(scene:Phaser.Scene,props:MapProp[]){
  const veil=scene.add.rectangle(0,0,1,1,0x0a193d).setOrigin(0).setScrollFactor(0).setDepth(50000)
  veil.setName('night-atmosphere')
  const pools=scene.add.graphics().setDepth(50001)
  const locations=props.filter(p=>['bus','lamp','entry'].includes(p.kind)).map(p=>({x:p.x+p.w/2,y:p.y+p.d/2}))
  for(const p of locations){
    const at=project(p.x,p.y)
    for(let radius=48;radius>=8;radius-=8){pools.fillStyle(0xffd7a0,.018);pools.fillEllipse(at.x,at.y,radius*2,radius)}
    pools.fillStyle(0xffe3a4,.28);pools.fillEllipse(at.x,at.y,9,4)
  }
  let last=-Infinity,strength=nightStrength(new Date())
  function tick(time:number){
    if(time-last<500)return
    last=time;strength=nightStrength(new Date())
    // Screen overlay resizes with the canvas; world lights continue to follow the camera.
    const camera=scene.cameras.main,zoom=camera.zoom,w=scene.scale.width,h=scene.scale.height
    // Scroll factor removes panning, but Phaser still applies camera zoom.
    veil.setPosition(w/2-w/(2*zoom),h/2-h/(2*zoom)).setSize(w/zoom,h/zoom).setAlpha(strength*.46)
    pools.setAlpha(strength).setVisible(strength>.01)
    updateGeographicLighting(scene,strength)
    scene.registry.set('nightStrength',strength)
  }
  tick(0)
  return tick
}

export type Light = { x: number; y: number; z?: number; r: number; color?: number; depth?: number; base?: number }
const GLOW = 'estate-glow'
/** A light pool: smooth radial falloff (the evening reference's feathered lamp light), squashed 2:1 onto the ground.
 *  Only the light layer is soft; every sprite stays crisp. */
function glowTexture(scene: Phaser.Scene) {
  if (scene.textures.exists(GLOW)) return
  const canvas = document.createElement('canvas')
  canvas.width = 64; canvas.height = 32
  const ctx = canvas.getContext('2d')!, g = ctx.createRadialGradient(32, 32, 0, 32, 32, 32)
  g.addColorStop(0, 'rgba(255,255,255,.95)'); g.addColorStop(.35, 'rgba(255,255,255,.55)'); g.addColorStop(.7, 'rgba(255,255,255,.18)'); g.addColorStop(1, 'rgba(255,255,255,0)')
  ctx.setTransform(1, 0, 0, .5, 0, 0); ctx.fillStyle = g; ctx.fillRect(0, 0, 64, 64)
  scene.textures.addCanvas(GLOW, canvas)
}
const mix = (a: number, b: number, t: number) => {
  const ch = (s: number) => Math.round(((a >> s) & 255) + ((((b >> s) & 255) - ((a >> s) & 255)) * t))
  return (ch(16) << 16) | (ch(8) << 8) | ch(0)
}
/** Night as light, not a veil: the world is tinted towards a warm dusk then a deep blue night (characters less, so they
 *  stay readable), and light sources are additive images at their own depth, so a wall in front still hides a window
 *  behind it. Ground pools (lamps, void decks, shopfronts, linkways) sit just above the ground. */
export function estateNight(scene: Phaser.Scene, lights: Light[]) {
  glowTexture(scene)
  const glows = new Set<Phaser.GameObjects.Image>()
  const glow = (l: Light) => {
    const at = project(l.x, l.y, l.z ?? 0)
    const image = scene.add.image(Math.round(at.x), Math.round(at.y), GLOW).setBlendMode(Phaser.BlendModes.ADD).setDepth(l.depth ?? -1999)
      .setScale(Math.round(l.r) / 32).setTint(l.color ?? 0xffc27a).setData('emissive', true).setData('base', l.base ?? .55).setVisible(false)
    image.once(Phaser.GameObjects.Events.DESTROY, () => glows.delete(image))
    glows.add(image)
    return image
  }
  lights.forEach(glow)
  let last = -Infinity, strength = 0, tint = 0xffffff, people = 0xffffff, tinted = false
  function tick(time: number) {
    if (time - last >= 500) {
      last = time; strength = nightStrength(new Date())
      // Grades from docs/art-direction.md §3.2: golden hour, evening (the 19:15 reference), late night (darker, D4).
      const now = new Date(), h = (now.getUTCHours() + 8 + now.getUTCMinutes() / 60) % 24
      const golden = h < 20 ? Math.max(0, Math.min(1, (h - 16.5) / 1.5)) : 0, late = h >= 20.5 ? Math.min(1, (h - 20.5) / 1.5) : h < 6 ? 1 : 0
      const dusk = mix(0xffffff, 0xffe6c8, golden)
      tint = strength < .02 ? dusk : mix(mix(dusk, 0x8a85bb, Math.min(1, strength * 1.4)), 0x6f6f9e, late)
      people = mix(0xffffff, 0xc4c0e0, Math.min(1, strength * 1.4))
      scene.registry.set('nightStrength', strength)
    }
    // Only pools near the view are drawn: the estate has ~1,400 of them and drawing them all cost frame rate (profiled).
    const v = scene.cameras.main.worldView, on = strength > .02
    for (const g of glows) {
      const near = on && g.x > v.x - 160 && g.x < v.right + 160 && g.y > v.y - 120 && g.y < v.bottom + 120
      if (g.visible !== near) g.setVisible(near)
      if (near) g.setAlpha(strength * g.getData('base'))
    }
    // Every frame, so freshly streamed chunks and buildings never flash in at daylight brightness.
    if (tint === 0xffffff && !tinted) return
    for (const o of scene.children.list as (Phaser.GameObjects.Image & { tintFill?: boolean })[]) {
      if (!o.setTint || o.depth >= 50000 || o.type === 'Text' || o.tintFill || o.getData('emissive')) continue
      const want = o.name === 'character' ? people : tint
      if (o.tintTopLeft !== want) o.setTint(want)
    }
    tinted = tint !== 0xffffff
  }
  return { tick, glow, night: () => strength }
}
