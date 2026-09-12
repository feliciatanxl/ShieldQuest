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
