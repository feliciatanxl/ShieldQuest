import * as THREE from 'three';

import { DISTRICTS, TRACK } from '../game/board.ts';
import {
  HALF_SPAN,
  RESTING_VIEW,
  TILE_DEPTH,
  cameraPlacement,
  layoutAt,
  orbitView,
  tokenAnchor,
  zoomView,
  type CameraView,
} from '../game/geometry.ts';
import type { BoardSpace, DistrictId } from '../game/types.ts';

/**
 * The 3D board.
 *
 * This is the *presentation* of the board, not the board itself. Every space it
 * draws also exists as a focusable button in the DOM layer above it, positioned
 * by `project()` below, and the whole scene can be replaced by the flat board
 * without changing a single rule. That split is deliberate: the proposal
 * commits to keyboard operation, colour-independent status and low-bandwidth
 * access, none of which survive gameplay that lives inside a canvas.
 *
 * Nothing here reads or writes game state. It is told what to show.
 */

const TILE_HEIGHT = 0.34;

/* ------------------------------------------------------------------ */
/* Palette                                                             */
/* ------------------------------------------------------------------ */

/**
 * The board is a toy, and it is lit like one.
 *
 * Everything above the table is bright, saturated and warm; the dark navy of
 * the game skin is the *room* the toy is sitting in, not the toy itself. That
 * split is deliberate. The HUD and the decision sheets carry the programme's
 * sober voice — a delayed consequence is not a cartoon — but the city a player
 * is building has to look like something worth building, and a board painted
 * in the same navy as the chrome around it reads as a spreadsheet with
 * perspective on it.
 *
 * District hues are the SAME four in `board.ts`; only their lightness moves, so
 * a district that is amber on the flat board is amber here.
 */
const BOARD_RIM = 0x0e3660;
const BOARD_EDGE = 0x17497d;
/** The plaza inside the ring. Warm sand, so white tiles still read as tiles. */
const PLAZA = 0xefe3c8;
const PLAZA_EDGE = 0xd9c8a4;
const TILE_FACE = 0xffffff;
const TILE_RESOLVED = 0x9aa8b8;

/**
 * The shape of a turn, in seconds.
 *
 * A turn is not one animation, it is four beats: the dice tumble, a pause long
 * enough to READ them, the token walking the spaces it was told to, and a pause
 * on the space it landed on. Losing the two pauses is what made a roll feel
 * like the board had skipped straight to the scenario — the movement was all
 * there, it just never stopped long enough for anyone to watch it.
 */
const DICE_THROW = 0.95;
const DICE_READ = 0.55;
const HOP = 0.16;
const LANDING_HOLD = 0.5;

/** The dice land here, in the open middle of the board, facing the camera. */
const DICE_REST_Z = 2.15;
const DICE_SPREAD = 0.78;
const DICE_SIZE = 0.68;
const UP = new THREE.Vector3(0, 1, 0);
const BOARD_DROP = 0.34;

export interface BoardSceneOptions {
  reducedMotion: boolean;
  onTokenArrived?: () => void;
  onDiceSettled?: () => void;
  onTileClick?: (index: number) => void;
}

interface TileHandle {
  index: number;
  group: THREE.Group;
  top: THREE.Mesh<THREE.BoxGeometry, THREE.MeshStandardMaterial>;
  band: THREE.Mesh<THREE.BoxGeometry, THREE.MeshStandardMaterial>;
  baseY: number;
  /** 1 the instant the piece lands on it, decaying to 0. */
  squash: number;
}

/* ------------------------------------------------------------------ */
/* Label textures                                                      */
/* ------------------------------------------------------------------ */

const KIND_GLYPH: Record<BoardSpace['kind'], string> = {
  GATE: '◈',
  MISSION: '▶',
  PEER_SHIELD: '❖',
  SITUATION: '✦',
  CLUE: '?',
  GUARDIAN: '★',
  COMMUNITY: '⌂',
};

/**
 * Tile faces are drawn to a canvas rather than composed from geometry.
 *
 * Text as geometry would need a font loader, a network round trip and a
 * fallback for when it fails — on a school connection that is three ways for
 * the board to arrive unreadable. A 2D canvas is synchronous, hits the system
 * font stack, and costs one texture per tile.
 */
function makeLabelTexture(
  space: BoardSpace,
  corner: boolean,
  rotation: number,
): THREE.CanvasTexture {
  const w = 300;
  const h = 300;
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d')!;

  const district = DISTRICTS[space.districtId].colour;

  // A wash of the district's own colour, not one neutral face for all 28.
  // Colour is the fastest way to see which quarter of the city you are in from
  // a phone held at arm's length — but it stays a WASH: the tile has to keep
  // enough contrast behind black type to be readable, and a colour-blind
  // player still has the band, the glyph and the name.
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, w, h);
  ctx.globalAlpha = corner ? 0.3 : 0.16;
  ctx.fillStyle = district;
  ctx.fillRect(0, 0, w, h);
  ctx.globalAlpha = 1;

  // No district stripe is drawn here: the stripe is a separate mesh on the
  // tile's inner edge, which stays put when this texture is counter-rotated
  // below. Baking it into the texture would send it wandering round the tile.

  // The kind glyph sits in a filled disc, so it reads as an icon rather than
  // as a stray punctuation mark at the top of the tile.
  ctx.beginPath();
  ctx.arc(w / 2, 70, corner ? 38 : 32, 0, Math.PI * 2);
  ctx.fillStyle = district;
  ctx.fill();
  ctx.fillStyle = '#ffffff';
  ctx.font = `700 ${corner ? 38 : 32}px system-ui, sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(KIND_GLYPH[space.kind], w / 2, 72);
  ctx.textBaseline = 'alphabetic';

  // Heavier and larger than a print board would use. A tile is roughly 40px
  // across on a phone; at that size the weight is doing more work than the
  // size is, and anything lighter than 800 dissolves into the district wash.
  ctx.fillStyle = '#0b2545';
  ctx.font = `800 ${corner ? 34 : 31}px system-ui, sans-serif`;
  const words = space.title.split(' ');
  const lines: string[] = [];
  let line = '';
  for (const word of words) {
    const candidate = line ? `${line} ${word}` : word;
    if (ctx.measureText(candidate).width > w - 30 && line) {
      lines.push(line);
      line = word;
    } else {
      line = candidate;
    }
  }
  if (line) lines.push(line);

  const kept = lines.slice(0, 3);
  const startY = 170 - (kept.length - 1) * 16;
  kept.forEach((text, i) => {
    ctx.fillText(text, w / 2, startY + i * 36);
  });

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 4;

  // Counter-rotate so every label reads upright to the camera.
  //
  // A physical board rotates its text a quarter turn per side, because there is
  // a player sitting on each side. Here there is one player holding one phone,
  // and a quarter of the board printed upside down is just a quarter of the
  // board they cannot read.
  texture.center.set(0.5, 0.5);
  texture.rotation = -rotation;
  return texture;
}

function makePipTexture(value: number): THREE.CanvasTexture {
  const size = 128;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;
  ctx.fillStyle = '#f8fafc';
  ctx.fillRect(0, 0, size, size);

  // A drawn edge on every face. The dice now land on a sand-coloured plaza
  // rather than on dark navy, and a white cube on a warm light ground has
  // almost nothing but its own shading to separate it from the board.
  ctx.strokeStyle = 'rgba(11, 37, 69, 0.4)';
  ctx.lineWidth = size * 0.05;
  ctx.strokeRect(size * 0.025, size * 0.025, size * 0.95, size * 0.95);

  ctx.fillStyle = '#0b2545';

  const q = size / 4;
  const spots: Record<number, [number, number][]> = {
    1: [[2, 2]],
    2: [
      [1, 1],
      [3, 3],
    ],
    3: [
      [1, 1],
      [2, 2],
      [3, 3],
    ],
    4: [
      [1, 1],
      [3, 1],
      [1, 3],
      [3, 3],
    ],
    5: [
      [1, 1],
      [3, 1],
      [2, 2],
      [1, 3],
      [3, 3],
    ],
    6: [
      [1, 1],
      [3, 1],
      [1, 2],
      [3, 2],
      [1, 3],
      [3, 3],
    ],
  };
  for (const [cx, cy] of spots[value] ?? []) {
    ctx.beginPath();
    ctx.arc(cx * q, cy * q, size * 0.085, 0, Math.PI * 2);
    ctx.fill();
  }
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

/** Rotation that brings a die's `value` face to point up. */
function faceUpRotation(value: number): THREE.Euler {
  switch (value) {
    case 1:
      return new THREE.Euler(0, 0, 0);
    case 6:
      return new THREE.Euler(Math.PI, 0, 0);
    case 3:
      return new THREE.Euler(0, 0, Math.PI / 2);
    case 4:
      return new THREE.Euler(0, 0, -Math.PI / 2);
    case 2:
      return new THREE.Euler(-Math.PI / 2, 0, 0);
    default:
      return new THREE.Euler(Math.PI / 2, 0, 0);
  }
}

/* ------------------------------------------------------------------ */
/* Landmarks                                                           */
/* ------------------------------------------------------------------ */

const ROOF_TRIM = 0xffffff;

/**
 * A community work, as a small building.
 *
 * Four silhouettes, one per district, so a player can see at a glance which
 * quarter of the city they have been investing in — a row of identical boxes
 * in four colours tells them how MANY they built and nothing about where. The
 * shapes are built from primitives on purpose: no model file to fetch, nothing
 * to fall back from on a school connection, and the whole set costs four
 * geometries a district.
 *
 * `tier` is 0, 1 or 2 — the three works in `board.ts`, in the order they are
 * bought. Later works are taller, so the skyline itself is the progress bar.
 */
function makeLandmark(districtId: DistrictId, tier: number): THREE.Group {
  const group = new THREE.Group();
  const colour = new THREE.Color(DISTRICTS[districtId].colour);

  const body = new THREE.MeshStandardMaterial({ color: colour, roughness: 0.5, metalness: 0.1 });
  // Walls are a PASTEL OF THE DISTRICT, not cream. Cream walls disappeared
  // into the cream plaza they stand on and left only the roofs visible — four
  // coloured shapes lying flat on a beige field.
  const wall = new THREE.MeshStandardMaterial({
    color: colour.clone().lerp(new THREE.Color(0xffffff), 0.34),
    roughness: 0.75,
  });
  const trim = new THREE.MeshStandardMaterial({ color: ROOF_TRIM, roughness: 0.55 });
  const scale = 1 + tier * 0.24;

  const add = (mesh: THREE.Mesh, x: number, y: number, z: number) => {
    mesh.position.set(x, y, z);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    group.add(mesh);
    return mesh;
  };

  // A darker pad under every work, so it reads as standing ON the plaza rather
  // than sinking into it at this camera angle.
  const pad = new THREE.Mesh(
    new THREE.BoxGeometry(0.98, 0.07, 0.92),
    new THREE.MeshStandardMaterial({
      color: colour.clone().lerp(new THREE.Color(0x000000), 0.35),
      roughness: 1,
    }),
  );
  pad.position.y = 0.03;
  pad.receiveShadow = true;
  group.add(pad);

  switch (districtId) {
    case 'school': {
      // A schoolhouse: pale block, steep pitched roof, flag on the ridge.
      const h = 0.62 * scale;
      add(new THREE.Mesh(new THREE.BoxGeometry(0.78, h, 0.64), wall), 0, h / 2 + 0.06, 0);
      const roof = add(
        new THREE.Mesh(new THREE.ConeGeometry(0.62, 0.46 * scale, 4), body),
        0,
        h + 0.29 * scale,
        0,
      );
      roof.rotation.y = Math.PI / 4;
      add(new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.34, 6), trim), 0, h + 0.68, 0);
      break;
    }
    case 'retail': {
      // A shopfront: wide block, awning over the pavement, sign above it.
      const h = 0.56 * scale;
      add(new THREE.Mesh(new THREE.BoxGeometry(0.86, h, 0.6), wall), 0, h / 2 + 0.06, 0);
      add(new THREE.Mesh(new THREE.BoxGeometry(0.98, 0.09, 0.74), body), 0, h * 0.62, 0.1);
      add(new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.22, 0.1), body), 0, h + 0.2, 0.22);
      add(new THREE.Mesh(new THREE.BoxGeometry(0.88, 0.08, 0.66), trim), 0, h + 0.1, 0);
      break;
    }
    case 'digital': {
      // A relay tower: slim shaft, two lit bands, antenna.
      const h = 1.02 * scale;
      add(new THREE.Mesh(new THREE.BoxGeometry(0.44, h, 0.44), wall), 0, h / 2 + 0.06, 0);
      add(new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.12, 0.5), body), 0, h * 0.42, 0);
      add(new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.12, 0.5), body), 0, h * 0.76, 0);
      add(new THREE.Mesh(new THREE.BoxGeometry(0.54, 0.1, 0.54), trim), 0, h + 0.11, 0);
      add(new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.4, 6), body), 0, h + 0.36, 0);
      break;
    }
    default: {
      // A hall: round drum under a coloured dome.
      const h = 0.5 * scale;
      add(new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.46, h, 18), wall), 0, h / 2 + 0.06, 0);
      add(new THREE.Mesh(new THREE.CylinderGeometry(0.48, 0.48, 0.07, 18), trim), 0, h + 0.09, 0);
      add(
        new THREE.Mesh(
          new THREE.SphereGeometry(0.43, 18, 10, 0, Math.PI * 2, 0, Math.PI / 2),
          body,
        ),
        0,
        h + 0.12,
        0,
      );
      break;
    }
  }

  // Wrapped, not scaled in place. The rise animation drives `scale.y` on the
  // object `setUpgrades` adds to the scene, so the overall size has to live on
  // a child or the two would fight over the same property.
  const outer = new THREE.Group();
  group.scale.setScalar(1.3);
  outer.add(group);
  return outer;
}

/* ------------------------------------------------------------------ */
/* Scene                                                               */
/* ------------------------------------------------------------------ */

export class BoardScene {
  private renderer: THREE.WebGLRenderer;
  private scene = new THREE.Scene();
  private camera: THREE.PerspectiveCamera;
  private raycaster = new THREE.Raycaster();
  private pointer = new THREE.Vector2();
  /**
   * `Timer` rather than the deprecated `Clock`, and connected to the document
   * so the Page Visibility API clamps the delta. A participant who switches
   * apps mid-session and comes back would otherwise return to a frame with
   * thirty seconds of accumulated time in it, which teleports the token.
   */
  private timer = new THREE.Timer();

  private tiles: TileHandle[] = [];
  private token = new THREE.Group();
  private tokenBody: THREE.Mesh | null = null;
  private tokenCrest: THREE.Mesh | null = null;
  private tokenShadow: THREE.Mesh;
  private dice: THREE.Mesh[] = [];
  private buildings = new Map<DistrictId, THREE.Group>();
  /** Works currently rising out of the plaza. */
  private growing: { districtId: DistrictId; group: THREE.Group; t: number }[] = [];
  private pulses: { mesh: THREE.Mesh; life: number }[] = [];

  private options: BoardSceneOptions;
  private disposed = false;

  /* camera framing */
  private focus = new THREE.Vector3(0, 0, 0);
  private focusTarget = new THREE.Vector3(0, 0, 0);
  private cameraDistance = 15;

  /*
   * The player's view of the board, on top of the framing above.
   *
   * The camera still follows the token; this decides where it follows it FROM.
   * The arithmetic lives in `game/geometry.ts` with the rest of the board's
   * geometry, where it can be tested — including the part that matters most,
   * that a resting view still produces the exact shot the board shipped with.
   */
  private view: CameraView = { ...RESTING_VIEW };
  private viewMoved = false;
  private shake = 0;

  /* token movement */
  private hopQueue: number[] = [];
  private hopFrom = new THREE.Vector3();
  private hopTo = new THREE.Vector3();
  private hopTime = 0;
  private hopping = false;
  private tokenIndex = 0;

  /* dice throw */
  private diceTime = 0;
  private diceThrowing = false;
  private diceTarget: [number, number] = [1, 1];

  /**
   * Pending beats, counted down by the render loop rather than by `setTimeout`.
   *
   * Tying them to the loop means they pause when the tab is hidden, resume with
   * it, and die with `dispose()`. A stray timeout firing into a disposed scene
   * is how a turn ends up half-played.
   */
  private delays: { left: number; run: () => void }[] = [];

  constructor(canvas: HTMLCanvasElement, options: BoardSceneOptions) {
    this.options = options;

    this.renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance',
    });
    // Capped rather than uncapped: a 3x-DPR phone renders nine times the pixels
    // for a difference nobody can see at arm's length, and the battery cost
    // shows up in a 45-minute session.
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFShadowMap;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.05;

    this.timer.connect(document);
    // Light and thin. The old navy fog at this density was pulling the
    // saturation out of the far side of the board — the exact half a player
    // looks at to decide where they are heading.
    this.scene.fog = new THREE.FogExp2(0x123a63, 0.009);
    this.camera = new THREE.PerspectiveCamera(42, 1, 0.1, 120);

    this.buildLights();
    this.buildBoard();
    this.buildTiles();
    this.buildToken();
    this.tokenShadow = this.buildTokenShadow();
    this.buildDice();

    this.setTokenIndex(0, true);
    this.resize();
    this.renderer.setAnimationLoop(() => this.tick());
  }

  /* --- construction ------------------------------------------------ */

  private buildLights() {
    // Bright sky, warm bounce off the plaza. The old pairing lit a light-blue
    // sky against a near-black ground, which is a night-time key: it drained
    // the saturation out of every district colour on the board and left the
    // tiles reading grey.
    this.scene.add(new THREE.HemisphereLight(0xffffff, 0xc9a97a, 1.55));

    const key = new THREE.DirectionalLight(0xfff4e0, 2.1);
    key.position.set(6, 14, 8);
    key.castShadow = true;
    key.shadow.mapSize.set(1024, 1024);
    key.shadow.camera.near = 1;
    key.shadow.camera.far = 40;
    const d = HALF_SPAN + 3;
    key.shadow.camera.left = -d;
    key.shadow.camera.right = d;
    key.shadow.camera.top = d;
    key.shadow.camera.bottom = -d;
    key.shadow.bias = -0.0012;
    this.scene.add(key);

    // A warm rim from the city centre, so tiles read as objects rather than
    // flat cards when the key light is behind the camera.
    const rim = new THREE.PointLight(0xffd9a0, 30, 24, 2);
    rim.position.set(0, 3.2, 0);
    this.scene.add(rim);
  }

  /**
   * The table the city sits on.
   *
   * Three stacked slabs — a deep blue frame, a lighter bevel on top of it, and
   * a warm sand plaza inside the ring — because a single flat plane gives a
   * board no edge, and an edge is what makes it read as an object you could
   * pick up rather than a texture the tiles are floating over.
   */
  private buildBoard() {
    const span = HALF_SPAN * 2 + 0.7;

    const slab = new THREE.Mesh(
      new THREE.BoxGeometry(span, BOARD_DROP, span),
      new THREE.MeshStandardMaterial({ color: BOARD_RIM, roughness: 0.85, metalness: 0.05 }),
    );
    slab.position.y = -BOARD_DROP / 2;
    slab.receiveShadow = true;
    this.scene.add(slab);

    const bevel = new THREE.Mesh(
      new THREE.BoxGeometry(span - 0.22, 0.1, span - 0.22),
      new THREE.MeshStandardMaterial({ color: BOARD_EDGE, roughness: 0.7, metalness: 0.08 }),
    );
    bevel.position.y = 0.01;
    bevel.receiveShadow = true;
    this.scene.add(bevel);

    const plazaSpan = span - 2 * (TILE_DEPTH + 0.35);
    const plaza = new THREE.Mesh(
      new THREE.BoxGeometry(plazaSpan, 0.14, plazaSpan),
      new THREE.MeshStandardMaterial({ color: PLAZA, roughness: 0.95, metalness: 0 }),
    );
    plaza.position.y = 0.06;
    plaza.receiveShadow = true;
    this.scene.add(plaza);

    const kerb = new THREE.Mesh(
      new THREE.BoxGeometry(plazaSpan + 0.3, 0.1, plazaSpan + 0.3),
      new THREE.MeshStandardMaterial({ color: PLAZA_EDGE, roughness: 0.95, metalness: 0 }),
    );
    kerb.position.y = 0.04;
    kerb.receiveShadow = true;
    this.scene.add(kerb);

    // The city core: a shield on a plinth in the middle of the plaza. It is
    // pure atmosphere and carries no state, so it is safe for it to be the one
    // thing on screen that moves when nothing is happening.
    const core = new THREE.Group();
    core.name = 'core';

    const plinth = new THREE.Mesh(
      new THREE.CylinderGeometry(0.78, 0.92, 0.3, 24),
      new THREE.MeshStandardMaterial({ color: 0xf7f2e4, roughness: 0.8 }),
    );
    plinth.position.y = 0.24;
    plinth.castShadow = true;
    plinth.receiveShadow = true;
    this.scene.add(plinth);

    const shield = new THREE.Mesh(
      new THREE.CylinderGeometry(0.62, 0.62, 0.2, 6),
      new THREE.MeshStandardMaterial({
        color: 0xf2ae33,
        roughness: 0.3,
        metalness: 0.55,
        emissive: 0x8a5400,
        emissiveIntensity: 0.35,
      }),
    );
    shield.rotation.x = Math.PI / 2;
    shield.castShadow = true;
    core.add(shield);

    const crest = new THREE.Mesh(
      new THREE.TorusGeometry(0.44, 0.07, 10, 6),
      new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.35, metalness: 0.3 }),
    );
    crest.position.z = 0.12;
    core.add(crest);

    core.position.y = 1.15;
    this.scene.add(core);

    const halo = new THREE.Mesh(
      new THREE.TorusGeometry(1.5, 0.05, 8, 64),
      new THREE.MeshBasicMaterial({ color: 0xf2ae33, transparent: true, opacity: 0.45 }),
    );
    halo.rotation.x = Math.PI / 2;
    halo.position.y = 0.42;
    halo.name = 'halo';
    this.scene.add(halo);

    // A ring path and four planters, so the plaza reads as a public square
    // rather than as the empty middle of a board. Deliberately neutral stone
    // and sage: the four district hues are the only colours on this board
    // allowed to carry identity, and a fifth bright colour in the centre would
    // start competing with them.
    const path = new THREE.Mesh(
      new THREE.RingGeometry(2.5, 2.9, 48),
      new THREE.MeshStandardMaterial({ color: PLAZA_EDGE, roughness: 1 }),
    );
    path.rotation.x = -Math.PI / 2;
    path.position.y = 0.132;
    path.receiveShadow = true;
    this.scene.add(path);

    const planterBase = new THREE.MeshStandardMaterial({ color: 0xf7f2e4, roughness: 0.9 });
    const foliage = new THREE.MeshStandardMaterial({ color: 0x8fa37a, roughness: 0.95 });
    for (const [px, pz] of [
      [-2.2, -2.2],
      [2.2, -2.2],
      [-2.2, 2.2],
      [2.2, 2.2],
    ] as const) {
      const pot = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.28, 0.2, 12), planterBase);
      pot.position.set(px, 0.23, pz);
      pot.castShadow = true;
      pot.receiveShadow = true;
      this.scene.add(pot);

      const bush = new THREE.Mesh(new THREE.SphereGeometry(0.24, 12, 8), foliage);
      bush.position.set(px, 0.44, pz);
      bush.scale.y = 0.8;
      bush.castShadow = true;
      this.scene.add(bush);
    }
  }

  private buildTiles() {
    for (const space of TRACK) {
      const layout = layoutAt(space.index);
      const group = new THREE.Group();
      group.position.set(layout.x, 0, layout.z);
      group.rotation.y = layout.rotation;

      const districtColour = new THREE.Color(DISTRICTS[space.districtId].colour);

      // A coloured plinth under every tile, so a tile has visible thickness in
      // its district's colour rather than four grey sides. This is most of what
      // makes the board read as moulded plastic instead of printed card.
      const plinth = new THREE.Mesh(
        new THREE.BoxGeometry(layout.width * 0.97, TILE_HEIGHT * 0.62, layout.depth * 0.97),
        new THREE.MeshStandardMaterial({
          color: districtColour.clone().multiplyScalar(0.72),
          roughness: 0.72,
          metalness: 0.04,
        }),
      );
      plinth.position.y = TILE_HEIGHT * 0.31;
      plinth.castShadow = true;
      plinth.receiveShadow = true;
      group.add(plinth);

      const body = new THREE.Mesh(
        new THREE.BoxGeometry(layout.width * 0.9, TILE_HEIGHT * 0.5, layout.depth * 0.9),
        new THREE.MeshStandardMaterial({
          map: makeLabelTexture(space, Boolean(layout.corner), layout.rotation),
          roughness: 0.55,
          metalness: 0.02,
        }),
      );
      body.position.y = TILE_HEIGHT * 0.75;
      body.castShadow = true;
      body.receiveShadow = true;
      body.userData.index = space.index;
      group.add(body);

      // A colour band on the tile's inner edge, so district identity is legible
      // from the low camera angle where the face is foreshortened.
      const band = new THREE.Mesh(
        new THREE.BoxGeometry(layout.width * 0.9, TILE_HEIGHT * 0.34, 0.11),
        new THREE.MeshStandardMaterial({
          color: districtColour,
          roughness: 0.4,
          emissive: districtColour,
          emissiveIntensity: 0.3,
        }),
      );
      band.position.set(0, TILE_HEIGHT * 1.02, -layout.depth * 0.44);
      band.castShadow = true;
      group.add(band);

      this.scene.add(group);
      this.tiles.push({ index: space.index, group, top: body, band, baseY: 0, squash: 0 });
    }
  }

  /**
   * The piece.
   *
   * Built once and re-coloured in place by `setPieceLook`, because the look is
   * a cosmetic the player can change mid-run and rebuilding geometry to change
   * a colour would drop a frame in the middle of a hop. The colours it starts
   * with are the default cosmetic's; `content/cosmetics.ts` is the source both
   * renderers read, so the piece can never be amber here and teal on the flat
   * board.
   */
  private buildToken() {
    const body = new THREE.Mesh(
      new THREE.CapsuleGeometry(0.17, 0.2, 6, 16),
      new THREE.MeshStandardMaterial({
        color: 0xf2ae33,
        roughness: 0.3,
        metalness: 0.35,
        emissive: 0x7a4b00,
        emissiveIntensity: 0.35,
      }),
    );
    body.position.y = 0.3;
    body.castShadow = true;

    const crest = new THREE.Mesh(
      new THREE.OctahedronGeometry(0.13, 0),
      new THREE.MeshStandardMaterial({
        color: 0xffffff,
        roughness: 0.2,
        metalness: 0.5,
        emissive: 0x3f6ea8,
        emissiveIntensity: 0.5,
      }),
    );
    crest.position.y = 0.62;
    crest.castShadow = true;

    // A white base under the piece. Without it the capsule reads as a bead
    // hovering over the tile from the resting camera angle, and the piece is
    // the one object on the board a player has to be able to find instantly.
    const base = new THREE.Mesh(
      new THREE.CylinderGeometry(0.24, 0.27, 0.07, 20),
      new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.5, metalness: 0.1 }),
    );
    base.position.y = 0.035;
    base.castShadow = true;

    this.tokenBody = body;
    this.tokenCrest = crest;
    this.token.add(base, body, crest);
    this.scene.add(this.token);
  }

  private buildTokenShadow(): THREE.Mesh {
    // A painted blob under the token. The real shadow map is soft and low
    // resolution at this distance, and a hopping piece needs a hard contact
    // point or it reads as floating.
    const mesh = new THREE.Mesh(
      new THREE.CircleGeometry(0.22, 24),
      new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.32 }),
    );
    mesh.rotation.x = -Math.PI / 2;
    mesh.position.y = TILE_HEIGHT + 0.012;
    this.scene.add(mesh);
    return mesh;
  }

  private buildDice() {
    const materials = [3, 4, 1, 6, 2, 5].map(
      (value) =>
        new THREE.MeshStandardMaterial({
          map: makePipTexture(value),
          roughness: 0.35,
          metalness: 0.05,
        }),
    );
    for (let i = 0; i < 2; i += 1) {
      const die = new THREE.Mesh(new THREE.BoxGeometry(DICE_SIZE, DICE_SIZE, DICE_SIZE), materials);
      die.castShadow = true;
      die.visible = false;
      this.scene.add(die);
      this.dice.push(die);
    }
  }

  /** Run `fn` after `seconds` of rendered time. */
  private after(seconds: number, fn: () => void) {
    // Reduced motion removes the movement, not the reading time: the player
    // still has to see what they rolled and where they landed.
    const wait = this.options.reducedMotion ? Math.min(seconds, 0.4) : seconds;
    if (wait <= 0) {
      fn();
      return;
    }
    this.delays.push({ left: wait, run: fn });
  }

  private tickDelays(dt: number) {
    for (let i = this.delays.length - 1; i >= 0; i -= 1) {
      const delay = this.delays[i]!;
      delay.left -= dt;
      if (delay.left <= 0) {
        this.delays.splice(i, 1);
        delay.run();
      }
    }
  }

  /* --- public API --------------------------------------------------- */

  /* --- the player's view -------------------------------------------- */

  /**
   * Turn the board, in screen pixels.
   *
   * Applied straight to the angles with no inertia: a board that keeps
   * drifting after the mouse stops is a board a player has to fight to aim,
   * and under `prefers-reduced-motion` it would be movement nobody asked for.
   * Dragging right turns the board right, which means turning the CAMERA the
   * other way — the sign here is the difference between "grabbing the table"
   * and "pushing the camera", and the table is what a player expects.
   */
  orbit(dx: number, dy: number) {
    if (dx === 0 && dy === 0) return;
    this.view = orbitView(this.view, dx, dy);
    this.viewMoved = true;
  }

  /**
   * Move the camera in or out. `steps` is a wheel delta or a pinch ratio in
   * disguise: positive pulls back, negative moves closer.
   */
  zoomBy(steps: number) {
    if (steps === 0) return;
    this.view = zoomView(this.view, steps);
    this.viewMoved = true;
  }

  /** Back to the framed shot. */
  resetView() {
    this.view = { ...RESTING_VIEW };
    this.viewMoved = false;
  }

  /** True once the player has moved the camera off the default framing. */
  hasMovedView(): boolean {
    return this.viewMoved;
  }

  /**
   * Put the equipped cosmetic on the piece.
   *
   * `glow` becomes the crest and the emissive lift, which is what reads as a
   * ring from the camera's angle — a literal halo mesh would be hidden by the
   * tile the piece is standing on half the time.
   */
  setPieceLook(colour: string, glow: string | null) {
    const body = this.tokenBody?.material as THREE.MeshStandardMaterial | undefined;
    if (body) {
      body.color.set(colour);
      body.emissive.set(glow ?? colour);
      body.emissiveIntensity = glow ? 0.55 : 0.35;
    }
    const crest = this.tokenCrest?.material as THREE.MeshStandardMaterial | undefined;
    if (crest) crest.emissive.set(glow ?? '#3f6ea8');
  }

  setTokenIndex(index: number, instant = false) {
    this.tokenIndex = index;
    const anchor = tokenAnchor(index);
    if (instant) {
      this.token.position.set(anchor.x, TILE_HEIGHT, anchor.z);
      this.focus.copy(this.focusFor(index));
    }
    this.focusTarget.copy(this.focusFor(index));
  }

  /**
   * Hop the token through every space in `path`, one space at a time — after
   * pausing long enough for the dice to have been read.
   */
  moveToken(path: number[]) {
    this.after(DICE_READ, () => {
      if (path.length === 0) {
        this.land();
        return;
      }
      if (this.options.reducedMotion) {
        this.setTokenIndex(path[path.length - 1]!, true);
        this.land();
        return;
      }
      this.hopQueue = [...path];
      this.beginHop();
    });
  }

  /** The token is on its space. Mark it, hold, then hand the turn back. */
  private land() {
    this.pulse(this.tokenIndex);
    const tile = this.tiles.find((entry) => entry.index === this.tokenIndex);
    if (tile && !this.options.reducedMotion) tile.squash = 1;
    this.after(LANDING_HOLD, () => this.options.onTokenArrived?.());
  }

  /**
   * Throw the dice and settle them showing `a` and `b`.
   *
   * They land in the open middle of the board rather than beside the token.
   * Thrown at the player's own piece they were small, half hidden behind the
   * space it was standing on, and sometimes off the bottom of a phone screen —
   * the roll was happening, just not anywhere the player was looking.
   */
  throwDice(a: number, b: number) {
    this.diceTarget = [a, b];
    this.dice.forEach((die, i) => {
      die.visible = true;
      die.position.set(
        (i === 0 ? -DICE_SPREAD : DICE_SPREAD) + (Math.random() - 0.5) * 0.3,
        4.6,
        DICE_REST_Z - 0.6 + (Math.random() - 0.5) * 0.3,
      );
      die.rotation.set(Math.random() * 6, Math.random() * 6, Math.random() * 6);
    });

    if (this.options.reducedMotion) {
      this.placeDiceAtRest();
      this.options.onDiceSettled?.();
      return;
    }
    this.diceTime = 0;
    this.diceThrowing = true;
  }

  hideDice() {
    this.dice.forEach((die) => (die.visible = false));
  }

  /** A ring that expands out of a tile. Used on landing and on a reward. */
  pulse(index: number, colour = 0x5fa0e8) {
    const layout = layoutAt(index);
    const ring = new THREE.Mesh(
      new THREE.RingGeometry(0.28, 0.36, 32),
      new THREE.MeshBasicMaterial({
        color: colour,
        transparent: true,
        opacity: 0.9,
        side: THREE.DoubleSide,
      }),
    );
    ring.rotation.x = -Math.PI / 2;
    ring.position.set(layout.x, TILE_HEIGHT + 0.02, layout.z);
    this.scene.add(ring);
    this.pulses.push({ mesh: ring, life: 0 });
  }

  /** A short camera shake. Reserved for a delayed consequence landing. */
  jolt() {
    if (this.options.reducedMotion) return;
    this.shake = 1;
  }

  /**
   * Raise the buildings a district has earned.
   *
   * Upgrades are the only thing on the board that persists visually between
   * turns, which is what makes spending coins feel like it mattered. They are
   * cosmetic by design — see `board.ts` for why a purchase may never buy an
   * advantage in a decision.
   */
  setUpgrades(districtId: DistrictId, count: number, animate = true) {
    let group = this.buildings.get(districtId);
    if (!group) {
      group = new THREE.Group();
      this.scene.add(group);
      this.buildings.set(districtId, group);
    }
    if (group.children.length === count) return;

    // Only ever ADD, so a resume does not re-raise a city the player already
    // built and a single new work is the only thing that animates. Rebuilding
    // the whole district on every state change — which is what a `clear()`
    // here did — made three buildings pop every time one was bought.
    if (group.children.length > count) {
      group.clear();
      this.growing = this.growing.filter((entry) => entry.districtId !== districtId);
    }

    const sideSpaces = TRACK.filter((s) => s.districtId === districtId && !s.corner);

    for (let i = group.children.length; i < count; i += 1) {
      const host = sideSpaces[i * 2 + 1] ?? sideSpaces[i] ?? sideSpaces[0]!;
      const layout = layoutAt(host.index);
      const landmark = makeLandmark(districtId, i);

      const toCentre = Math.hypot(layout.x, layout.z) || 1;
      landmark.position.set(
        layout.x - (layout.x / toCentre) * (TILE_DEPTH * 0.62 + 0.5),
        0.13,
        layout.z - (layout.z / toCentre) * (TILE_DEPTH * 0.62 + 0.5),
      );
      landmark.rotation.y = layout.rotation;
      group.add(landmark);

      // A new work rises out of the plaza with an overshoot, and throws a ring
      // where it lands. This is the only moment in the game where coins the
      // player earned turn into something that stays on the board, so it is
      // the one that has to be worth watching.
      if (animate && !this.options.reducedMotion) {
        landmark.scale.set(1, 0.001, 1);
        this.growing.push({ districtId, group: landmark, t: 0 });
        this.pulse(host.index, new THREE.Color(DISTRICTS[districtId].colour).getHex());
      }
    }
  }

  /** Dim the tiles the player has already resolved. */
  setResolved(indices: Set<number>) {
    for (const tile of this.tiles) {
      const done = indices.has(tile.index);
      // Resolved tiles desaturate rather than disappear: a space the player has
      // already played still has to be findable, and still has to be legible to
      // a facilitator pointing at it from across the room.
      tile.top.material.color.setHex(done ? TILE_RESOLVED : TILE_FACE);
      tile.band.material.emissiveIntensity = done ? 0.05 : 0.3;
    }
  }

  /** Lift and glow the tile the player is standing on. */
  setCurrent(index: number) {
    for (const tile of this.tiles) {
      tile.baseY = tile.index === index ? 0.14 : 0;
    }
  }

  /**
   * Screen rectangle of a tile, for the DOM control layer.
   *
   * Projected from the same geometry the meshes are built from, so a focus ring
   * lands exactly on the tile it belongs to rather than near it. All four
   * corners are projected and bounded rather than scaling one offset: a tile at
   * the near edge of a perspective camera is a trapezium on screen, and half
   * its width measured along one axis is not half its width.
   */
  project(index: number): { x: number; y: number; w: number; h: number } | null {
    const layout = layoutAt(index);
    const size = this.renderer.getSize(new THREE.Vector2());
    const halfW = layout.width / 2;
    const halfD = layout.depth / 2;

    let minX = Infinity;
    let minY = Infinity;
    let maxX = -Infinity;
    let maxY = -Infinity;

    for (const [sw, sd] of [
      [-1, -1],
      [1, -1],
      [1, 1],
      [-1, 1],
    ] as const) {
      const corner = new THREE.Vector3(sw * halfW, TILE_HEIGHT, sd * halfD)
        .applyAxisAngle(UP, layout.rotation)
        .add(new THREE.Vector3(layout.x, 0, layout.z))
        .project(this.camera);

      // Behind the camera: the whole tile is off-screen for our purposes.
      if (corner.z > 1) return null;

      const sx = ((corner.x + 1) / 2) * size.x;
      const sy = ((1 - corner.y) / 2) * size.y;
      minX = Math.min(minX, sx);
      maxX = Math.max(maxX, sx);
      minY = Math.min(minY, sy);
      maxY = Math.max(maxY, sy);
    }

    return {
      x: (minX + maxX) / 2,
      y: (minY + maxY) / 2,
      // A 24px floor: a tile at the far edge of the board projects smaller than
      // a fingertip, and every space has to stay tappable.
      w: Math.max(24, maxX - minX),
      h: Math.max(24, maxY - minY),
    };
  }

  /** Which tile is under a pointer event, if any. */
  pick(clientX: number, clientY: number): number | null {
    const rect = this.renderer.domElement.getBoundingClientRect();
    this.pointer.set(
      ((clientX - rect.left) / rect.width) * 2 - 1,
      -((clientY - rect.top) / rect.height) * 2 + 1,
    );
    this.raycaster.setFromCamera(this.pointer, this.camera);
    const hits = this.raycaster.intersectObjects(
      this.tiles.map((t) => t.top),
      false,
    );
    const first = hits[0];
    return first ? (first.object.userData.index as number) : null;
  }

  setReducedMotion(reduced: boolean) {
    this.options.reducedMotion = reduced;
  }

  resize() {
    const canvas = this.renderer.domElement;
    const width = canvas.clientWidth || 1;
    const height = canvas.clientHeight || 1;
    this.renderer.setSize(width, height, false);
    this.camera.aspect = width / height;

    // Frame to whichever axis is tighter.
    //
    // The two axes need different margins. Horizontally the board is its own
    // width plus a little air. Vertically it is foreshortened by the camera
    // tilt, but the near edge grows under perspective, so it needs more. Using
    // one radius for both — the obvious version — either clips the near corners
    // or leaves the board sitting small in the middle of a phone screen.
    const halfFov = (this.camera.fov * Math.PI) / 360;
    //
    // The horizontal margin cannot go much below this. The camera leans
    // towards the token (see `cameraPlacement`), so on a portrait phone the
    // board is already off-centre before perspective widens its near edge —
    // measured at 1.08 the west side of the track was cut off entirely.
    const fitHorizontal =
      (HALF_SPAN * 1.17) / (Math.tan(halfFov) * Math.min(1, this.camera.aspect));
    const fitVertical = (HALF_SPAN * 1.12) / Math.tan(halfFov);
    this.cameraDistance = THREE.MathUtils.clamp(Math.max(fitVertical, fitHorizontal), 12, 34);
    this.camera.updateProjectionMatrix();
  }

  dispose() {
    this.disposed = true;
    this.renderer.setAnimationLoop(null);
    this.delays.length = 0;
    this.timer.disconnect();
    this.scene.traverse((object) => {
      if (object instanceof THREE.Mesh) {
        object.geometry.dispose();
        const material = object.material;
        const materials = Array.isArray(material) ? material : [material];
        for (const entry of materials) {
          if ('map' in entry && entry.map) (entry.map as THREE.Texture).dispose();
          entry.dispose();
        }
      }
    });
    this.renderer.dispose();
  }

  /* --- animation ---------------------------------------------------- */

  private focusFor(index: number): THREE.Vector3 {
    const anchor = tokenAnchor(index);
    // Look at a point between the token and the city centre: close enough that
    // the tile the player is on is readable, wide enough that they can still
    // see where they are on the board.
    return new THREE.Vector3(anchor.x * 0.58, 0, anchor.z * 0.58);
  }

  private beginHop() {
    const next = this.hopQueue.shift();
    if (next === undefined) {
      this.hopping = false;
      this.land();
      return;
    }
    const from = tokenAnchor(this.tokenIndex);
    const to = tokenAnchor(next);
    this.hopFrom.set(from.x, TILE_HEIGHT, from.z);
    this.hopTo.set(to.x, TILE_HEIGHT, to.z);
    this.tokenIndex = next;
    this.hopTime = 0;
    this.hopping = true;
    this.focusTarget.copy(this.focusFor(next));
  }

  private placeDiceAtRest() {
    this.dice.forEach((die, i) => {
      die.visible = true;
      die.position.set(i === 0 ? -DICE_SPREAD : DICE_SPREAD, DICE_SIZE / 2 + 0.06, DICE_REST_Z);
      die.rotation.copy(faceUpRotation(this.diceTarget[i] ?? 1));
    });
  }

  private tick() {
    if (this.disposed) return;
    this.timer.update();
    const dt = Math.min(this.timer.getDelta(), 0.05);
    const elapsed = this.timer.getElapsed();

    this.tickDelays(dt);
    this.animateToken(dt, elapsed);
    this.animateDice(dt);
    this.animateTiles(dt);
    this.animateBuildings(dt);
    this.animatePulses(dt);
    this.animateCamera(dt);

    const core = this.scene.getObjectByName('core');
    const halo = this.scene.getObjectByName('halo');
    if (!this.options.reducedMotion) {
      if (core) {
        // A sway rather than a spin: the shield is flat, and a full rotation
        // takes it edge-on twice a lap, which reads as the emblem blinking out.
        core.rotation.y = Math.sin(elapsed * 0.5) * 0.42;
        core.position.y = 1.15 + Math.sin(elapsed * 1.1) * 0.07;
      }
      if (halo) halo.rotation.z += dt * 0.15;
    }

    this.renderer.render(this.scene, this.camera);
  }

  private animateToken(dt: number, elapsed: number) {
    if (this.hopping) {
      // A hop per tile at a pace that stays legible for a 12-space roll: fast
      // enough not to be waiting, slow enough to count the tiles being passed.
      this.hopTime += dt / HOP;
      const t = Math.min(1, this.hopTime);
      const eased = t * t * (3 - 2 * t);

      this.token.position.lerpVectors(this.hopFrom, this.hopTo, eased);
      const arc = Math.sin(t * Math.PI);
      this.token.position.y = TILE_HEIGHT + arc * 0.55;

      // Squash on take-off and landing, stretch at the top of the arc.
      const stretch = 1 + arc * 0.18 - (t < 0.12 || t > 0.88 ? 0.16 : 0);
      this.token.scale.set(2 - stretch, stretch, 2 - stretch);

      if (t >= 1) {
        this.token.scale.set(1, 1, 1);
        this.beginHop();
      }
    } else if (!this.options.reducedMotion) {
      this.token.position.y = TILE_HEIGHT + Math.sin(elapsed * 2.2) * 0.035;
      this.token.rotation.y += dt * 0.6;
    }

    this.tokenShadow.position.set(
      this.token.position.x,
      TILE_HEIGHT + 0.014,
      this.token.position.z,
    );
    const lift = THREE.MathUtils.clamp(this.token.position.y - TILE_HEIGHT, 0, 0.6);
    const shrink = 1 - lift * 0.9;
    this.tokenShadow.scale.setScalar(Math.max(0.35, shrink));
    (this.tokenShadow.material as THREE.MeshBasicMaterial).opacity = 0.32 * Math.max(0.3, shrink);
  }

  private animateDice(dt: number) {
    if (!this.diceThrowing) return;
    this.diceTime += dt;
    const duration = DICE_THROW;
    const t = Math.min(1, this.diceTime / duration);

    this.dice.forEach((die, i) => {
      const targetX = i === 0 ? -DICE_SPREAD : DICE_SPREAD;
      const targetZ = DICE_REST_Z;
      const startY = 4.6;
      const restY = DICE_SIZE / 2 + 0.06;

      die.position.x = THREE.MathUtils.lerp(die.position.x, targetX, 0.12);
      die.position.z = THREE.MathUtils.lerp(die.position.z, targetZ, 0.12);

      // Fall, then one decaying bounce. Real physics for two dice is a lot of
      // machinery for something the player looks at for under a second.
      const fall = t < 0.62 ? t / 0.62 : 1;
      const bounce = t < 0.62 ? 0 : Math.abs(Math.sin((t - 0.62) * 9)) * (1 - t) * 0.9;
      die.position.y = THREE.MathUtils.lerp(startY, restY, fall * fall) + bounce;

      if (t < 0.78) {
        die.rotation.x += dt * 14;
        die.rotation.y += dt * 11;
        die.rotation.z += dt * 9;
      } else {
        const target = faceUpRotation(this.diceTarget[i] ?? 1);
        die.rotation.x = THREE.MathUtils.lerp(die.rotation.x, target.x, 0.3);
        die.rotation.y = THREE.MathUtils.lerp(die.rotation.y, target.y, 0.3);
        die.rotation.z = THREE.MathUtils.lerp(die.rotation.z, target.z, 0.3);
      }
    });

    if (t >= 1) {
      this.diceThrowing = false;
      this.dice.forEach((die, i) => die.rotation.copy(faceUpRotation(this.diceTarget[i] ?? 1)));
      this.options.onDiceSettled?.();
    }
  }

  private animateTiles(dt: number) {
    for (const tile of this.tiles) {
      tile.group.position.y = THREE.MathUtils.lerp(tile.group.position.y, tile.baseY, dt * 9);

      // The squash a tile takes when the piece lands on it. Decays on its own,
      // so nothing has to remember to clear it.
      if (tile.squash > 0) {
        tile.squash = Math.max(0, tile.squash - dt * 3.2);
        const wobble = Math.sin(tile.squash * Math.PI * 3) * tile.squash * 0.18;
        tile.group.scale.set(1 + wobble * 0.6, 1 - wobble, 1 + wobble * 0.6);
      } else if (tile.group.scale.y !== 1) {
        tile.group.scale.set(1, 1, 1);
      }
    }
  }

  /** Works rising out of the plaza, with an overshoot at the top. */
  private animateBuildings(dt: number) {
    for (let i = this.growing.length - 1; i >= 0; i -= 1) {
      const entry = this.growing[i]!;
      entry.t = Math.min(1, entry.t + dt * 1.7);
      const t = entry.t;
      // Ease out with a single overshoot, clamped so it never dips below zero
      // mid-rise — a building that flickers under the plaza looks like a bug.
      const eased = 1 + 2.2 * Math.pow(t - 1, 3) + 1.2 * Math.pow(t - 1, 2);
      entry.group.scale.set(1, Math.max(0.001, eased), 1);
      if (t >= 1) {
        entry.group.scale.set(1, 1, 1);
        this.growing.splice(i, 1);
      }
    }
  }

  private animatePulses(dt: number) {
    for (let i = this.pulses.length - 1; i >= 0; i -= 1) {
      const pulse = this.pulses[i]!;
      pulse.life += dt;
      const t = pulse.life / 0.9;
      pulse.mesh.scale.setScalar(1 + t * 3.4);
      (pulse.mesh.material as THREE.MeshBasicMaterial).opacity = Math.max(0, 0.9 * (1 - t));
      if (t >= 1) {
        this.scene.remove(pulse.mesh);
        pulse.mesh.geometry.dispose();
        (pulse.mesh.material as THREE.Material).dispose();
        this.pulses.splice(i, 1);
      }
    }
  }

  private animateCamera(dt: number) {
    const ease = this.options.reducedMotion ? 1 : Math.min(1, dt * 3.4);
    this.focus.lerp(this.focusTarget, ease);

    // A gentle push-in while the token is mid-hop, so movement has weight.
    const push = this.hopping ? 0.92 : 1;
    const placement = cameraPlacement(this.cameraDistance * push, this.view, this.focus);
    this.camera.position.set(placement.x, placement.y, placement.z);

    if (this.shake > 0) {
      this.shake = Math.max(0, this.shake - dt * 2.2);
      const magnitude = this.shake * this.shake * 0.32;
      this.camera.position.x += (Math.random() - 0.5) * magnitude;
      this.camera.position.y += (Math.random() - 0.5) * magnitude;
    }

    this.camera.lookAt(this.focus.x * 0.2, 0, this.focus.z * 0.2);
  }
}
