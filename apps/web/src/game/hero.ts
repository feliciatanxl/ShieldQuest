import Phaser from 'phaser';
import { animateM01, CHAR_SCALE, Dir, facingFrom, FRAME, GAITS, PLAYER, preloadM01 } from './m01';
import { buildNeighbourhood, Npc, Panel, preloadNeighbourhood } from './neighbourhood';

export const HERO_VIEW = { width: 960, height: 600 };

// Same honesty rule as the 3D hero: the cursor weighs every option, none is shown as "correct".
const CHOICES = ['Click the link to check', 'Stop and verify with the bank', 'Forward it to family'];
const RIPPLE_MS = 2600;

type Step = { to?: [number, number]; face?: Dir; wait?: number; say?: boolean; choose?: boolean; ripple?: boolean; fade?: boolean };

/** Autoplaying homepage preview: walk, meet Auntie Mei, dialogue, weigh choices, ripple effect, loop. */
export class HeroScene extends Phaser.Scene {
  player!: Phaser.GameObjects.Sprite;
  steps: Step[] = [];
  i = 0;
  waitUntil = 0;
  facing: Dir = 'right';
  panel!: Panel;
  caption!: Panel;
  alert!: Phaser.GameObjects.Container;
  start!: [number, number];
  choices!: { row: Phaser.GameObjects.Graphics; badge: Phaser.GameObjects.Graphics; text: Phaser.GameObjects.Text; num: Phaser.GameObjects.Text }[];
  choosingSince = -1;
  rippleStart = -1;
  rippleOrigin = { x: 0, y: 0 };
  rings!: Phaser.GameObjects.Graphics;
  echoes: { npc: Npc; pop: Phaser.GameObjects.Container; hit: boolean }[] = [];

  constructor() { super('hero'); }
  preload() { preloadM01(this); preloadNeighbourhood(this); }

  create() {
    const world = buildNeighbourhood(this);
    const mei = world.npcs.find((n) => n.speaker.includes('Mei')) ?? world.npcs[0];
    const pathY = mei.y - 64; // pavement row just above Auntie Mei
    this.start = [mei.x - 520, pathY];
    this.steps = [
      { to: [mei.x - 64, pathY] }, { to: [mei.x - 64, mei.y] }, { face: 'right', wait: 500 },
      { say: true, wait: 2600 }, { choose: true, wait: 3600 }, { ripple: true, wait: RIPPLE_MS + 600 },
      { to: [mei.x - 64, pathY] }, { to: [mei.x + 420, pathY] }, { fade: true, wait: 700 },
    ];
    this.player = this.add.sprite(...this.start, `char_${PLAYER}`, FRAME.right).setScale(CHAR_SCALE);
    this.add.ellipse(0, 0, 40, 10, 0x1d2b2a, 0.22).setName('shadow');

    // drifting cloud shadows: cheap ambient motion
    for (const [y, d] of [[world.height * 0.55, 26000], [world.height * 0.62, 34000]] as const) {
      const c = this.add.ellipse(-300, y, 520, 180, 0x0b1324, 0.08).setDepth(9000);
      this.tweens.add({ targets: c, x: world.width + 300, duration: d, repeat: -1, delay: d / 3 });
    }

    const bubble = (color: number, glyph: string, glyphColor: string) => [
      this.add.graphics().fillStyle(0x0b1324, 0.9).fillRoundedRect(-15, -15, 30, 30, 8).lineStyle(2, color).strokeRoundedRect(-15, -15, 30, 30, 8),
      this.add.text(0, 0, glyph, { fontFamily: 'monospace', fontSize: '18px', fontStyle: 'bold', color: glyphColor }).setOrigin(0.5),
    ];
    this.alert = this.add.container(mei.x, mei.y - 112, bubble(0xf59e0b, '!', '#fbbf24')).setDepth(9500).setVisible(false);
    // every neighbour the ripple reaches reacts, showing the choice spreading
    this.echoes = world.npcs.map((npc) => ({ npc, hit: false, pop: this.add.container(npc.x, npc.y - 112, bubble(0xa78bfa, '~', '#c4b5fd')).setDepth(9500).setVisible(false) }));
    this.rings = this.add.graphics().setDepth(8000);

    this.panel = new Panel(this, 30, HERO_VIEW.height - 210, HERO_VIEW.width - 60, { size: 1.8 });
    this.caption = new Panel(this, HERO_VIEW.width / 2 - 330, 100, 660, { accent: 0xa78bfa, size: 1.5 });
    this.createChoices();

    this.cameras.main.setBounds(0, 0, world.width, world.height).startFollow(this.player, true, 0.06, 0.06, -120, 30).setRoundPixels(true);
    this.game.events.emit('scene-ready', 'hero');
  }

  /** Three options side by side inside the dialogue bar, so the characters stay visible above. */
  createChoices() {
    const gap = 10, x0 = 48, w = (HERO_VIEW.width - 2 * x0 - 2 * gap) / 3, h = 46, y = HERO_VIEW.height - 210 + 52;
    this.choices = CHOICES.map((label, i) => {
      const x = x0 + i * (w + gap);
      const fixed = <T extends Phaser.GameObjects.Components.ScrollFactor & Phaser.GameObjects.Components.Depth & Phaser.GameObjects.Components.Visible>(o: T) => o.setScrollFactor(0).setDepth(2000).setVisible(false);
      const row = fixed(this.add.graphics()); row.setData('rect', [x, y, w, h]);
      const badge = fixed(this.add.graphics()); badge.setData('rect', [x + 12, y + 11, 28, 28]);
      return {
        row, badge,
        num: fixed(this.add.text(x + 26, y + h / 2, String(i + 1), { fontFamily: 'monospace', fontSize: '18px', fontStyle: 'bold', color: '#e2e8f0' }).setOrigin(0.5)),
        text: fixed(this.add.text(x + 50, y + h / 2, label, { fontFamily: 'Inter, system-ui, sans-serif', fontSize: '18px', color: '#e2e8f0', wordWrap: { width: w - 58 } }).setOrigin(0, 0.5)),
      };
    });
  }

  drawChoices(cursor: number | null) {
    this.choices.forEach((c, i) => {
      const on = i === cursor, [x, y, w, h] = c.row.getData('rect') as number[], [bx, by, bw, bh] = c.badge.getData('rect') as number[];
      const dy = on ? -4 : 0; // active option lifts slightly, like the 3D HUD nudge
      c.row.clear().fillStyle(on ? 0x13213b : 0x0f172a, 1).fillRoundedRect(x, y + dy, w, h, 10).lineStyle(2, on ? 0x22d3ee : 0x334155, on ? 0.9 : 0.6).strokeRoundedRect(x, y + dy, w, h, 10);
      c.badge.clear().fillStyle(on ? 0x22d3ee : 0x1e293b, 1).fillRoundedRect(bx, by + dy, bw, bh, 6);
      c.num.setY(by + bh / 2 + dy).setColor(on ? '#0b1324' : '#e2e8f0');
      c.text.setY(y + h / 2 + dy).setColor(on ? '#ffffff' : '#94a3b8');
      [c.row, c.badge, c.num, c.text].forEach((o) => o.setVisible(cursor !== null));
    });
  }

  /** Chunky pixel ripple: rings snap to 8px steps and fade as they spread through the block. */
  drawRipple(time: number) {
    const g = this.rings.clear();
    if (this.rippleStart < 0) return;
    const t = time - this.rippleStart;
    if (t > RIPPLE_MS) { this.rippleStart = -1; this.echoes.forEach((e) => e.pop.setVisible(false)); return; }
    const { x, y } = this.rippleOrigin;
    for (let k = 0; k < 3; k++) {
      const local = t - k * 380;
      if (local < 0) continue;
      const p = local / (RIPPLE_MS - 760);
      if (p > 1) continue;
      const r = Math.round((40 + p * 640) / 8) * 8;
      const a = (1 - p) * 0.85;
      g.lineStyle(8, 0xa78bfa, a).strokeEllipse(x, y - 8, r * 2, r * 1.1); // flattened: rings lie on the ground
      g.lineStyle(4, 0x22d3ee, a * 0.8).strokeEllipse(x, y - 8, r * 2 - 20, r * 1.1 - 12);
    }
    const front = (40 + (t / (RIPPLE_MS - 760)) * 640);
    for (const e of this.echoes) {
      const dist = Math.hypot((e.npc.x - x), (e.npc.y - y) / 0.55);
      if (!e.hit && front >= dist) {
        e.hit = true;
        e.pop.setVisible(true).setScale(0.4);
        this.tweens.add({ targets: e.pop, scale: 1, duration: 260, ease: 'Back.out' });
      }
    }
  }

  update(time: number, delta: number) {
    const step = this.steps[this.i];
    const p = this.player;
    (this.children.getByName('shadow') as Phaser.GameObjects.Ellipse).setPosition(p.x, p.y - 2).setDepth(p.y - 1);
    p.setDepth(p.y);
    // timed effects animate during waits too
    if (this.choosingSince >= 0) this.drawChoices(Math.floor((time - this.choosingSince) / 900) % CHOICES.length);
    this.drawRipple(time);
    if (time < this.waitUntil) return;

    if (step.to) {
      const [tx, ty] = step.to, dx = tx - p.x, dy = ty - p.y, dist = Math.hypot(dx, dy), d = (GAITS.walk.speed * delta) / 1000;
      this.panel.hide(); this.caption.hide(); // dialogue ends when the player walks on
      this.alert.setVisible(this.i === 1); // bubble while approaching
      if (dist <= d) { p.setPosition(tx, ty); return this.next(time); }
      this.facing = facingFrom(dx, dy);
      p.setPosition(p.x + (dx / dist) * d, p.y + (dy / dist) * d);
      animateM01(p, this.facing, 'walk');
      return;
    }
    animateM01(p, step.face ?? this.facing, 'idle');
    if (step.face) this.facing = step.face;
    if (step.say) { this.alert.setVisible(false); this.panel.show('AUNTIE MEI', 'This message says my bank account is frozen! Should I click the link?'); }
    if (step.choose) { this.choosingSince = time; this.panel.show('WHAT WOULD YOU DO?', ' '); } // blank body line reserves room for the options row
    if (step.ripple) {
      this.choosingSince = -1; this.drawChoices(null); this.panel.hide();
      this.caption.show('', 'RIPPLE EFFECT · your choice echoes later');
      this.rippleStart = time; this.rippleOrigin = { x: p.x, y: p.y };
      this.echoes.forEach((e) => { e.hit = false; e.pop.setVisible(false); });
    }
    if (step.fade) this.cameras.main.fadeOut(600, 11, 19, 36);
    this.waitUntil = time + (step.wait ?? 0);
    this.next(time);
  }

  next(time: number) {
    this.i++;
    if (this.i < this.steps.length) return;
    // loop: reset quietly behind the fade
    const resumeAt = this.waitUntil;
    this.i = this.steps.length - 1;
    this.waitUntil = Infinity;
    this.time.delayedCall(Math.max(0, resumeAt - time), () => {
      this.i = 0; this.waitUntil = 0; this.panel.hide(); this.caption.hide();
      this.player.setPosition(...this.start);
      this.cameras.main.fadeIn(600, 11, 19, 36);
    });
  }
}
