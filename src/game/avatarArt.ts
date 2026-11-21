import { categories, type Avatar, type Facing } from '../state/avatar'

export const AVATAR_WIDTH = 32
export const AVATAR_HEIGHT = 40

// Hairstyle, garment and accessory indices, matching the option lists in state/avatar.ts.
const BOB = 1, BUN = 2, CURLS = 3, CROP = 4, PONYTAIL = 5, LONG = 6, TUDUNG = 7
const POLO = 1, BLOUSE = 2, SINGLET = 3
const SHORTS = 1, JEANS = 2
const SLIPPERS = 1, SANDALS = 2
const SPECS = 1, ROUND = 2, SHADES = 3
const SATCHEL = 1, LANYARD = 2, CLIP = 3, CAP = 4

function lighten(hex: string, amount: number) {
  const n = parseInt(hex.slice(1), 16)
  const mix = (c: number) => Math.round(c + (255 - c) * amount)
  return '#' + [n >> 16, (n >> 8) & 255, n & 255].map(c => mix(c).toString(16).padStart(2, '0')).join('')
}

export function drawAvatar(ctx: CanvasRenderingContext2D, avatar: Avatar, facing: Facing = 'front', frame = 0) {
  const shade = '#242b39'
  const skin = categories.skin.options[avatar.skin][1]
  const hair = categories.hair.options[avatar.hair][1]
  const top = categories.top.options[avatar.top][1]
  const bottom = categories.bottom.options[avatar.bottom][1]
  const shoe = categories.shoes.options[avatar.shoes][1]
  const scarf = lighten(top, .3)
  const style = avatar.style
  const side = facing === 'left' || facing === 'right'
  const back = facing === 'back'
  const bob = frame === 1 || frame === 3 ? -1 : 0
  const step = frame === 1 ? 2 : frame === 3 ? -2 : 0
  ctx.clearRect(0, 0, AVATAR_WIDTH, AVATAR_HEIGHT)
  ctx.save()
  if (facing === 'left') {
    ctx.translate(32, 0)
    ctx.scale(-1, 1)
  }

  const rect = (x: number, y: number, w: number, h: number, color: string) => {
    ctx.fillStyle = color
    ctx.fillRect(x, y, w, h)
  }
  const outlined = (x: number, y: number, w: number, h: number, color: string) => {
    rect(x, y + 1, w, h - 2, shade)
    rect(x + 1, y, w - 2, h, shade)
    rect(x + 1, y + 1, w - 2, h - 2, color)
  }

  // Legs and footwear
  for (const [x, offset] of [[10, step], [17, -step]]) {
    const foot = x - 1 + Number(side)
    if (avatar.bottomStyle === SHORTS) {
      outlined(x, 28 + bob, 6, 8 + offset, skin)
      outlined(x, 28 + bob, 6, 5, bottom)
    } else {
      outlined(x, 28 + bob, 6, 8 + offset, bottom)
      if (avatar.bottomStyle === JEANS) {
        rect(x + 3, 30 + bob, 1, 4 + offset, '#ffffff38')
        rect(x + 1, 34 + offset, 4, 1, '#ffffff30')
      }
    }
    if (avatar.shoeStyle === SLIPPERS || avatar.shoeStyle === SANDALS) {
      outlined(x, 33 + offset, 6, 4, skin)
      outlined(foot, 36 + offset, 8, 3, shoe)
      rect(x + 1, 34 + offset, 4, 1, shoe)
      if (avatar.shoeStyle === SANDALS) rect(x + 1, 32 + offset, 4, 1, shoe)
    } else {
      outlined(foot, 34 + offset, 8, 4, shoe)
      rect(foot + 1, 36 + offset, 6, 1, '#ffffff66')
    }
  }

  ctx.translate(0, bob)
  // Torso
  outlined(side ? 10 : 8, 19, side ? 13 : 16, 13, top)
  if (avatar.topStyle === BLOUSE) outlined(side ? 9 : 7, 28, side ? 15 : 18, 4, top)
  rect(11, 29, side ? 10 : 11, 1, '#34414c77')
  if (!back && !side) {
    if (avatar.topStyle === POLO) {
      rect(12, 19, 3, 2, lighten(top, .45))
      rect(17, 19, 3, 2, lighten(top, .45))
      rect(15, 20, 2, 4, '#00000022')
    } else if (avatar.topStyle === BLOUSE) {
      rect(12, 19, 8, 2, '#fffaf0')
      rect(15, 21, 2, 1, '#fffaf0')
    } else if (avatar.topStyle === SINGLET) {
      rect(11, 19, 10, 2, skin)
      rect(9, 19, 2, 3, skin)
      rect(21, 19, 2, 3, skin)
    } else rect(14, 19, 4, 1, skin)
  }
  // Arms, with sleeves unless it is a singlet
  outlined(side ? 15 : 5, 21 + (side ? Math.sign(step) : 0), 6, 8, skin)
  if (!side) outlined(21, 21 - Math.sign(step), 6, 8, skin)
  if (avatar.topStyle !== SINGLET) {
    rect(side ? 16 : 6, 22 + (side ? Math.sign(step) : 0), 4, 3, top)
    if (!side) rect(22, 22 - Math.sign(step), 4, 3, top)
  }

  if (avatar.accessory === SATCHEL) {
    for (let i = 0; i < 8; i++) rect(10 + i, 20 + i, 2, 1, '#efd49a')
    outlined(side ? 16 : 18, 25, 7, 6, '#be7953')
    rect(side ? 19 : 21, 27, 1, 1, '#f9d775')
  }
  if (avatar.accessory === LANYARD && !back) {
    if (side) rect(17, 20, 1, 6, '#3b6fb6')
    else {
      rect(13, 20, 1, 6, '#3b6fb6')
      rect(18, 20, 1, 6, '#3b6fb6')
      outlined(13, 25, 6, 5, '#f4f1ea')
      rect(15, 27, 2, 1, '#3b6fb6')
    }
  }
  if (style === TUDUNG) outlined(side ? 8 : 6, 15, side ? 17 : 20, 10, scarf)

  // Hair that sits behind the head
  if (style === BOB) outlined(6, 8, 20, 13, hair)
  if (style === LONG) outlined(5, 8, 22, 17, hair)
  if (style === BUN) outlined(11, 0, 10, 7, hair)
  if (style === PONYTAIL && !back) outlined(side ? 4 : 23, 9, 5, side ? 12 : 10, hair)

  // Head and face
  outlined(side ? 8 : 7, 5, side ? 18 : 18, 16, back ? (style === TUDUNG ? scarf : hair) : skin)
  if (!back) {
    rect(side ? 9 : 7, 13, 3, 4, skin)
    rect(side ? 19 : 11, 13, 2, 2, shade)
    if (!side) rect(19, 13, 2, 2, shade)
    rect(side ? 22 : 14, 17, 2, 1, '#9a5353')
    rect(side ? 18 : 10, 16, 2, 1, '#db8580')
    if (!side) rect(20, 16, 2, 1, '#db8580')
  }

  if (style === TUDUNG) {
    outlined(6, 3, 20, 8, scarf)
    if (back) rect(8, 10, 16, 10, scarf)
    else if (side) rect(8, 8, 8, 13, scarf)
    else {
      rect(7, 8, 3, 13, scarf)
      rect(22, 8, 3, 13, scarf)
      rect(9, 19, 14, 2, scarf)
    }
    rect(8, 5, 10, 1, '#ffffff30')
  } else {
    outlined(6, 4, 20, style === CURLS ? 9 : style === CROP ? 6 : 7, hair)
    rect(8, 6, 10, 1, '#ffffff24')
    if (back) {
      rect(9, 10, 14, style === LONG ? 14 : style === BOB ? 10 : style === CROP ? 4 : 8, hair)
      if (style === PONYTAIL) outlined(13, 9, 6, 14, hair)
    } else if (style === CROP) {
      rect(7, 9, side ? 4 : 2, 3, hair)
      rect(11, 9, 9, 1, hair)
    } else {
      const long = style === BOB || style === LONG
      rect(7, 9, side ? 7 : 5, long ? (style === LONG ? 13 : 9) : 5, hair)
      rect(11, 9, 7, 2, hair)
      if (style === 0 || style === PONYTAIL) rect(14, 10, 4, 2, hair)
      if (long && !side) rect(23, 9, 2, style === LONG ? 14 : 10, hair)
      if (style === CURLS) {
        rect(9, 10, 4, 4, hair)
        rect(19, 10, 5, 3, hair)
        rect(20, 4, 3, 2, '#ffffff24')
      }
    }
  }

  if (!back) {
    if (avatar.glasses === SPECS) {
      ctx.strokeStyle = shade
      ctx.lineWidth = 1
      ctx.strokeRect(side ? 18.5 : 9.5, 12.5, 5, 4)
      if (!side) {
        ctx.strokeRect(17.5, 12.5, 5, 4)
        rect(15, 14, 3, 1, shade)
      }
    } else if (avatar.glasses === ROUND) {
      for (const x of side ? [18] : [9, 17]) {
        rect(x + 1, 12, 3, 1, shade)
        rect(x, 13, 1, 2, shade)
        rect(x + 4, 13, 1, 2, shade)
        rect(x + 1, 15, 3, 1, shade)
      }
      if (!side) rect(14, 13, 3, 1, shade)
    } else if (avatar.glasses === SHADES) {
      for (const x of side ? [18] : [9, 17]) rect(x, 12, 6, 3, '#1d2230')
      if (!side) rect(15, 13, 2, 1, '#1d2230')
      rect(side ? 19 : 10, 12, 2, 1, '#ffffff55')
    }
  }
  if (style !== TUDUNG) {
    if (avatar.accessory === CLIP && !back) rect(19, 8, 4, 2, '#ffd47c')
    if (avatar.accessory === CAP) {
      outlined(6, 2, 20, 7, '#c9544a')
      rect(9, 3, 8, 1, '#ffffff40')
      if (!back) rect(side ? 20 : 8, 8, side ? 9 : 16, 2, '#9e3a33')
    }
  }
  ctx.restore()
}
