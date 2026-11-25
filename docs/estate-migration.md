# Sunshine Estate migration to the Habbo-style pipeline

The main game (`/` → Start / Continue) now plays in the migrated estate. The Ang Mo Kio geography is still the
source of truth; everything the player sees is derived from it at load time and drawn with the approved vertical
slice's pipeline (`docs/isometric-art-spec.md`, `scripts/habbo-slice.html`).

## Architecture

```
neighbourhood.tmj (OSM-derived, 5 m cells)          ← unchanged; minimap, OSM tests, Unity export still read it
  └─ mapSource.loadMap        fictional names, estate dressing (pure)
       └─ estateLayout.buildEstate   gameplay coordinates ×2.5 (pure, ~0.3–0.45 s once, unit-tested)
            ├─ roads / footpaths      true polylines and widths; minor driveways end where a block stands
            ├─ ground classes          paving, grass, road, footpath per tile; open paving ≥3 tiles from anything becomes lawn
            ├─ buildings               footprints straightened to grid-aligned blocks (L/T/U shapes split into up to 3 wings),
            │                          trimmed/slid clear of main roads and neighbours, mission buildings placed first
            ├─ things                  trees, shrubs, lamps, bus shelters, furniture, playgrounds, linkway roofs
            ├─ collisions              ground-contact only (walls, pillars, trunks, posts)
            ├─ hotspots                mission doors, building entrances (same `building-<osmId>` ids), residents, noticeboard
            └─ routes                  residents' mapped walks, cut short where a wall now stands
       └─ estateWorld.createEstateWorld  (Phaser)
            ├─ ground: 16×16-tile chunks baked on approach, freed once off screen
            ├─ things: shared textures per kind/variant, placed per chunk
            └─ buildings: baked on approach (void decks as wall/stairs/pillars/upper floors/cut slab), freed off screen
```

| Concern | Where |
|---|---|
| Scale, save revision | `src/game/estateScale.ts` (`ESTATE_SCALE = 2.5`, `amk-central-v1@x2.5`) |
| Geography → gameplay layout | `src/game/estateLayout.ts` |
| Art (props, trees, buildings) | `src/game/estateArt.ts`, PixelLab sprites in `src/game/assets/pixellab/estate/` |
| Streaming renderer, cutaways, x-ray | `src/game/estateWorld.ts` |
| Depth: overhangs, blocks you can stand behind | `src/game/hdbBlock.ts` (`registerOverhang`, `registerBlocker`) |
| Scene and camera | `src/game/scenes/NeighbourhoodScene.ts` (whole-number zoom, wheel/± between levels) |
| Interiors | `worldArt.prop()` and room shells now bake through `pixelBake.ts` (outlined pixel sprites) |

### Why ×2.5 and not ×5

A literal 1 m/tile conversion would be 835 × 720 tiles (25× the source). At ×2.5 the world is 418 × 360 tiles
(6.2×): roads come out 4–8 tiles wide and HDB slabs about 6 tiles deep — the slice's proportions — while walking
distances compress to about 2 m per tile. Full-size characters (the 0.42 shrink is gone) give the slice's look.

### Save migration

Saves carry `mapRevision`. Saves on the source revision (`amk-central-v1`) have their outdoor position and building
return point multiplied by 2.5; current saves load as stored; anything older returns to the start. Nothing else in the
save (progress, SHIELD results, coins, wardrobe, escape room) is touched. A blocked position falls back to the
validated estate start outside Sunshine Minimart. Tested in `infra/multiplayer/test/estate.test.ts`.

## Results (1280×800 desktop and 390×844 mobile, Chrome, `scripts/capture-estate.cjs`, via main menu → Continue)

| Spot | Desktop FPS | Mobile FPS |
|---|---|---|
| Start (migrated save) | 57 | 56 |
| Sunshine Minimart door | 59 | 57 |
| Freeze Frame House | 58 | 56 |
| Whisper Network House | 57 | 55 |
| Mysterious House | 55 | 55 |
| Main avenue | 56 | 53 |
| Park | 55 | 53 |

JS heap after the run: about 220–236 MB. Interiors: 60 FPS. Before (old renderer, `docs/habbo-slice/before-*`): 52–58 FPS.

Screenshots: `docs/estate-migration/after-*.png` (main game) vs `docs/habbo-slice/before-*.png` (old main game).

Tests: `cd infra/multiplayer && npm test` — 82 pass, including the estate suite (building/road separation, reachable
mission doors and interaction points, residents on walkable ground, accessible void decks, whole-map connectivity from
the start, save migration) and the slice suite.

## What is preserved

All scenes, hotspot ids, mission entrances (`enter`, `house-entrance`, `house-h-entrance`, `house-i-entrance`), building
interiors (`building-<osmId>`), The Lookout Dilemma (Minimart → Jun, clues, choices), the six SHIELD activities and their
scoring, escape room, wardrobe, inventory, coins, XP, multiplayer code, the area map and mobile controls. No gameplay or
assessment logic changed; only coordinates (scaled) and rendering.

## Known issues and follow-ups

- **Unity port** still draws the old estate (`games/unity`). `npm run unity:check` already failed before this work
  (`buildingEntrances.ts` export hash, last exported before `de0b0a0`); not regenerated here.
- **Old renderer code** (`world.ts` `createWorld`, `geography.ts`, `detail.ts`, `ambient.ts`, `pixellabArt.ts` ground) is
  now unused by the game; kept for `scripts/amk-review.html?before`. Delete once the review page is retired.
- **Ambient buses** (old `ambient.ts`) are not in the new world yet.
- **Building art** is procedural per style (HDB, shophouse, mall, civic, MRT, kiosk); malls and the MRT are boxes with
  signage, not bespoke landmarks. 3 small unnamed sheds are dropped; 55 OSM footprints centred outside the playable
  boundary are not drawn.
- **Straightening** turns rotated blocks onto the grid, so a few blocks sit a little off their exact OSM angle and
  position (by design; relationships and order along each road are kept).
- **UI**: a shared pixel-frame layer (outlines, lit edge, hard shadow) over the existing ShieldQuest UI; individual
  modals (mini-games, evidence board, wardrobe) are not redesigned screen by screen.
- Night lighting keeps the screen veil and lamp pools; lit windows from the old renderer are not reimplemented.
