import Phaser from 'phaser';

// The one M01 implementation: assets, animations, input and movement shared by every scene.
export const GAME_ROOT = '/game/';
export const DIRS = ['down', 'up', 'left', 'right'] as const;
export type Dir = (typeof DIRS)[number];
export type Gait = 'idle' | 'walk' | 'run';
const IDLE_POSE: Record<Dir, string> = { down: 'front', up: 'back', left: 'left', right: 'right' };
export const GAITS = {
  walk: { frames: 6, fps: 8, speed: 130 },
  run: { frames: 8, fps: 12, speed: 220 },
} as const;

export function preloadM01(scene: Phaser.Scene) {
  for (const d of DIRS) scene.load.image(`M01_idle_${d}`, `${GAME_ROOT}characters/v3/characters/male/M01_${IDLE_POSE[d]}.png`);
  for (const g of Object.keys(GAITS)) scene.load.spritesheet(`M01_${g}`, `${GAME_ROOT}characters/v3/animations/M01_${g}.png`, { frameWidth: 64, frameHeight: 96 });
}

export function registerM01Anims(scene: Phaser.Scene) {
  for (const [g, { frames, fps }] of Object.entries(GAITS)) {
    DIRS.forEach((d, row) => {
      const key = `M01_${g}_${d}`;
      if (scene.anims.exists(key)) return; // anims are game-global; never register twice
      scene.anims.create({ key, frames: scene.anims.generateFrameNumbers(`M01_${g}`, { start: row * frames, end: row * frames + frames - 1 }), frameRate: fps, repeat: -1 });
    });
  }
}

/** Dominant axis picks the sprite; horizontal wins exact diagonals. */
export function facingFrom(x: number, y: number): Dir {
  return Math.abs(x) >= Math.abs(y) ? (x > 0 ? 'right' : 'left') : y > 0 ? 'down' : 'up';
}

export function animateM01(sprite: Phaser.GameObjects.Sprite, facing: Dir, gait: Gait) {
  if (gait === 'idle') {
    sprite.anims.stop();
    sprite.setTexture(`M01_idle_${facing}`);
  } else sprite.anims.play(`M01_${gait}_${facing}`, true); // true = keep playing if already on it
}

/** Keyboard + optional touch overlay (floating joystick, RUN and E buttons on touch devices). */
export class PlayerInput {
  private keys: Record<string, Phaser.Input.Keyboard.Key>;
  private joy = new Phaser.Math.Vector2();
  private joyId: number | null = null;
  private runId: number | null = null;
  private touchInteract = false;

  constructor(private scene: Phaser.Scene, opts: { interact?: boolean } = {}) {
    this.keys = scene.input.keyboard!.addKeys('W,A,S,D,UP,DOWN,LEFT,RIGHT,SHIFT,E,ESC') as Record<string, Phaser.Input.Keyboard.Key>;
    if (scene.sys.game.device.input.touch) this.createTouch(!!opts.interact);
  }

  get move(): { x: number; y: number } {
    const k = this.keys;
    const x = Number(k.D.isDown || k.RIGHT.isDown) - Number(k.A.isDown || k.LEFT.isDown);
    const y = Number(k.S.isDown || k.DOWN.isDown) - Number(k.W.isDown || k.UP.isDown);
    if (!x && !y && this.joy.length() > 0.25) return { x: this.joy.x, y: this.joy.y }; // dead zone stops jitter
    return { x, y };
  }
  get run() { return this.keys.SHIFT.isDown || this.runId !== null; }
  /** True once per press of E or the touch E button. */
  interactPressed() {
    const t = this.touchInteract;
    this.touchInteract = false;
    return Phaser.Input.Keyboard.JustDown(this.keys.E) || t;
  }
  closePressed() { return Phaser.Input.Keyboard.JustDown(this.keys.ESC); }

  private createTouch(withInteract: boolean) {
    const s = this.scene, { width, height } = s.scale, R = 70;
    s.input.addPointer(2); // joystick + button at the same time
    const ui = (o: Phaser.GameObjects.Components.ScrollFactor & Phaser.GameObjects.Components.Depth) => o.setScrollFactor(0).setDepth(1000);
    const home = { x: 140, y: height - 140 };
    const base = s.add.circle(home.x, home.y, R, 0xffffff, 0.18).setStrokeStyle(3, 0xffffff, 0.5);
    const knob = s.add.circle(home.x, home.y, 32, 0xffffff, 0.6);
    const btn = (x: number, y: number, label: string, color: number) => {
      const c = s.add.circle(x, y, 52, color, 0.55).setStrokeStyle(3, 0xffffff, 0.7);
      ui(c); ui(s.add.text(x, y, label, { fontFamily: 'monospace', fontSize: '24px', color: '#ffffff' }).setOrigin(0.5));
      return c;
    };
    [base, knob].forEach(ui);
    const runBtn = btn(width - 110, height - 110, 'RUN', 0x42b8aa);
    const eBtn = withInteract ? btn(width - 230, height - 75, 'E', 0x1687f7) : null;
    const over = (p: Phaser.Input.Pointer, c: Phaser.GameObjects.Arc | null) => !!c && Phaser.Math.Distance.Between(p.x, p.y, c.x, c.y) <= 66;

    s.input.on('pointerdown', (p: Phaser.Input.Pointer) => {
      if (over(p, runBtn)) { this.runId = p.id; runBtn.setFillStyle(0x42b8aa, 0.9); }
      else if (over(p, eBtn)) this.touchInteract = true;
      else if (p.x < width / 2 && this.joyId === null) { this.joyId = p.id; base.setPosition(p.x, p.y); knob.setPosition(p.x, p.y); }
    });
    s.input.on('pointermove', (p: Phaser.Input.Pointer) => {
      if (p.id !== this.joyId) return;
      const v = new Phaser.Math.Vector2(p.x - base.x, p.y - base.y).limit(R);
      knob.setPosition(base.x + v.x, base.y + v.y);
      this.joy.set(v.x / R, v.y / R);
    });
    const release = (p: Phaser.Input.Pointer) => {
      if (p.id === this.runId) { this.runId = null; runBtn.setFillStyle(0x42b8aa, 0.55); }
      if (p.id === this.joyId) { this.joyId = null; this.joy.set(0, 0); base.setPosition(home.x, home.y); knob.setPosition(home.x, home.y); }
    };
    s.input.on('pointerup', release);
    s.input.on('pointerupoutside', release);
  }
}

/** Arcade-physics M01: feet-anchored sprite with a small foot hitbox. */
export class Player {
  sprite: Phaser.Physics.Arcade.Sprite;
  facing: Dir = 'down';
  gait: Gait = 'idle';

  constructor(scene: Phaser.Scene, x: number, y: number, scale = 1) {
    registerM01Anims(scene);
    // origin at the feet: idle PNGs and sheet frames share a 64x96 cell and baseline, so swaps don't jump
    this.sprite = scene.physics.add.sprite(x, y, 'M01_idle_down').setOrigin(0.5, 1).setScale(scale);
    this.sprite.body!.setSize(18, 11).setOffset(23, 82);
    this.sprite.setCollideWorldBounds(true);
  }

  /** frozen = dialogue open: stand still in the current facing. */
  update(input: PlayerInput, frozen = false) {
    const { x, y } = frozen ? { x: 0, y: 0 } : input.move;
    const body = this.sprite.body as Phaser.Physics.Arcade.Body;
    if (!x && !y) {
      body.setVelocity(0, 0);
      this.gait = 'idle';
    } else {
      this.facing = facingFrom(x, y);
      this.gait = input.run ? 'run' : 'walk';
      // normalised so diagonals aren't faster; arcade physics integrates with frame delta
      body.velocity.set(x, y).normalize().scale(GAITS[this.gait].speed);
    }
    animateM01(this.sprite, this.facing, this.gait);
    this.sprite.setDepth(this.sprite.y);
  }
}

/** Shared by playground scenes so the React page can show live stats. */
export interface DebugInfo { mode: string; x: number; y: number; facing: Dir; gait: Gait; zone?: string }
export interface PlaygroundScene extends Phaser.Scene {
  debugInfo(): DebugInfo;
  setDebug(on: boolean): void;
}
