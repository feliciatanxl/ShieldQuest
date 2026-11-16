import Phaser from 'phaser';
import { addWanderer, CHAR_SCALE, CharacterId, GAME_ROOT } from './m01';

// Tiled map is authored at 32px tiles; drawn at 2x so characters reads at a believable scale
// next to HDB storeys and the void deck. All Tiled object coordinates are multiplied by this.
export const WORLD_SCALE = 2;
export const MAP_KEY = 'neighbourhood';
type Prop = { name: string; value: unknown };
const prop = (o: Phaser.Types.Tilemaps.TiledObject, name: string) => (o.properties as Prop[] | undefined)?.find((p) => p.name === name)?.value;

// NPC sprite ids in the Tiled map -> character sheets (loaded by preloadM01).
const NPC_SPRITES: Record<string, CharacterId> = { F04: 'worker', M06: 'rider' };

export interface Npc { name: string; speaker: string; line: string; x: number; y: number; sprite?: Phaser.GameObjects.Image }
export interface Zone { name: string; id: string; rect: Phaser.Geom.Rectangle }
export interface World { map: Phaser.Tilemaps.Tilemap; width: number; height: number; spawn: { x: number; y: number }; npcs: Npc[]; missions: Zone[]; walls: Phaser.Geom.Rectangle[] }

export function preloadNeighbourhood(scene: Phaser.Scene) {
  scene.load.tilemapTiledJSON(MAP_KEY, `${GAME_ROOT}maps/singapore-neighbourhood.tmj`);
  scene.load.image('neighbourhood-tiles', `${GAME_ROOT}tilesets/neighbourhood-tiles.png`);
}

/** Draws tile layers and reads Gameplay Objects. Throws with a clear message if the map is malformed. */
export function buildNeighbourhood(scene: Phaser.Scene): World {
  const map = scene.make.tilemap({ key: MAP_KEY });
  const tiles = map.addTilesetImage('shieldquest-neighbourhood', 'neighbourhood-tiles');
  if (!tiles) throw new Error('Neighbourhood tileset did not load');
  for (const name of ['Ground', 'Paths', 'Buildings', 'Decoration']) {
    const layer = map.createLayer(name, tiles, 0, 0);
    if (!layer) throw new Error(`Missing Tiled layer: ${name}`);
    layer.setScale(WORLD_SCALE);
  }
  const objects = map.getObjectLayer('Gameplay Objects')?.objects ?? [];
  const S = WORLD_SCALE, rect = (o: Phaser.Types.Tilemaps.TiledObject) => new Phaser.Geom.Rectangle((o.x ?? 0) * S, (o.y ?? 0) * S, (o.width ?? 0) * S, (o.height ?? 0) * S);
  const spawnObj = objects.find((o) => o.type === 'spawn');
  if (!spawnObj) throw new Error('Tiled map is missing its player spawn');

  const npcs: Npc[] = objects.filter((o) => o.type === 'npc').map((o) => {
    const raw = String(prop(o, 'dialogue') ?? o.name);
    const m = raw.match(/^([^:]{1,30}):\s*(.*)$/); // "Uncle Rahim: Welcome!" -> speaker + line
    const npc: Npc = { name: o.name, speaker: m ? m[1] : o.name, line: m ? m[2] : raw, x: (o.x ?? 0) * S, y: (o.y ?? 0) * S };
    const id = NPC_SPRITES[String(prop(o, 'sprite'))];
    if (id && scene.textures.exists(`char_${id}`)) {
      npc.sprite = scene.add.image(npc.x, npc.y, `char_${id}`, 0).setOrigin(0.5, 0.94).setScale(CHAR_SCALE).setDepth(npc.y);
      scene.add.ellipse(npc.x, npc.y - 2, 40, 10, 0x1d2b2a, 0.22).setDepth(npc.y - 1);
    } else console.warn(`[neighbourhood] NPC "${o.name}" has no sprite asset for "${String(prop(o, 'sprite'))}"`);
    return npc;
  });

  // every non-player character also strolls the open walkways (map coords x WORLD_SCALE)
  addWanderer(scene, 'poly', [200 * S, 465 * S], [650 * S, 465 * S]);
  addWanderer(scene, 'worker', [1000 * S, 660 * S], [625 * S, 660 * S]);
  addWanderer(scene, 'rider', [400 * S, 760 * S], [1000 * S, 760 * S]);

  return {
    map, width: map.widthInPixels * S, height: map.heightInPixels * S,
    spawn: { x: (spawnObj.x ?? 0) * S, y: (spawnObj.y ?? 0) * S },
    npcs,
    missions: objects.filter((o) => o.type === 'mission').map((o) => ({ name: o.name, id: String(prop(o, 'missionId') ?? o.name), rect: rect(o) })),
    walls: objects.filter((o) => o.type === 'collision').map(rect),
  };
}

/** Rounded in-canvas panel used for dialogue, prompts and toasts (fixed to the camera). */
export class Panel {
  private bg: Phaser.GameObjects.Graphics;
  private title: Phaser.GameObjects.Text;
  private body: Phaser.GameObjects.Text;
  private hint: Phaser.GameObjects.Text;
  visible = false;

  constructor(scene: Phaser.Scene, private x: number, private y: number, private w: number, opts: { accent?: number; size?: number } = {}) {
    const k = (this.k = opts.size ?? 1); // text scale, e.g. larger in the small homepage hero
    const fixed = <T extends Phaser.GameObjects.Components.ScrollFactor & Phaser.GameObjects.Components.Depth & Phaser.GameObjects.Components.Visible>(o: T) => o.setScrollFactor(0).setDepth(2000).setVisible(false);
    this.bg = fixed(scene.add.graphics());
    this.accent = opts.accent ?? 0x22d3ee;
    this.title = fixed(scene.add.text(x + 18, y + 12, '', { fontFamily: 'Outfit, system-ui, sans-serif', fontSize: `${15 * k}px`, fontStyle: 'bold', color: '#67e8f9' }));
    this.body = fixed(scene.add.text(x + 18, y + 12 + 24 * k, '', { fontFamily: 'Inter, system-ui, sans-serif', fontSize: `${17 * k}px`, color: '#f1f5f9', wordWrap: { width: w - 36 }, lineSpacing: 4 }));
    this.hint = fixed(scene.add.text(x + w - 18, y, '', { fontFamily: 'monospace', fontSize: `${12 * k}px`, color: '#94a3b8' }).setOrigin(1, 1));
  }
  private accent: number;
  private k = 1;

  show(title: string, body: string, hint = '') {
    this.title.setText(title);
    this.body.setText(body).setY(this.y + (title ? 12 + 24 * this.k : 14));
    const h = this.body.y - this.y + this.body.height + (hint ? 22 + 16 * this.k : 16);
    this.bg.clear().fillStyle(0x0b1324, 0.92).fillRoundedRect(this.x, this.y, this.w, h, 14)
      .lineStyle(2, this.accent, 0.8).strokeRoundedRect(this.x, this.y, this.w, h, 14);
    this.hint.setText(hint).setY(this.y + h - 10);
    this.setVisible(true);
  }
  hide() { this.setVisible(false); }
  private setVisible(v: boolean) { this.visible = v; [this.bg, this.title, this.body, this.hint].forEach((o) => o.setVisible(v)); }
}
