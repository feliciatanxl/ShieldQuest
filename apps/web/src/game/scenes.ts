import Phaser from 'phaser';
import { addWanderer, CHAR_SCALE, DebugInfo, Player, PlayerInput, PlaygroundScene, preloadM01 } from './m01';
import { buildNeighbourhood, Npc, Panel, preloadNeighbourhood, World, Zone } from './neighbourhood';

export const VIEW = { width: 960, height: 540 };

// Placeholder briefs keyed by the map's missionId: no mission content exists in the repo yet.
const MISSION_BRIEFS: Record<string, string> = {
  'verify-message': 'A neighbour got an "urgent" message asking for bank details. Stop, check the sender and verify through official channels before acting.',
  'minimart-clue': 'Something about this shopfront notice looks off. Look closely for clues before deciding who to trust.',
  'playground-choice': 'Kids are sharing a "free game skins" link at the playground. What advice would keep them safe?',
};

/** Mode 1: plain ground for checking M01 animation and movement. */
export class SandboxScene extends Phaser.Scene implements PlaygroundScene {
  player!: Player;
  input2!: PlayerInput;
  constructor() { super('sandbox'); }
  preload() { preloadM01(this); }
  create() {
    const { width, height } = VIEW;
    const g = this.add.graphics();
    g.fillStyle(0x7fb069).fillRect(0, 0, width, height);
    g.lineStyle(1, 0x000000, 0.06); // 32px grid helps judge stride length and foot sliding
    for (let x = 0; x <= width; x += 32) g.lineBetween(x, 0, x, height);
    for (let y = 0; y <= height; y += 32) g.lineBetween(0, y, width, y);
    this.physics.world.setBounds(0, 0, width, height);
    this.player = new Player(this, width / 2, height / 2 + 96, 2);
    // the other characters walk laps so every sheet can be checked side by side
    addWanderer(this, 'worker', [96, 160], [width - 96, 160], 2 * CHAR_SCALE);
    addWanderer(this, 'poly', [width - 96, 420], [96, 420], 2 * CHAR_SCALE);
    addWanderer(this, 'rider', [120, 120], [120, height - 40], 2 * CHAR_SCALE);
    this.input2 = new PlayerInput(this);
    this.game.events.emit('scene-ready', 'sandbox');
  }
  update() { this.player.update(this.input2); }
  debugInfo(): DebugInfo { const s = this.player.sprite; return { mode: 'Character Sandbox', x: Math.round(s.x), y: Math.round(s.y), facing: this.player.facing, gait: this.player.gait }; }
  setDebug(on: boolean) { toggleArcadeDebug(this, on); }
}

/** Modes 2 and 3: the Tiled neighbourhood. `missions` mode spawns near NPCs and shows trigger areas. */
export class NeighbourhoodScene extends Phaser.Scene implements PlaygroundScene {
  player!: Player;
  input2!: PlayerInput;
  world!: World;
  mode: 'explore' | 'missions' = 'explore';
  dialogue!: Panel;
  toast!: Panel;
  indicator!: Phaser.GameObjects.Container;
  overlay!: Phaser.GameObjects.Graphics;
  near?: Npc;
  zone?: Zone;
  toastUntil = 0;
  lastInteract = 0;

  constructor() { super('neighbourhood'); }
  init(data: { mode?: 'explore' | 'missions' }) { this.mode = data.mode ?? 'explore'; this.zone = undefined; this.near = undefined; }
  preload() { preloadM01(this); preloadNeighbourhood(this); }

  create() {
    this.world = buildNeighbourhood(this);
    const { width, height, spawn, walls, npcs } = this.world;
    this.physics.world.setBounds(0, 0, width, height);
    const start = this.mode === 'missions' && npcs[0] ? { x: npcs[0].x - 76, y: npcs[0].y + 30 } : spawn;
    this.player = new Player(this, start.x, start.y);
    this.player.facing = this.mode === 'missions' ? 'right' : 'up';

    const solids = this.physics.add.staticGroup();
    for (const r of walls) solids.add(this.add.zone(r.centerX, r.centerY, r.width, r.height));
    for (const n of npcs) solids.add(this.add.zone(n.x, n.y - 6, 30, 12)); // NPC feet block the player
    this.physics.add.collider(this.player.sprite, solids);

    this.cameras.main.setBounds(0, 0, width, height).startFollow(this.player.sprite, true, 0.12, 0.12, 0, 40).setRoundPixels(true);
    this.input2 = new PlayerInput(this, { interact: true });

    // floating "E" bubble above whichever NPC is in range
    const bubble = this.add.graphics().fillStyle(0x0b1324, 0.9).fillRoundedRect(-15, -15, 30, 30, 8).lineStyle(2, 0x22d3ee).strokeRoundedRect(-15, -15, 30, 30, 8);
    const label = this.add.text(0, 0, 'E', { fontFamily: 'monospace', fontSize: '16px', fontStyle: 'bold', color: '#67e8f9' }).setOrigin(0.5);
    this.indicator = this.add.container(0, 0, [bubble, label]).setDepth(5000).setVisible(false);
    this.tweens.add({ targets: [bubble, label], y: '-=6', duration: 450, yoyo: true, repeat: -1, ease: 'Sine.inOut' }); // bob children; container follows the NPC

    this.dialogue = new Panel(this, 40, VIEW.height - 150, VIEW.width - 80);
    this.toast = new Panel(this, VIEW.width / 2 - 230, 18, 460, { accent: 0xf59e0b });
    this.overlay = this.add.graphics().setDepth(4000);
    this.setDebug(this.mode === 'missions');
    this.game.events.emit('scene-ready', 'neighbourhood');
  }

  update(time: number) {
    const inDialogue = this.dialogue.visible;
    this.player.update(this.input2, inDialogue);
    const p = this.player.sprite;

    if (inDialogue) {
      // E or Esc closes; short cooldown so the same press can't reopen it
      if (this.input2.closePressed() || this.input2.interactPressed()) { this.dialogue.hide(); this.lastInteract = time; }
      this.indicator.setVisible(false);
      return;
    }
    this.input2.closePressed(); // drain stray Esc presses

    this.near = this.world.npcs.find((n) => Phaser.Math.Distance.Between(p.x, p.y, n.x, n.y) < 90);
    if (this.near) this.indicator.setPosition(this.near.x, this.near.y - 112).setVisible(true);
    else this.indicator.setVisible(false);

    // mission areas fire once on entry, not every frame
    const zone = this.world.missions.find((z) => z.rect.contains(p.x, p.y));
    if (zone !== this.zone) {
      this.zone = zone;
      if (zone) { this.toast.show('MISSION AREA', zone.name, 'E  inspect'); this.toastUntil = time + 3500; this.game.events.emit('mission-enter', zone.id); }
    }
    if (this.toast.visible && time > this.toastUntil) this.toast.hide();

    if (this.input2.interactPressed() && time - this.lastInteract > 250) {
      if (this.near) this.dialogue.show(this.near.speaker.toUpperCase(), this.near.line, 'E / Esc  close');
      else if (this.zone) this.dialogue.show(`MISSION · ${this.zone.name.toUpperCase()}`, MISSION_BRIEFS[this.zone.id] ?? 'Mission details coming soon.', 'E / Esc  close');
      if (this.dialogue.visible) { this.toast.hide(); this.lastInteract = time; }
    }
  }

  debugInfo(): DebugInfo {
    const s = this.player.sprite;
    return { mode: this.mode === 'missions' ? 'NPC & Missions' : 'Singapore Neighbourhood', x: Math.round(s.x), y: Math.round(s.y), facing: this.player.facing, gait: this.player.gait, zone: this.zone?.name ?? (this.near ? `near ${this.near.speaker}` : undefined) };
  }

  setDebug(on: boolean) {
    toggleArcadeDebug(this, on);
    const g = this.overlay.clear();
    if (!on) return;
    for (const z of this.world.missions) g.fillStyle(0xf59e0b, 0.18).fillRectShape(z.rect).lineStyle(2, 0xf59e0b, 0.9).strokeRectShape(z.rect);
    for (const n of this.world.npcs) g.lineStyle(2, 0x22d3ee, 0.7).strokeCircle(n.x, n.y, 90);
  }
}

function toggleArcadeDebug(scene: Phaser.Scene, on: boolean) {
  const w = scene.physics.world;
  if (on && !w.debugGraphic) w.createDebugGraphic();
  w.drawDebug = on;
  w.debugGraphic?.clear().setVisible(on);
}
