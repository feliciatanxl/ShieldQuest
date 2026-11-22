import Phaser from 'phaser'

// Calm, seamless placeholder surfaces until an approved PixelLab batch replaces them.
// Same 64x64 canvas / 64x32 diamond as the existing ground atlas; four shared variants per material.
const palette = [
  ['#7d9567', '#80986a', '#7b9365', '#7f9668'],
  ['#bfc0b5', '#c0c1b7', '#bdbfb4', '#c1c2b8'],
  ['#62696a', '#646b6c', '#616869', '#636a6b'],
  ['#ad8c79', '#af8e7b', '#ac8b78', '#ae8d7a'],
]

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
    ctx.restore(); texture.setFilter(Phaser.Textures.FilterMode.NEAREST); texture.refresh()
  }
}
