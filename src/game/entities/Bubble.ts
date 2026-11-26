import Phaser from 'phaser'
import type { Point } from '../../state/saveGame'
import { project } from '../isometric'

/** Everyday lines for the estate's walking residents (by sheet), with the odd gentle safety nudge. Shown as a speech
 *  bubble when the player comes near; purely ambient, no quest or state behind them. */
export const AMBIENT_LINES: Record<string, string[]> = {
  'kopi-uncle': ['Wah, so hot today ah!', 'Kopi-O kosong, the best.', 'Got scam call again today, I just hang up!'],
  auntie: ['Minimart got promotion today!', 'Eh, you seen my SunCard?', 'Don\'t simply click links in SMS, OK?'],
  makcik: ['Dah makan? Eaten already?', 'Lift is so slow today...', 'Remember to lock your door!'],
  student: ['Exam next week... sian.', 'CCA until so late today.', 'Never share your password, even with friends.'],
  'indian-uncle': ['Bus coming soon, faster!', 'Nice weather for a walk.', 'Strangers ask for your OTP? Never give!'],
  'office-worker': ['Must catch the next bus!', 'So many emails today...', 'Check the sender before you reply.'],
}
/** Lines for mission residents: an invitation only; pressing E still opens their full dialogue as before. */
export const RESIDENT_LINES: Record<string, string> = { may: 'Eh, can help Auntie May a bit?', amir: 'Psst, got a minute?' }

const FILL = 0xeee9dc, INK = '#2b2118', LINE = 0x151008
/** A speech bubble above a character's head (docs/art-direction.md §13): cream fill, dark outline, a tail to the
 *  speaker, at most two short lines, kept to the side away from the player so it never covers them. */
export class Bubble {
  private readonly box: Phaser.GameObjects.Graphics
  private readonly text: Phaser.GameObjects.Text
  private shown = ''

  constructor(private scene: Phaser.Scene) {
    this.box = scene.add.graphics().setDepth(99990).setVisible(false)
    this.text = scene.add.text(0, 0, '', { fontFamily: 'Outfit, sans-serif', fontSize: '7px', color: INK, wordWrap: { width: 120 }, align: 'left', lineSpacing: -1 })
      .setDepth(99991).setVisible(false).setResolution(4)
  }

  hide() { this.box.setVisible(false); this.text.setVisible(false); this.shown = '' }

  /** Shows text over a speaker at `at` (tiles); `player` decides which side the bubble sits on. */
  show(text: string, at: Point, player?: Point) {
    const head = project(at.x, at.y), side = player && project(player.x, player.y).x > head.x ? -1 : 1
    if (this.shown !== text) { this.text.setText(text); this.shown = text }
    const w = Math.ceil(this.text.width) + 10, h = Math.ceil(this.text.height) + 6
    const x = Math.round(head.x + (side > 0 ? -12 : 12 - w)), y = Math.round(head.y - 74 - h)
    const tx = Math.round(head.x), g = this.box.clear()
    g.fillStyle(LINE).fillRoundedRect(x - 1, y - 1, w + 2, h + 2, 4)
    g.fillStyle(FILL).fillRoundedRect(x, y, w, h, 3)
    g.fillStyle(LINE).fillTriangle(tx - 4, y + h - 1, tx + 4, y + h - 1, tx, y + h + 6)
    g.fillStyle(FILL).fillTriangle(tx - 3, y + h - 2, tx + 3, y + h - 2, tx, y + h + 4)
    this.text.setPosition(x + 5, y + 3)
    this.box.setVisible(true); this.text.setVisible(true)
  }

  destroy() { this.box.destroy(); this.text.destroy() }
}
