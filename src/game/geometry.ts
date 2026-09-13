import { TRACK_LENGTH } from './board.ts';

/**
 * Board geometry — one source of truth for where a space sits.
 *
 * The 3D renderer and the accessible DOM layer must agree on tile positions to
 * the pixel, because the DOM layer's focusable buttons are positioned by
 * projecting these same coordinates. Deriving them twice is how a focus ring
 * ends up half a tile away from the tile it belongs to.
 *
 * Axes: X right, Z towards the viewer, Y up. The board lies in the XZ plane and
 * the camera looks down the +Z axis, so a tile's "outward" direction is away
 * from the origin.
 */

/** Along-track width of a side tile, in board units. */
export const TILE_SIZE = 1;
/** Corner tiles are square and larger, as on a physical board. */
export const CORNER_SIZE = 1.6;
/** Radial depth of a side tile. */
export const TILE_DEPTH = 1.15;
/** Tiles per side, excluding the two corners they sit between. */
export const SIDE_TILES = (TRACK_LENGTH - 4) / 4;

/** Distance from board centre to the outer edge of the track. */
export const HALF_SPAN = (SIDE_TILES * TILE_SIZE) / 2 + CORNER_SIZE;

export interface SpaceLayout {
  index: number;
  /** Centre of the tile in board units. */
  x: number;
  z: number;
  /** Footprint. */
  width: number;
  depth: number;
  /** Y rotation in radians, so a tile's face reads from the board's centre. */
  rotation: number;
  /** 0 = south edge, 1 = west, 2 = north, 3 = east. */
  side: 0 | 1 | 2 | 3;
  corner: boolean;
}

/**
 * Walk the ring once and record every tile.
 *
 * Tiles are flush on the OUTER edge, which is why side tiles and corner tiles
 * have different centre offsets: `HALF_SPAN` is the outer edge for both, and
 * each tile's centre sits half its own depth inside it.
 */
function buildLayout(): SpaceLayout[] {
  const out: SpaceLayout[] = [];
  const cornerCentre = HALF_SPAN - CORNER_SIZE / 2;
  const sideCentre = HALF_SPAN - TILE_DEPTH / 2;

  // Corner positions in walk order: SE, SW, NW, NE.
  const corners: [number, number][] = [
    [cornerCentre, cornerCentre],
    [-cornerCentre, cornerCentre],
    [-cornerCentre, -cornerCentre],
    [cornerCentre, -cornerCentre],
  ];

  // For each side: the axis the tiles run along, and their fixed coordinate.
  // Sides are walked anticlockwise when viewed from above, which reads as
  // left-to-right along the bottom edge on screen.
  const sides = [
    { axis: 'x' as const, dir: -1, fixed: sideCentre, rotation: 0 }, // south, running west
    { axis: 'z' as const, dir: -1, fixed: -sideCentre, rotation: Math.PI / 2 }, // west, running north
    { axis: 'x' as const, dir: 1, fixed: -sideCentre, rotation: Math.PI }, // north, running east
    { axis: 'z' as const, dir: 1, fixed: sideCentre, rotation: -Math.PI / 2 }, // east, running south
  ];

  const runStart = (SIDE_TILES * TILE_SIZE) / 2 - TILE_SIZE / 2;

  for (let s = 0; s < 4; s += 1) {
    const side = sides[s]!;
    const corner = corners[s]!;
    out.push({
      index: out.length,
      x: corner[0],
      z: corner[1],
      width: CORNER_SIZE,
      depth: CORNER_SIZE,
      rotation: side.rotation,
      side: s as 0 | 1 | 2 | 3,
      corner: true,
    });

    for (let i = 0; i < SIDE_TILES; i += 1) {
      const along = (runStart - i * TILE_SIZE) * side.dir;
      out.push({
        index: out.length,
        x: side.axis === 'x' ? along : side.fixed,
        z: side.axis === 'x' ? side.fixed : along,
        width: TILE_SIZE,
        depth: TILE_DEPTH,
        rotation: side.rotation,
        side: s as 0 | 1 | 2 | 3,
        corner: false,
      });
    }
  }
  return out;
}

export const LAYOUT: SpaceLayout[] = buildLayout();

export const layoutAt = (index: number): SpaceLayout =>
  LAYOUT[((index % TRACK_LENGTH) + TRACK_LENGTH) % TRACK_LENGTH]!;

/**
 * Where a player token stands on a space. Tokens sit slightly inside the tile
 * so the tile's label stays readable underneath them.
 */
export function tokenAnchor(index: number): { x: number; z: number } {
  const tile = layoutAt(index);
  const inward = 0.2;
  const toCentre = Math.hypot(tile.x, tile.z) || 1;
  return {
    x: tile.x - (tile.x / toCentre) * inward,
    z: tile.z - (tile.z / toCentre) * inward,
  };
}

/** Cells along one edge of the flat fallback board, corners included. */
export const FALLBACK_EDGE = SIDE_TILES + 2;

/**
 * Position of a space on the flat fallback board, as a 1-indexed CSS grid cell.
 *
 * The fallback is the same ring without perspective: an 8×8 grid whose outer
 * ring is exactly 28 cells. Walk order matches the 3D track — anticlockwise
 * from the bottom-right corner — so a player who switches renderers mid-session
 * sees their token in the same place.
 */
export function fallbackCell(index: number): { col: number; row: number } {
  const edge = FALLBACK_EDGE;
  const i = ((index % TRACK_LENGTH) + TRACK_LENGTH) % TRACK_LENGTH;
  const side = Math.floor(i / (SIDE_TILES + 1));
  const along = i % (SIDE_TILES + 1);
  switch (side) {
    case 0: // bottom edge, running right to left
      return { col: edge - along, row: edge };
    case 1: // left edge, running bottom to top
      return { col: 1, row: edge - along };
    case 2: // top edge, running left to right
      return { col: 1 + along, row: 1 };
    default: // right edge, running top to bottom
      return { col: edge, row: 1 + along };
  }
}

/* ------------------------------------------------------------------ */
/* Camera placement                                                    */
/* ------------------------------------------------------------------ */

/**
 * How far the player may move the view, and where it rests.
 *
 * The scripted shot was `(0, d * 0.86, d * 0.5)` above the look-at point: a
 * steep look-down, because a shallow angle wastes most of a portrait phone on
 * empty sky and squashes the far side of the board into an unreadable strip.
 * Written as an angle and a radius it can be orbited without changing where it
 * starts, which is what `BASE_PITCH` and `BASE_RADIUS` are for.
 *
 * Pitch stops at ~22 degrees rather than at the horizon: edge-on, a tile's
 * painted face — where every space's name lives — becomes unreadable, and a
 * control meant to let a player see the board better would be able to make it
 * useless. The top stop is short of overhead so the board keeps its depth.
 */
export const BASE_PITCH = Math.atan2(0.86, 0.5);
export const BASE_RADIUS = Math.hypot(0.86, 0.5);
export const PITCH_MIN = 0.38;
export const PITCH_MAX = 1.45;
export const ZOOM_MIN = 0.5;
export const ZOOM_MAX = 1.85;

const clamp = (value: number, low: number, high: number) => Math.min(high, Math.max(low, value));

export interface CameraView {
  /** Rotation around the board, in radians. */
  yaw: number;
  /** Added to `BASE_PITCH`, then clamped. */
  pitchOffset: number;
  /** Multiplies the fitted distance. Below 1 is closer. */
  zoom: number;
}

export const RESTING_VIEW: CameraView = { yaw: 0, pitchOffset: 0, zoom: 1 };

/**
 * Where the camera goes, given the fitted distance and the player's view.
 *
 * Pure arithmetic with no Three.js in it, so the framing can be tested rather
 * than eyeballed — including the part that matters most, which is that a
 * resting view still produces the exact shot the board shipped with.
 *
 * `focus` is the point the follow-cam is drifting towards; the camera leans
 * towards it rather than centring on it, because a full follow-cam on a
 * 28-space board loses the rest of the track.
 */
export function cameraPlacement(
  distance: number,
  view: CameraView,
  focus: { x: number; z: number },
): { x: number; y: number; z: number } {
  const pitch = clamp(BASE_PITCH + view.pitchOffset, PITCH_MIN, PITCH_MAX);

  /*
   * Back off as the view tilts down towards the board.
   *
   * `distance` is fitted for the resting pitch. Hold the radius constant and
   * tilt low, and the near edge of the board swings towards the lens and out of
   * frame — measured at a square viewport, the corners sat 15% outside it at
   * the lowest tilt. The exponent is the smallest one that keeps every corner
   * inside the frustum across the whole pitch range at portrait, square and
   * landscape (the sweep is in the camera test); 1 would be a full correction
   * and would shrink the board into the middle of the screen instead.
   *
   * It is exactly 1 at `BASE_PITCH`, so the resting shot is untouched.
   */
  const tilt = (Math.sin(BASE_PITCH) / Math.sin(pitch)) ** 0.3;
  const radius = distance * clamp(view.zoom, ZOOM_MIN, ZOOM_MAX) * BASE_RADIUS * tilt;
  const flat = Math.cos(pitch) * radius;
  return {
    x: focus.x * 0.16 + flat * Math.sin(view.yaw),
    y: Math.sin(pitch) * radius,
    z: focus.z * 0.16 + flat * Math.cos(view.yaw),
  };
}

/** Apply a drag, in screen pixels, to a view. */
export function orbitView(view: CameraView, dx: number, dy: number): CameraView {
  return {
    // Dragging right turns the board right, which means turning the CAMERA the
    // other way. The sign here is the difference between "grabbing the table"
    // and "pushing the camera", and the table is what a player expects.
    yaw: view.yaw - dx * 0.006,
    pitchOffset: clamp(
      view.pitchOffset + dy * 0.005,
      PITCH_MIN - BASE_PITCH,
      PITCH_MAX - BASE_PITCH,
    ),
    zoom: view.zoom,
  };
}

/**
 * Apply a wheel notch or a pinch to a view.
 *
 * Multiplicative, so one notch covers the same proportion of the range whether
 * the camera is close in or pulled right back. Linear zoom crawls when near and
 * lurches when far.
 */
export function zoomView(view: CameraView, steps: number): CameraView {
  return { ...view, zoom: clamp(view.zoom * Math.exp(steps * 0.0016), ZOOM_MIN, ZOOM_MAX) };
}
