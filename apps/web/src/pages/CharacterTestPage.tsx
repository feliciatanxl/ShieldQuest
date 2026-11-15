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
  }

  update(_t: number, delta: number) {
    const k = this.keys;
    const x = (k.D.isDown || k.RIGHT.isDown ? 1 : 0) - (k.A.isDown || k.LEFT.isDown ? 1 : 0);
    const y = (k.S.isDown || k.DOWN.isDown ? 1 : 0) - (k.W.isDown || k.UP.isDown ? 1 : 0);
    const p = this.player;

    if (!x && !y) {
      p.anims.stop();
      p.setTexture(`M01_idle_${this.facing}`);
      return;
    }

    // horizontal wins on diagonals
    this.facing = x > 0 ? 'right' : x < 0 ? 'left' : y > 0 ? 'down' : 'up';
    const gait = k.SHIFT.isDown ? 'run' : 'walk';
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
      <p>Move with WASD or arrow keys. Hold Shift to run.</p>
      <div ref={host} style={{ width: '100%', maxWidth: 960, aspectRatio: '16 / 9', margin: '0 auto' }} />
    </div>
  );
};
