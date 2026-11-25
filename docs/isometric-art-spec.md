# ShieldQuest isometric art specification (Habbo-inspired, original)

The standard every outdoor and indoor asset follows from the vertical slice onwards. Reference:
`scripts/habbo-slice.html` (the precinct and Sunshine Minimart), screenshots in `docs/habbo-slice/`.
Inspired by the clarity of Habbo-style rooms; no Habbo assets, sprites, branding or UI are copied.

## Projection and scale

| Item | Value |
|---|---|
| Projection | 2:1 dimetric ("pixel isometric"), `src/game/isometric.ts` — unchanged, so map coordinates and saves still line up |
| Tile | 64 × 32 px diamond. **1 tile ≈ 1 m** in the slice (the geographic estate used 5 m/tile, which made the player 0.42× scale and tiny) |
| Character | 80 × 80 px cell, feet on row 72, figure ≈ 58–62 px tall, always drawn at 1× (no 0.42 shrink) |
| Doors | 62–66 px high, ≈ 1 tile wide — just taller than an avatar |
| Furniture | benches 15 px seat, counters 28 px, shelves 40 px, fridges 56 px |
| Storeys | void deck 84 px (taller than an avatar so you can walk under it), upper storeys 56 px. Height is compressed: slice blocks show 3 storeys + roof; full-height blocks get cut away rather than drawn 12 storeys tall |
| Street furniture | lamp 92 px, traffic light 88 px, bus shelter roof 78–84 px, trees 34–44 px trunk + canopy |
| Camera | **whole-number zoom only** (1×, 2×, 3×). 1280×800 → 2×, 1920×1080 → 3×, phones → 1×. No 1.45 / 1.93 zooms: they made pixels uneven |

## Pixel rules

- Rendered with hard edges: `src/game/pixelIso.ts` rasterises every face onto a 1:1 pixel grid (pixel-centre sampling, no anti-aliasing), textures use nearest filtering.
- **Outline**: every sprite gets a one-pixel silhouette line at 34 % of the underlying colour, nudged towards blue-black. Faces that meet inside a sprite get a softer seam at 80 %. This is what makes everything look like it belongs to the same game; do not hand-draw extra outlines.
- **Lighting**: one light from the upper left. `tones(base)` gives `[top ×1.14, left (y-facing) face = base, right (x-facing) face ×0.76]`. Use it, or a hand-picked triple in that order.
- **Shadows**: soft ground shadows only (`shadow()` / alpha blobs, 14–22 % navy), no drop shadows on walls.
- **Palette**: warm cream walls `#f2e8d0`, HDB teal accent `#3e9b8f`, terracotta `#d77a54`, pavement `#d9d0be`/`#d3c9b6` checker, grass `#7fbd5b`, asphalt `#59606a`, road yellow `#f0c23b`. Saturated accents for signage and products, never noise textures.
- **Floors** are flat two-tone checkers (Habbo-like), with real raised edges (kerbs 3–4 px, planting beds 4 px, the estate slab 16 px).
- Text on surfaces uses the shared 3×5 pixel font (`src/game/glyphs.ts`) painted onto faces.

## Building an asset

```ts
import { Painter } from './pixelIso'          // pure: faces, tones, rasterise (unit-tested)
import { bake, bakeGraphics } from './pixelBake'  // Phaser: bake once per key, place by world position

bake(scene, 'pc-bench', g => g.box(x, y, 1.4, .45, 3, '#e0a865', 12), depth)
// Existing worldArt drawing code (box/floor/front/side) bakes through the same pipeline:
bakeGraphics(scene, 'mm-3', g => box(g, x, y, w, d, 28, colours), depth)
```

`Painter` primitives: `box`, `floor`, `front` (y-facing wall), `side` (x-facing wall), `poly`, `blob` (screen ellipse for canopies, fruit), `dot` (screen pixel rect), `letters`, `shadow`. All take tile coordinates and pixel heights, so collision footprints and art share one coordinate system.

PixelLab art must match: `outline: single color outline`, `shading: medium shading`, `view: high top-down`, canvas sized so a 1 m object is 64 px wide, then dropped in at 1× with nearest filtering.

## Footprints, collision and anchors

- Each object has a ground **footprint** (tiles). Collision is the footprint of what touches the ground: walls, pillars, trunks, posts, counters. Canopies, roofs, awnings and upper floors never collide.
- Sprites are placed by world position (the baker records each texture's offset), so there is no per-sprite anchor tuning.
- Layout data lives in a pure module (`precinctLayout.ts`, `minimartLayout.ts`) so tests can check it without Phaser.

## Depth sorting and occlusion

- Characters sort by their feet: `depthAt(x, y)`.
- Solid objects sort by `depthAt(x, y + min(w, d))` (`buildingDepth`): anything in front of either visible face draws over them; anything behind draws beneath. Long props are split into ≤1-tile pieces where people can stand alongside them.
- Overhangs (void decks): `registerOverhang()` in `hdbBlock.ts` puts every person, pillar and prop under the slab into a depth band just beneath the upper floors, so an NPC under the block can never draw over its façade.
- Roofs people walk under (linkways, bus shelters, awnings) draw above the people beneath and fade to 40 % while the player is under or just behind them.
- **Façade cutaway**: entering or approaching a void deck swaps the upper floors for a cut first-storey slab (upper floors at 14 %), so the player and the lift lobby stay visible.

## Interiors

Habbo-style rooms: one floor slab with two back walls, fixtures baked through `bakeGraphics`, every fixture with a collision footprint and its interaction hotspot in front of it. The Minimart keeps all its Lookout Dilemma hotspots and clue positions.
