import Phaser from 'phaser';
import { HERO_VIEW, HeroScene } from './hero';
import { NeighbourhoodScene, SandboxScene, VIEW } from './scenes';

// Entry point loaded lazily by React pages so Phaser stays out of the main bundle.
export type PlaygroundMode = 'sandbox' | 'neighbourhood' | 'missions';
export { Phaser };

const base = (parent: HTMLElement, size: { width: number; height: number }): Phaser.Types.Core.GameConfig => ({
  type: Phaser.AUTO,
  parent,
  ...size,
  pixelArt: true,
  roundPixels: true,
  backgroundColor: '#0b1324',
  physics: { default: 'arcade', arcade: { debug: false } },
  scale: { mode: Phaser.Scale.FIT, autoCenter: Phaser.Scale.CENTER_BOTH },
});

export function createPlayground(parent: HTMLElement, mode: PlaygroundMode) {
  const game = new Phaser.Game({ ...base(parent, VIEW), scene: [] });
  game.scene.add('sandbox', SandboxScene, false);
  game.scene.add('neighbourhood', NeighbourhoodScene, false);
  switchMode(game, mode);
  return game;
}

/** One game instance; modes are scenes, so switching never creates another canvas. */
export function switchMode(game: Phaser.Game, mode: PlaygroundMode) {
  for (const s of game.scene.getScenes(false)) if (s.sys.isActive() || s.sys.isPaused()) game.scene.stop(s.sys.settings.key);
  if (mode === 'sandbox') game.scene.start('sandbox');
  else game.scene.start('neighbourhood', { mode: mode === 'missions' ? 'missions' : 'explore' });
}

export function createHero(parent: HTMLElement) {
  return new Phaser.Game({ ...base(parent, HERO_VIEW), physics: undefined, scene: HeroScene });
}
