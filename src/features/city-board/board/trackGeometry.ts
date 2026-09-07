export interface GridTilePos {
  index: number;
  col: number; // 1 to 5 (CSS grid column)
  row: number; // 1 to 5 (CSS grid row)
  isCorner: boolean;
  side: 0 | 1 | 2 | 3;
}

/**
 * 16 Perimeter Tiles around a 5x5 CSS Grid.
 *
 * When rotated with `transform: rotateX(60deg) rotateZ(-45deg)`:
 * - Tile 0 (col 1, row 5): SOUTH (bottom-most corner, facing player) -> Start / Shield Central (GO)
 * - Tiles 1-3: West run along col 1 (rows 4, 3, 2)
 * - Tile 4 (col 1, row 1): WEST (left-most corner) -> Scam Watch / Detention
 * - Tiles 5-7: North run along row 1 (cols 2, 3, 4)
 * - Tile 8 (col 5, row 1): NORTH (top-most corner) -> Safe Haven / Sanctuary
 * - Tiles 9-11: East run along col 5 (rows 2, 3, 4)
 * - Tile 12 (col 5, row 5): EAST (right-most corner) -> Phishing Trap / Quarantine
 * - Tiles 13-15: South run along row 5 (cols 4, 3, 2)
 *
 * The middle 3x3 tiles (cols 2-4, rows 2-4) remain completely empty for the central District Landmark!
 */
export const GRID_16_POSITIONS: GridTilePos[] = [
  // Side 0 (South -> West): Col 1, moving up from row 5 to row 1
  { index: 0, col: 1, row: 5, isCorner: true, side: 0 },
  { index: 1, col: 1, row: 4, isCorner: false, side: 0 },
  { index: 2, col: 1, row: 3, isCorner: false, side: 0 },
  { index: 3, col: 1, row: 2, isCorner: false, side: 0 },

  // Side 1 (West -> North): Row 1, moving right from col 1 to col 5
  { index: 4, col: 1, row: 1, isCorner: true, side: 1 },
  { index: 5, col: 2, row: 1, isCorner: false, side: 1 },
  { index: 6, col: 3, row: 1, isCorner: false, side: 1 },
  { index: 7, col: 4, row: 1, isCorner: false, side: 1 },

  // Side 2 (North -> East): Col 5, moving down from row 1 to row 5
  { index: 8, col: 5, row: 1, isCorner: true, side: 2 },
  { index: 9, col: 5, row: 2, isCorner: false, side: 2 },
  { index: 10, col: 5, row: 3, isCorner: false, side: 2 },
  { index: 11, col: 5, row: 4, isCorner: false, side: 2 },

  // Side 3 (East -> South): Row 5, moving left from col 5 to col 1
  { index: 12, col: 5, row: 5, isCorner: true, side: 3 },
  { index: 13, col: 4, row: 5, isCorner: false, side: 3 },
  { index: 14, col: 3, row: 5, isCorner: false, side: 3 },
  { index: 15, col: 2, row: 5, isCorner: false, side: 3 },
];

export function getGridTilePos(index: number): GridTilePos {
  const norm = ((index % 16) + 16) % 16;
  return GRID_16_POSITIONS[norm]!;
}

// Backward compatibility alias for any references
export const getIsometricTileCoord = getGridTilePos;
export type IsometricTileCoord = GridTilePos;
