import * as THREE from 'three';

import { DISTRICTS, TRACK } from '../game/board.ts';
import { HALF_SPAN, layoutAt, tokenAnchor } from '../game/geometry.ts';
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

const TILE_HEIGHT = 0.28;
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
function makeLabelTexture(space: BoardSpace, corner: boolean, rotation: number): THREE.CanvasTexture {
  const w = 300;
  const h = 300;
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = '#f4f7fb';
  ctx.fillRect(0, 0, w, h);

  // No district stripe is drawn here: the stripe is a separate mesh on the
  // tile's inner edge, which stays put when this texture is counter-rotated
  // below. Baking it into the texture would send it wandering round the tile.
  ctx.fillStyle = 'rgba(6,21,39,0.5)';
  ctx.font = `600 ${corner ? 34 : 32}px system-ui, sans-serif`;
  ctx.textAlign = 'center';
  ctx.fillText(KIND_GLYPH[space.kind], w / 2, 96);

  ctx.fillStyle = '#0b2545';
  ctx.font = `700 ${corner ? 30 : 26}px system-ui, sans-serif`;
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
  const startY = 168 - (kept.length - 1) * 8;
  kept.forEach((text, i) => {
    ctx.fillText(text, w / 2, startY + i * 33);
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
/* Scene                                                               */
/* ------------------------------------------------------------------ */

export class BoardScene {
  private renderer: THREE.WebGLRenderer;
  private scene = new THREE.Scene();
  private camera: THREE.PerspectiveCamera;
  private raycaster = new THREE.Raycaster();
  private pointer = new THREE.Vector2();
  private clock = new THREE.Clock();

  private tiles: TileHandle[] = [];
  private token = new THREE.Group();
  private tokenShadow: THREE.Mesh;
  private dice: THREE.Mesh[] = [];
  private buildings = new Map<DistrictId, THREE.Group>();
  private pulses: { mesh: THREE.Mesh; life: number }[] = [];

  private options: BoardSceneOptions;
  private disposed = false;

  /* camera framing */
  private focus = new THREE.Vector3(0, 0, 0);
  private focusTarget = new THREE.Vector3(0, 0, 0);
  private cameraDistance = 15;
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
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.05;

    this.scene.fog = new THREE.FogExp2(0x061527, 0.022);
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
    this.scene.add(new THREE.HemisphereLight(0xcfe4ff, 0x0a1a2e, 1.25));

    const key = new THREE.DirectionalLight(0xffffff, 1.6);
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
    const rim = new THREE.PointLight(0xffc879, 26, 22, 2);
    rim.position.set(0, 2.6, 0);
    this.scene.add(rim);
  }

  private buildBoard() {
    const span = HALF_SPAN * 2 + 0.6;

    const slab = new THREE.Mesh(
      new THREE.BoxGeometry(span, BOARD_DROP, span),
      new THREE.MeshStandardMaterial({ color: 0x0a1d33, roughness: 0.9, metalness: 0.05 }),
    );
    slab.position.y = -BOARD_DROP / 2;
    slab.receiveShadow = true;
    this.scene.add(slab);

    const inner = new THREE.Mesh(
      new THREE.BoxGeometry(span - 2.6, 0.08, span - 2.6),
      new THREE.MeshStandardMaterial({ color: 0x0d2743, roughness: 0.75, metalness: 0.12 }),
    );
    inner.position.y = 0.02;
    inner.receiveShadow = true;
    this.scene.add(inner);

    // The city core: a slowly turning shield at the centre of the board. It is
    // pure atmosphere and carries no state, so it is safe for it to be the one
    // thing on screen that moves when nothing is happening.
    const core = new THREE.Mesh(
      new THREE.IcosahedronGeometry(0.9, 0),
      new THREE.MeshStandardMaterial({
        color: 0x1a66bc,
        roughness: 0.25,
        metalness: 0.4,
        emissive: 0x0d3f7a,
        emissiveIntensity: 0.6,
      }),
    );
    core.position.y = 1.1;
    core.castShadow = true;
    core.name = 'core';
    this.scene.add(core);

    const halo = new THREE.Mesh(
      new THREE.TorusGeometry(1.5, 0.045, 8, 64),
      new THREE.MeshBasicMaterial({ color: 0x5fa0e8, transparent: true, opacity: 0.5 }),
    );
    halo.rotation.x = Math.PI / 2;
    halo.position.y = 0.35;
    halo.name = 'halo';
    this.scene.add(halo);
  }

  private buildTiles() {
    for (const space of TRACK) {
      const layout = layoutAt(space.index);
      const group = new THREE.Group();
      group.position.set(layout.x, 0, layout.z);
      group.rotation.y = layout.rotation;

      const body = new THREE.Mesh(
        new THREE.BoxGeometry(layout.width * 0.94, TILE_HEIGHT, layout.depth * 0.94),
        new THREE.MeshStandardMaterial({
          map: makeLabelTexture(space, Boolean(layout.corner), layout.rotation),
          roughness: 0.62,
          metalness: 0.05,
        }),
      );
      body.position.y = TILE_HEIGHT / 2;
      body.castShadow = true;
      body.receiveShadow = true;
      body.userData.index = space.index;
      group.add(body);

      // A colour band on the tile's inner edge, so district identity is legible
      // from the low camera angle where the face is foreshortened.
      const band = new THREE.Mesh(
        new THREE.BoxGeometry(layout.width * 0.94, TILE_HEIGHT * 1.25, 0.09),
        new THREE.MeshStandardMaterial({
          color: new THREE.Color(DISTRICTS[space.districtId].colour),
          roughness: 0.45,
          emissive: new THREE.Color(DISTRICTS[space.districtId].colour),
          emissiveIntensity: 0.25,
        }),
      );
      band.position.set(0, TILE_HEIGHT * 0.62, -layout.depth * 0.47);
      band.castShadow = true;
      group.add(band);

      this.scene.add(group);
      this.tiles.push({ index: space.index, group, top: body, band, baseY: 0 });
    }
  }

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

    this.token.add(body, crest);
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
      const die = new THREE.Mesh(new THREE.BoxGeometry(0.46, 0.46, 0.46), materials);
      die.castShadow = true;
      die.visible = false;
      this.scene.add(die);
      this.dice.push(die);
    }
  }

  /* --- public API --------------------------------------------------- */

  setTokenIndex(index: number, instant = false) {
    this.tokenIndex = index;
    const anchor = tokenAnchor(index);
    if (instant) {
      this.token.position.set(anchor.x, TILE_HEIGHT, anchor.z);
      this.focus.copy(this.focusFor(index));
    }
    this.focusTarget.copy(this.focusFor(index));
  }

  /** Hop the token through every space in `path`, one tile at a time. */
  moveToken(path: number[]) {
    if (path.length === 0) {
      this.options.onTokenArrived?.();
      return;
    }
    if (this.options.reducedMotion) {
      this.setTokenIndex(path[path.length - 1]!, true);
      this.options.onTokenArrived?.();
      return;
    }
    this.hopQueue = [...path];
    this.beginHop();
  }

  /** Throw the dice and settle them showing `a` and `b`. */
  throwDice(a: number, b: number) {
    this.diceTarget = [a, b];
    if (this.options.reducedMotion) {
      this.placeDiceAtRest();
      this.options.onDiceSettled?.();
      return;
    }
    this.diceTime = 0;
    this.diceThrowing = true;
    this.dice.forEach((die, i) => {
      die.visible = true;
      die.position.set(this.token.position.x + (i === 0 ? -0.8 : 0.8), 3.4, this.token.position.z + 1.4);
      die.rotation.set(Math.random() * 6, Math.random() * 6, Math.random() * 6);
    });
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
  setUpgrades(districtId: DistrictId, count: number) {
    let group = this.buildings.get(districtId);
    if (!group) {
      group = new THREE.Group();
      this.scene.add(group);
      this.buildings.set(districtId, group);
    }
    if (group.children.length === count) return;

    group.clear();
    const colour = new THREE.Color(DISTRICTS[districtId].colour);
    const sideSpaces = TRACK.filter((s) => s.districtId === districtId);

    for (let i = 0; i < count; i += 1) {
      const host = sideSpaces[i * 2 + 1] ?? sideSpaces[1]!;
      const layout = layoutAt(host.index);
      const height = 0.5 + i * 0.42;
      const mesh = new THREE.Mesh(
        new THREE.BoxGeometry(0.34, height, 0.34),
        new THREE.MeshStandardMaterial({
          color: colour,
          roughness: 0.5,
          metalness: 0.2,
          emissive: colour,
          emissiveIntensity: 0.18,
        }),
      );
      const toCentre = Math.hypot(layout.x, layout.z) || 1;
      mesh.position.set(
        layout.x - (layout.x / toCentre) * 1.05,
        height / 2 + 0.06,
        layout.z - (layout.z / toCentre) * 1.05,
      );
      mesh.castShadow = true;
      group.add(mesh);
    }
  }

  /** Dim the tiles the player has already resolved. */
  setResolved(indices: Set<number>) {
    for (const tile of this.tiles) {
      const done = indices.has(tile.index);
      // Resolved tiles desaturate rather than disappear: a space the player has
      // already played still has to be findable, and still has to be legible to
      // a facilitator pointing at it from across the room.
      tile.top.material.color.setHex(done ? 0x93a7bc : 0xffffff);
      tile.band.material.emissiveIntensity = done ? 0.05 : 0.25;
    }
  }

  /** Lift and glow the tile the player is standing on. */
  setCurrent(index: number) {
    for (const tile of this.tiles) {
      tile.baseY = tile.index === index ? 0.1 : 0;
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
    const fitHorizontal = (HALF_SPAN * 1.18) / (Math.tan(halfFov) * Math.min(1, this.camera.aspect));
    const fitVertical = (HALF_SPAN * 1.24) / Math.tan(halfFov);
    this.cameraDistance = THREE.MathUtils.clamp(Math.max(fitVertical, fitHorizontal), 12, 34);
    this.camera.updateProjectionMatrix();
  }

  dispose() {
    this.disposed = true;
    this.renderer.setAnimationLoop(null);
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
      this.options.onTokenArrived?.();
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
      const anchor = tokenAnchor(this.tokenIndex);
      die.position.set(anchor.x + (i === 0 ? -0.55 : 0.55), TILE_HEIGHT + 0.25, anchor.z + 0.9);
      die.rotation.copy(faceUpRotation(this.diceTarget[i] ?? 1));
    });
  }

  private tick() {
    if (this.disposed) return;
    const dt = Math.min(this.clock.getDelta(), 0.05);

    this.animateToken(dt);
    this.animateDice(dt);
    this.animateTiles(dt);
    this.animatePulses(dt);
    this.animateCamera(dt);

    const core = this.scene.getObjectByName('core');
    const halo = this.scene.getObjectByName('halo');
    if (!this.options.reducedMotion) {
      if (core) {
        core.rotation.y += dt * 0.4;
        core.position.y = 1.1 + Math.sin(this.clock.elapsedTime * 1.1) * 0.06;
      }
      if (halo) halo.rotation.z += dt * 0.15;
    }

    this.renderer.render(this.scene, this.camera);
  }

  private animateToken(dt: number) {
    if (this.hopping) {
      // A hop per tile at a pace that stays legible for a 12-space roll: fast
      // enough not to be waiting, slow enough to count the tiles being passed.
      this.hopTime += dt / 0.19;
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
      this.token.position.y = TILE_HEIGHT + Math.sin(this.clock.elapsedTime * 2.2) * 0.035;
      this.token.rotation.y += dt * 0.6;
    }

    this.tokenShadow.position.set(this.token.position.x, TILE_HEIGHT + 0.014, this.token.position.z);
    const lift = THREE.MathUtils.clamp(this.token.position.y - TILE_HEIGHT, 0, 0.6);
    const shrink = 1 - lift * 0.9;
    this.tokenShadow.scale.setScalar(Math.max(0.35, shrink));
    (this.tokenShadow.material as THREE.MeshBasicMaterial).opacity = 0.32 * Math.max(0.3, shrink);
  }

  private animateDice(dt: number) {
    if (!this.diceThrowing) return;
    this.diceTime += dt;
    const duration = 0.95;
    const t = Math.min(1, this.diceTime / duration);

    this.dice.forEach((die, i) => {
      const anchor = tokenAnchor(this.tokenIndex);
      const targetX = anchor.x + (i === 0 ? -0.55 : 0.55);
      const targetZ = anchor.z + 0.9;
      const startY = 3.4;
      const restY = TILE_HEIGHT + 0.25;

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
    const distance = this.cameraDistance * push;

    // The camera leans towards the token rather than centring on it. A full
    // follow-cam on a 28-space board loses the rest of the track, and a player
    // who cannot see where they are going has no reason to care what they roll.
    // A steeper look-down than a tabletop photograph. A shallow angle wastes
    // most of a portrait phone on empty sky and squashes the far side of the
    // board into an unreadable strip.
    this.camera.position.set(
      this.focus.x * 0.16,
      distance * 0.86,
      this.focus.z * 0.16 + distance * 0.5,
    );

    if (this.shake > 0) {
      this.shake = Math.max(0, this.shake - dt * 2.2);
      const magnitude = this.shake * this.shake * 0.32;
      this.camera.position.x += (Math.random() - 0.5) * magnitude;
      this.camera.position.y += (Math.random() - 0.5) * magnitude;
    }

    this.camera.lookAt(this.focus.x * 0.2, 0, this.focus.z * 0.2);
  }
}
