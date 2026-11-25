import Phaser from 'phaser'

// Calm, seamless placeholder surfaces until an approved PixelLab batch replaces them.
// Same 64x64 canvas / 64x32 diamond as the existing ground atlas; four shared variants per material.
// Sunshine Estate: soft grass, warm light-grey paving, asphalt and terracotta shopfront brick.
const palette = [
  ['#93b46f', '#96b772', '#90b16c', '#95b570'],
  ['#d8d3c6', '#dad5c8', '#d5d0c3', '#d9d4c7'],
  ['#5d6266', '#5f6468', '#5b6064', '#5e6367'],
  ['#d29a78', '#d49c7a', '#cf9775', '#d39b79'],
]
// Joint lines across each diamond: paving slabs on concrete, staggered courses on brick.
const joints = [undefined, '#b9b2a2', undefined, '#a8694f']

export function estateSurfaceKey(scene: Phaser.Scene, tile: number) {
  const kind = (tile - 1) >> 2
  const approved = `pl-ground-estate-${['grass', 'concrete', 'asphalt', 'brick'][kind]}`
  if (scene.textures.exists(approved)) {
    const frame = scene.textures.getFrame(approved)
    if (frame.width === 64 && frame.height === 64) return approved
  }
  return `estate-ground-${tile - 1}`
}

export function estateSurfaces(scene: Phaser.Scene) {
  for (let kind = 0; kind < 4; kind++) for (let variant = 0; variant < 4; variant++) {
    const key = `estate-ground-${kind * 4 + variant}`
    if (scene.textures.exists(key)) continue
    const texture = scene.textures.createCanvas(key, 64, 64)!
    const ctx = texture.context
    ctx.beginPath(); ctx.moveTo(32, 16); ctx.lineTo(64, 32); ctx.lineTo(32, 48); ctx.lineTo(0, 32); ctx.closePath()
    ctx.save(); ctx.clip(); ctx.fillStyle = palette[kind][variant]; ctx.fillRect(0, 16, 64, 32)
    // Fine deterministic grain, without a drain or manhole repeated in every ground cell.
    for (let i = 0; i < 100; i++) {
      const x = (i * 37 + variant * 11) % 64, y = 16 + (i * 19 + variant * 7) % 32
      ctx.fillStyle = i % 2 ? '#ffffff' : '#1f3029'; ctx.globalAlpha = kind === 0 ? .09 : .045
      ctx.fillRect(x, y, 1, 1)
    }
    ctx.globalAlpha = .55
    if (joints[kind]) {
      ctx.strokeStyle = joints[kind]!; ctx.lineWidth = 1
      ctx.beginPath()
      // Lines parallel to the diamond's edges split it into 2x2 slabs (concrete) or 4x2 bricks (brick).
      for (const t of kind === 3 ? [.25, .5, .75] : [.5]) { ctx.moveTo(t * 32, 32 - t * 16); ctx.lineTo(32 + t * 32, 48 - t * 16) }
      ctx.moveTo(16, 24); ctx.lineTo(48, 40)
      ctx.stroke()
    }
    if (kind === 0) for (let i = 0; i < 14; i++) {
      // A few darker blades and tiny flowers so lawns don't read as flat paint.
      const x = (i * 23 + variant * 17) % 56 + 4, y = 20 + (i * 13 + variant * 5) % 24
      ctx.fillStyle = i % 7 === 3 ? '#f4e3a1' : '#6f9452'; ctx.fillRect(x, y, 1, i % 7 === 3 ? 1 : 2)
    }
    ctx.globalAlpha = 1
    ctx.restore(); texture.setFilter(Phaser.Textures.FilterMode.NEAREST); texture.refresh()
  }
}
