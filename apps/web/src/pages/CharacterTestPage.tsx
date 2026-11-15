import React, { useEffect, useRef } from 'react';
import Phaser from 'phaser';

const IDLE = '/game/characters/v3/characters/male/';
const ANIM = '/game/characters/v3/animations/';
// Sheet rows match these directions; idle PNG names use front/back.
const DIRS = ['down', 'up', 'left', 'right'] as const;
type Dir = (typeof DIRS)[number];
const IDLE_POSE: Record<Dir, string> = { down: 'front', up: 'back', left: 'left', right: 'right' };
const GAITS = {
  walk: { frames: 6, fps: 8, speed: 130 },
  run: { frames: 8, fps: 12, speed: 220 },
} as const;
const SCALE = 2; // integer scale keeps pixels crisp

export class CharacterScene extends Phaser.Scene {
  player!: Phaser.GameObjects.Sprite;
  keys!: Record<string, Phaser.Input.Keyboard.Key>;
  facing: Dir = 'down';

  constructor() {
    super('character-test');
  }

  preload() {
    for (const d of DIRS) this.load.image(`M01_idle_${d}`, `${IDLE}M01_${IDLE_POSE[d]}.png`);
    for (const g of Object.keys(GAITS)) this.load.spritesheet(`M01_${g}`, `${ANIM}M01_${g}.png`, { frameWidth: 64, frameHeight: 96 });
  }

  create() {
    const { width, height } = this.scale;
    for (const [g, { frames, fps }] of Object.entries(GAITS)) {
      DIRS.forEach((d, row) => {
        const key = `M01_${g}_${d}`;
        if (this.anims.exists(key)) return; // anims are game-global; never register twice
        this.anims.create({ key, frames: this.anims.generateFrameNumbers(`M01_${g}`, { start: row * frames, end: row * frames + frames - 1 }), frameRate: fps, repeat: -1 });
      });
    }
    // origin at the feet: idle PNGs and sheet frames share a 64x96 cell and baseline, so swaps don't jump
    this.player = this.add.sprite(width / 2, height / 2, 'M01_idle_down').setOrigin(0.5, 1).setScale(SCALE);
    this.keys = this.input.keyboard!.addKeys('W,A,S,D,UP,DOWN,LEFT,RIGHT,SHIFT') as Record<string, Phaser.Input.Keyboard.Key>;
    if (this.sys.game.device.input.touch) this.createTouchControls();
  }

  // ---- touch: floating joystick on the left half, hold-to-run button bottom-right
  joy = new Phaser.Math.Vector2(); // -1..1 per axis
  joyId: number | null = null;
  runId: number | null = null;
  joyBase!: Phaser.GameObjects.Arc;
  joyKnob!: Phaser.GameObjects.Arc;
  runBtn!: Phaser.GameObjects.Arc;

  createTouchControls() {
    const { width, height } = this.scale;
    const R = 70;
    this.input.addPointer(2); // joystick + run at the same time
    const home = { x: 140, y: height - 140 };
    this.joyBase = this.add.circle(home.x, home.y, R, 0xffffff, 0.2).setStrokeStyle(3, 0xffffff, 0.5).setDepth(10);
    this.joyKnob = this.add.circle(home.x, home.y, 32, 0xffffff, 0.6).setDepth(11);
    this.runBtn = this.add.circle(width - 130, height - 130, 60, 0x42b8aa, 0.55).setStrokeStyle(3, 0xffffff, 0.7).setDepth(10);
    this.add.text(this.runBtn.x, this.runBtn.y, 'RUN', { fontFamily: 'monospace', fontSize: '28px', color: '#ffffff' }).setOrigin(0.5).setDepth(11);

    const overRun = (p: Phaser.Input.Pointer) => Phaser.Math.Distance.Between(p.x, p.y, this.runBtn.x, this.runBtn.y) <= 75;
    this.input.on('pointerdown', (p: Phaser.Input.Pointer) => {
      if (overRun(p)) { this.runId = p.id; this.runBtn.setFillStyle(0x42b8aa, 0.9); }
      else if (p.x < width / 2 && this.joyId === null) { this.joyId = p.id; this.joyBase.setPosition(p.x, p.y); this.joyKnob.setPosition(p.x, p.y); }
    });
    this.input.on('pointermove', (p: Phaser.Input.Pointer) => {
      if (p.id !== this.joyId) return;
      const v = new Phaser.Math.Vector2(p.x - this.joyBase.x, p.y - this.joyBase.y).limit(R);
      this.joyKnob.setPosition(this.joyBase.x + v.x, this.joyBase.y + v.y);
      this.joy.set(v.x / R, v.y / R);
    });
    const release = (p: Phaser.Input.Pointer) => {
      if (p.id === this.runId) { this.runId = null; this.runBtn.setFillStyle(0x42b8aa, 0.55); }
      if (p.id === this.joyId) { this.joyId = null; this.joy.set(0, 0); this.joyBase.setPosition(home.x, home.y); this.joyKnob.setPosition(home.x, home.y); }
    };
    this.input.on('pointerup', release);
    this.input.on('pointerupoutside', release);
  }

  update(_t: number, delta: number) {
    const k = this.keys;
    let x = (k.D.isDown || k.RIGHT.isDown ? 1 : 0) - (k.A.isDown || k.LEFT.isDown ? 1 : 0);
    let y = (k.S.isDown || k.DOWN.isDown ? 1 : 0) - (k.W.isDown || k.UP.isDown ? 1 : 0);
    if (!x && !y && this.joy.length() > 0.25) ({ x, y } = this.joy); // dead zone stops jitter at rest
    const p = this.player;

    if (!x && !y) {
      p.anims.stop();
      p.setTexture(`M01_idle_${this.facing}`);
      return;
    }

    // dominant axis picks the sprite; horizontal wins exact diagonals
    this.facing = Math.abs(x) >= Math.abs(y) ? (x > 0 ? 'right' : 'left') : y > 0 ? 'down' : 'up';
    const gait = k.SHIFT.isDown || this.runId !== null ? 'run' : 'walk';
    // normalised so diagonals aren't faster; delta keeps speed frame-rate independent
    const v = new Phaser.Math.Vector2(x, y).normalize().scale((GAITS[gait].speed * delta) / 1000);
    const halfW = p.displayWidth / 2;
    p.x = Phaser.Math.Clamp(p.x + v.x, halfW, this.scale.width - halfW);
    p.y = Phaser.Math.Clamp(p.y + v.y, p.displayHeight, this.scale.height);
    p.anims.play(`M01_${gait}_${this.facing}`, true); // true = keep playing if already on this anim
  }
}

export const CharacterTestPage: React.FC = () => {
  const host = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const game = new Phaser.Game({
      type: Phaser.AUTO,
      parent: host.current!,
      width: 960,
      height: 540,
      pixelArt: true,
      backgroundColor: '#7fb069',
      scale: { mode: Phaser.Scale.FIT, autoCenter: Phaser.Scale.CENTER_BOTH },
      scene: CharacterScene,
    });
    (window as unknown as { __game?: Phaser.Game }).__game = game; // dev-only test hook
    return () => game.destroy(true); // StrictMode remount: old canvas removed, no duplicates
  }, []);

  return (
    <div style={{ padding: 16 }}>
      <h1>M01 character test</h1>
      <p>Move with WASD or arrow keys. Hold Shift to run. On touch: drag on the left side to move, hold RUN.</p>
      {/* touch-action none: drags steer the joystick instead of scrolling the page */}
      <div ref={host} style={{ width: '100%', maxWidth: 960, aspectRatio: '16 / 9', margin: '0 auto', touchAction: 'none', userSelect: 'none' }} />
    </div>
  );
};
