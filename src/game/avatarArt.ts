import { categories, type Avatar, type Facing } from '../state/avatar'

export const AVATAR_WIDTH = 32
export const AVATAR_HEIGHT = 40

export function drawAvatar(ctx: CanvasRenderingContext2D, avatar: Avatar, facing: Facing = 'front', frame = 0) {
  const shade = '#242b39'
  const skin = categories.skin.options[avatar.skin][1]
  const hair = categories.hair.options[avatar.hair][1]
  const top = categories.top.options[avatar.top][1]
  const bottom = categories.bottom.options[avatar.bottom][1]
  const shoe = categories.shoes.options[avatar.shoes][1]
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

  for (const [x, offset] of [[10, step], [17, -step]]) {
    outlined(x, 28 + bob, 6, 8 + offset, bottom)
    outlined(x - 1 + Number(side), 34 + offset, 8, 4, shoe)
  }
  ctx.translate(0, bob)
  outlined(side ? 10 : 8, 19, side ? 13 : 16, 13, top)
  rect(11, 29, side ? 10 : 11, 1, '#34414c77')
  outlined(side ? 15 : 5, 21 + (side ? Math.sign(step) : 0), 6, 8, skin)
  if (!side) outlined(21, 21 - Math.sign(step), 6, 8, skin)
  rect(side ? 16 : 6, 22 + (side ? Math.sign(step) : 0), 4, 3, top)
  if (!side) rect(22, 22 - Math.sign(step), 4, 3, top)

  if (avatar.accessory === 1) {
    for (let i = 0; i < 8; i++) rect(10 + i, 20 + i, 2, 1, '#efd49a')
    outlined(side ? 16 : 18, 25, 7, 6, '#be7953')
    rect(side ? 19 : 21, 27, 1, 1, '#f9d775')
  }
  if (avatar.style === 1) outlined(6, 8, 20, 13, hair)
  if (avatar.style === 2) outlined(11, 0, 10, 7, hair)
  outlined(side ? 8 : 7, 5, side ? 18 : 18, 16, back ? hair : skin)
  if (!back) {
    rect(side ? 9 : 7, 13, 3, 4, skin)
    rect(side ? 19 : 11, 13, 2, 2, shade)
    if (!side) rect(19, 13, 2, 2, shade)
    rect(side ? 22 : 14, 17, 2, 1, '#9a5353')
    rect(side ? 18 : 10, 16, 2, 1, '#db8580')
    if (!side) rect(20, 16, 2, 1, '#db8580')
  }
  outlined(6, 4, 20, avatar.style === 3 ? 9 : 7, hair)
  rect(8, 6, 10, 1, '#ffffff24')
  if (back) rect(9, 10, 14, avatar.style === 1 ? 10 : 8, hair)
  else {
    rect(7, 9, side ? 7 : 5, avatar.style === 1 ? 9 : 5, hair)
    rect(11, 9, 7, 2, hair)
    if (avatar.style === 0) rect(14, 10, 4, 2, hair)
    if (avatar.style === 1 && !side) rect(23, 9, 2, 10, hair)
    if (avatar.style === 3) {
      rect(9, 10, 4, 4, hair)
      rect(19, 10, 5, 3, hair)
      rect(20, 4, 3, 2, '#ffffff24')
    }
    if (avatar.accessory === 2) {
      ctx.strokeStyle = shade
      ctx.lineWidth = 1
      ctx.strokeRect(side ? 18.5 : 9.5, 12.5, 5, 4)
      if (!side) {
        ctx.strokeRect(17.5, 12.5, 5, 4)
        rect(15, 14, 3, 1, shade)
      }
    }
    if (avatar.accessory === 3) rect(19, 8, 4, 2, '#ffd47c')
  }
  ctx.restore()
}
