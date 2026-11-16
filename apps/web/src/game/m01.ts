import Phaser from 'phaser';

// The one player implementation: assets, facing, input and movement shared by every scene.
export const GAME_ROOT = '/game/';
export const DIRS = ['down', 'up', 'left', 'right'] as const;
export type Dir = (typeof DIRS)[number];
export type Gait = 'idle' | 'walk' | 'run';
// Characters without a Walk.png just bob while moving.
export const GAITS = {
  walk: { speed: 130, bobMs: 140, fps: 8 },
  run: { speed: 220, bobMs: 90, fps: 13 }, // shortcut: run reuses the walk frames faster; add Run.png when exported
} as const;

// Character sheets: one 512x64 row of 8 idle rotations (S, SE, E, NE, N, NW, W, SW), see each folder's JSON.
export const CHARACTERS = {
  student: 'Indian Singaporean male student approximately 18–23 years old',
  worker: 'Chinese Singaporean female young working adult approximately 22–28 years old',
  poly: 'Singaporean female polytechnic student approximately 18–20 years old',
  rider: 'Malay Singaporean male delivery rider approximately 20–35 years old',
  cafe: 'Eurasian Singaporean female café staff member approximately 20–30 years old',
  hijab: 'Malay Singaporean female young adult wearing a hijab approximately 18–28 years old',
} as const;
export type CharacterId = keyof typeof CHARACTERS;
export const PLAYER: CharacterId = 'student';
export const FRAME: Record<Dir, number> = { down: 0, right: 2, up: 4, left: 6 };
/** Sheets are 64px cells; this makes them read like the old 96px-tall sprites next to HDB storeys. */
export const CHAR_SCALE = 1.6;
const FEET_Y = 0.94; // feet sit ~4px above the bottom of the 64px cell
/** Walk.png: 6 frames x 4 rows (down, up, left, right) of 64px cells, built from the exported walk GIFs. */
const HAS_WALK: CharacterId[] = ['poly'];
export const charUrl = (id: CharacterId) => `${GAME_ROOT}characters/${CHARACTERS[id]}/Create_an_original_highl-Idle.png`;

export function preloadM01(scene: Phaser.Scene) {
  for (const id of Object.keys(CHARACTERS) as CharacterId[]) scene.load.spritesheet(`char_${id}`, charUrl(id), { frameWidth: 64, frameHeight: 64 });
  for (const id of HAS_WALK) scene.load.spritesheet(`walk_${id}`, `${GAME_ROOT}characters/${CHARACTERS[id]}/Walk.png`, { frameWidth: 64, frameHeight: 64 });
}

function walkAnims(scene: Phaser.Scene, sheet: string) {
  for (const [g, { fps }] of Object.entries(GAITS)) DIRS.forEach((d, row) => {
    const key = `${sheet}_${g}_${d}`;
    if (!scene.anims.exists(key)) scene.anims.create({ key, frames: scene.anims.generateFrameNumbers(sheet, { start: row * 6, end: row * 6 + 5 }), frameRate: fps, repeat: -1 });
  });
}


/** Dominant axis picks the sprite; horizontal wins exact diagonals. */
export function facingFrom(x: number, y: number): Dir {
  return Math.abs(x) >= Math.abs(y) ? (x > 0 ? 'right' : 'left') : y > 0 ? 'down' : 'up';
}

/** Plays the walk cycle when the character has one; otherwise faces the right way and bobs. */
export function animateM01(sprite: Phaser.GameObjects.Sprite, facing: Dir, gait: Gait) {
  const id: string = sprite.getData('char') ?? sprite.setData('char', sprite.texture.key.slice(5)).getData('char');
  const walk = `walk_${id}`;
  if (gait !== 'idle' && sprite.scene.textures.exists(walk)) {
    walkAnims(sprite.scene, walk);
    sprite.setOrigin(0.5, FEET_Y).anims.play(`${walk}_${gait}_${facing}`, true);
    return;
  }
  sprite.anims.stop();
  sprite.setTexture(`char_${id}`, FRAME[facing]);
  const bob = gait === 'idle' ? 0 : Math.abs(Math.sin(sprite.scene.time.now / GAITS[gait].bobMs)) * 2;
  sprite.setOrigin(0.5, FEET_Y + bob / 64);
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

/** Arcade-physics player: feet-anchored sprite with a small foot hitbox. */
export class Player {
  sprite: Phaser.Physics.Arcade.Sprite;
  facing: Dir = 'down';
  gait: Gait = 'idle';

  constructor(scene: Phaser.Scene, x: number, y: number, scale = 1) {
    this.sprite = scene.physics.add.sprite(x, y, `char_${PLAYER}`, FRAME.down).setOrigin(0.5, FEET_Y).setScale(scale * CHAR_SCALE);
    this.sprite.body!.setSize(18, 8).setOffset(23, 52);
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

/** Ambient neighbour that walks back and forth between a and b, pausing at each end. */
export function addWanderer(scene: Phaser.Scene, id: CharacterId, a: [number, number], b: [number, number], scale = CHAR_SCALE) {
  const s = scene.add.sprite(a[0], a[1], `char_${id}`, FRAME.down).setScale(scale);
  const shadow = scene.add.ellipse(a[0], a[1], 40, 10, 0x1d2b2a, 0.22);
  scene.tweens.add({ targets: s, x: b[0], y: b[1], duration: (Math.hypot(b[0] - a[0], b[1] - a[1]) / GAITS.walk.speed) * 1000, yoyo: true, hold: 1200, repeatDelay: 1200, repeat: -1 });
  let px = s.x, py = s.y, facing: Dir = 'down';
  const tick = () => {
    const dx = s.x - px, dy = s.y - py;
    if (dx || dy) facing = facingFrom(dx, dy);
    animateM01(s, facing, dx || dy ? 'walk' : 'idle');
    s.setDepth(s.y); shadow.setPosition(s.x, s.y - 2).setDepth(s.y - 1);
    px = s.x; py = s.y;
  };
  scene.events.on('update', tick);
  scene.events.once('shutdown', () => scene.events.off('update', tick));
  return s;
}
