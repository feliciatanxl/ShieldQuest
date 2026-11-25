# Sunshine Estate: Ang Mo Kio-inspired precinct

## Current world (25 November 2026 overhaul)

Everything below this section up to "Historical" describes the live game. The sections after it record the earlier
60×54 Sunshine Court prototype and remain for provenance only.

### Engine and pipeline

- **Active renderer:** React + Phaser 3.90 (`src/game/main.ts`), `pixelArt: true`, `roundPixels: true`. The Unity project
  under `games/unity` is a parity export, not what localhost renders. NYC_20Nov (Doc 01) names Phaser; "ver 3" proposes
  Unity 6. Phaser stays the implementation target; the Unity export is stale (`npm run unity:check` fails, as it did
  before this work) and needs `npm run unity:export` with a browser.
- **World source:** `src/game/maps/neighbourhood.tmj`, 167×144 tiles at 5 m/tile, OSM geometry © OpenStreetMap
  contributors (ODbL). The file is never edited by hand. At load, `src/game/sunshineEstate.ts` renames places
  (`fictionalise`), thins canopy and places street furniture (`dressEstate`). Re-importing OSM data keeps all of it.
- **Rendering:** `geography.ts` draws buildings from footprints and roads in network-wide passes; ground-level drawing is
  baked into the ground render-texture chunks (`bakeIntoGround`), so it costs nothing per frame.

### World scale (master specification)

| Quantity | Value | Notes |
| --- | --- | --- |
| Ground tile | 64×32 px diamond = 5 m | +x=(32,16), +y=(−32,16) |
| Storey | 30 px ≈ 2.8 m | Void deck datum 38 px |
| Displayed storeys | first 5 as mapped, above that 60% | 12-storey slab → 9; 25-storey point block → 17. Geographic adaptation for readability |
| Avatar (neighbourhood) | 0.42 × 80 px frame ≈ 25 px tall | Slightly larger than true scale, as is usual for readable characters |
| Doorway | 30 px tall, 0.68 tiles wide | ≈1.25× avatar height |
| Void deck pillars | 0.22 tiles, every 1.5 tiles | Low planter wall between, matching the collision wall |
| Camera | `min(w/920,h/600)` clamped .87–1.52, × 1.45 in the neighbourhood | Wheel and +/− zoom 0.5–1.5× of that, between overview and close-up |

### Collision, navigation and depth

- **Ground footprints only.** Collision comes from OSM footprints, never sprite bounds (`collisions.ts`). Shops and
  malls are rasterised solid at 0.5 tiles. HDB blocks have a continuous 0.3-tile wall with 1.8-tile void-deck openings
  from `voidDeckOpenings()`, one per ~7 tiles on edges that fit one; a block with only short notched edges opens its two
  longest. The drawn void-deck wall uses the same function.
- **Depth uses feet.** `geographicDepth()`: a character whose screen silhouette overlaps a block draws beneath it when
  standing behind or under it, and above it when standing in front, whatever the block's centre depth. Previously
  NPCs behind a long slab were drawn on top of its facade, and players in front of a wall could vanish under it.
- **Occlusion.** A block hiding the player fades to 65% only while it hides them; linkway roofs are 60% opaque.
- **NPCs** walk the 12 mapped routes; all route points are verified walkable and outside every footprint.

### Geographic adaptations (recorded)

- Storey compression as above. Footprints, road centrelines and relative positions are unchanged.
- Real names replaced by fictional ones at load time (Sunshine Mall, Sunshine MRT, Sunshine Plaza, Kopi Corner, Masjid
  Sinar Pagi, Block 101–1xx …). Mission blocks keep low numbers: minimart Block 101 (OSM 702), mission houses 102–104,
  Kopi Corner market 105 (OSM 724).
- Canopy trees: the mapped park grid is jittered, a fifth become large rain trees, half the filler trees and any
  crowding a building or door are removed; street trees are added along main-avenue verges every ~7 tiles.

### Art direction specification (current)

| Property | Rule |
| --- | --- |
| Light | Screen-left sun; lit face = the face more aligned with x, shaded face = y |
| HDB facades | Five pastel schemes (lit, shaded, accent). Accent stair-core stripe and roof band. Three facade variants by OSM id: standard, paired windows with accent panels, aircon ledges. Every floor: white corridor parapet, framed windows, laundry and pot plants at intervals |
| HDB ground | Open void deck: checkered warm tiles, pillars, low planter wall, glass lift lobby under a full-height lift-core tower |
| HDB roof | Parapet and lip, darker deck, lift motor room over the core, water tank |
| Shops / malls | Cream walls, glass shopfront bays, striped awnings, brick apron, roof AC condensers and a skylight |
| Ground | Grass with blades and flowers; light warm paving with slab joints; asphalt; terracotta brick |
| Roads | Verge, kerb, asphalt (rounded joints), then edge lines and centre dashes stopping at junctions; zebra crossings only where a mapped footpath crosses a main road away from junctions, at most one per 6 tiles |
| Pedestrian | Light footpaths; sheltered linkways with warm tiles, green posts and green roofs |
| Doors | Framed glass doorway on the wall + doormat + soft ring; mission doors add a green sign plate and label |
| Outlines | None; edges by value contrast, as the existing PixelLab sprites |

### Status

| Item | Status |
| --- | --- |
| NPC/player depth against buildings, solid HDB walls, void-deck openings | Implemented, tested |
| Road passes, junction-aware markings, verges, zebra rules | Implemented, visually checked |
| HDB facade, roof, void deck, lift core variety; height compression | Implemented |
| Integrated doorways, minimart frontage (sign band, awning, fruit crates) | Implemented |
| Street trees, park jitter, gardens, benches, bins, bikes, chess, recycling, fitness corner, kopitiam tables | Implemented (data-driven placement) |
| Camera zoom and wheel / +/− zoom | Implemented (desktop). Mobile pinch zoom: not implemented |
| Minimap matching world colours, linkways, trees, homes vs shops | Implemented |
| Ambient NPC routines (waiting at stops, sitting, shopping) | Not implemented; NPCs walk mapped routes |
| Full UI restyle of menus, panels and mini-game interfaces | Not done in this pass |
| Bus bays aligned to geographic roads | Not done: bus bays only exist for the legacy rectangle roads |
| New PixelLab art | None generated; no PixelLab tool in this session. See proposal below |

### PixelLab proposal (needs approval, nothing spent)

Highest impact, in order: (1) two HDB facade-bay modules (slab corridor bay, point-block bay) at 64×64;
(2) a void-deck/lift-lobby module; (3) a geographic-road bus-stop shelter facing both iso directions.
Estimate about 40 generations with no retries, using the batch-01 tooling and acceptance gates. Not started.

### Verification

- `npm run typecheck`, `npm run build`: pass (existing bundle-size warning).
- `npm test`: 69 pass. New `infra/multiplayer/test/sunshine-world.test.ts` covers walls, void-deck openings, routes,
  dressing placement and all 117 doors. `building-entrances.test.ts` was repaired (it imported a helper removed in
  7fbdd03).
- `node scripts/check-building-entries.cjs`: browser E enter/exit for a shop, the mall, a home block, the MRT and the
  minimart.
- `node scripts/capture-world.cjs docs/world-shots <label> [desktop|mobile]`: real-game screenshots at gameplay zoom,
  Singapore noon plus one 9 pm shot; prints FPS and zoom. `before-*` and `after-*` are in `docs/world-shots/`.
  Headless desktop FPS at the five spots: before 42/28/21/17/15, after 54/55/57/58/59.

## Historical: Sunshine Court prototype (60×54 map)

### Scope and status

The existing branch now contains a first playable **Sunshine Court** precinct in the western part of the 60×54 map. This is a layout and environment consistency pass with existing assets and procedural placeholders. It is not the finished PixelLab art pass or an overhaul of every district. The approved first facade-bay edit is now integrated (10 generations used); no commit or push has been made.

The original Sunshine identity, map size, save format, tutorial spawn, resident interaction coordinates and all mission entrances remain fixed. The retained Peranakan mission house is a fictional heritage exception, not a claim that Ang Mo Kio housing is predominantly shophouses.

## Reference findings and provenance

Reviewed 22 November 2026:

| Source | Observation used | Usage boundary |
| --- | --- | --- |
| [Pixel Singapore](https://www.yadongxie.com/lab/singapore#15282,10681,0.3277) | Consistent building scale, continuous street fabric, purposeful open space and layered greenery. Inspected the live rendered map at the supplied location. | Visual reference only. No map tile, texture, geometry, animation data or asset extracted. |
| [How Isometric Pixel City Was Made](https://www.yadongxie.com/blog/how-isometric-pixel-city-was-made) | One orthographic camera; coherent rendering before texture generation; foreground occlusion and bounded animation. | Adopt principles, not its Google/Cesium 3D-data pipeline. Its 45-degree camera is not our 64×32 projection. No downloaded project assets. |
| [HDB: Ang Mo Kio](https://www.hdb.gov.sg/about-us/our-towns-and-estates) | Mature residential town, town gardens, neighbourhood centres and connections between greenery and public facilities. | Public planning reference; no HDB images republished or used as textures. |
| [HDB: Remaking Our Heartland, Ang Mo Kio](https://assets.hdb.gov.sg/about-us/hdb_roh4/ang-mo-kio.html) | Distinct neighbourhood centres, refreshed public spaces and walking connections. | Factual inspiration only; original fictional layout. |
| [HDB: Ang Mo Kio Town Centre](https://www.hdb.gov.sg/managing-my-home/living-in-my-community/exploring-my-neighbourhood/explore-my-town/ang-mo-kio/ang-mo-kio-town-centre) | Transport and commercial facilities grouped as a centre rather than distributed as isolated monuments. | Existing eastern town centre retained; representative construction is the western precinct. |
| [NHB: heritage trails](https://www.roots.gov.sg/nhb/trails) | Ang Mo Kio's mature heartland character, small businesses and hawker culture. | Public textual reference. The detailed trail page was robot-gated and was not bypassed. |
| [OpenStreetMap: Ang Mo Kio Street 31 area](https://www.openstreetmap.org/#map=17/1.3668/103.8458) | Visually inspected the mapped avenue boundaries, local access streets, parallel slab clusters, internal footpaths, carparks and school/open-space relationships south of the town centre. | Map research © OpenStreetMap contributors, [ODbL](https://www.openstreetmap.org/copyright). No OSM coordinates, building outlines or tile images embedded in the game. Sunshine Court is independently authored and not a traced reproduction. A raw API request returned HTTP 429; no raw extract was obtained. |

The large HDB town-design-guide PDF could not be fetched through the research tool. The usable HDB web pages and visible licensed OSM map informed the design; do not represent the PDF as fully reviewed.

## Why the old map felt artificial

- Similar-width roads divided every amenity into another small parcel. A road crossed what should have been one residential court.
- Housing used several unrelated, small whole-building sprites; two demonstration blocks used a different, larger modular scale. The same number of pixels represented different architectural dimensions.
- Facilities, greenery and chess tables were spaced like independent city-builder purchases instead of forming a daily walking network.
- Ground tiles repeated large drains, round manholes and asphalt damage at nearly every cell. Noise competed with entrances and people.
- The earlier Block 110 detail pass ended abruptly outside a small rectangle, while neighbouring surfaces remained highly saturated and busy.
- Isolated decorative shophouses and square plazas overwhelmed the HDB precinct identity.

## Layout implemented

Sunshine Court occupies tiles **x=0–19, y=18–42**, with a unified surface/detail area **x=0–23, y=18–46**.

- The two avenues at y=15–18 and y=42–45 frame a larger residential precinct. The former y=28–31 through-road now starts at x=22, outside the court.
- Blocks 106 and 109 form the western residential edge: matching modular slabs with eight and six upper residential storeys respectively, plus their open ground decks. Their x=.8 setback leaves a playable rear passage within the map boundary.
- New Block 112 forms the northern edge of the inner court with four upper residential storeys. Existing Block 110 remains the lower southern cluster with four upper storeys. Block 102's twelve-storey northern-edge demonstration is retained elsewhere.
- The low-rise inner blocks are deliberate: tall housing stays near the outer edges, with the shared court and quest locations in front of visible facades. This is a fictional mixed-height precinct, not a scale reconstruction of one AMK block group.
- A covered pedestrian spine at x=9.25 connects Block 112, the western blocks, the court and Block 110's approach. Block 110's existing covered connection meets the avenue bus-stop pavement.
- Shared playground and fitness equipment sit beside that spine; gardens, benches and shade trees support the same court rather than individual road parcels.
- A low Sunshine Court Kopitiam overlooks the northern court. The minimart, hawker centre and eastern transport/commercial/community facilities remain available at their original locations.
- A short two-tile-wide access spur at x=16–22, y=29–31 serves a surface carpark at x=13–16, y=28–32. Painted bays and three parked cars distinguish this service edge from the pedestrian court. The avenue road renderer keeps its centre markings; the access spur omits them.
- Existing bus shelters are reused with the existing route poles, bays, tactile paving and left-hand bus routes. No simulated service was redirected through the new pedestrian court.
- All mission house footprints and doors are retained, including Whisper Network on the eastern side of the court. One resident route was adjusted around trees and the sheltered path.

The rest of the town is still the previous map. Future expansion should apply this cluster/avenue/local-access hierarchy incrementally, not duplicate Sunshine Court as a repeated stamp.

## Unified environment art specification

| Property | Required contract |
| --- | --- |
| Projection | 64×32 ground diamond. +x=(32,16), +y=(-32,16); verticals remain vertical. No perspective convergence or alternative camera angle. |
| Pixel scale | One source pixel per world pixel for modular architecture. Player is approximately 62 px tall. Upper floor height 64 px; clear deck datum 104 px. Evaluate at game zoom, not only in enlarged asset previews. |
| Height/placement | 4 upper floors + deck + roof: 374 px; 6: 502 px; 8: 630 px; 12: 886 px. Tall slabs must not be placed in front of mission entrances. |
| Lighting | Screen-left sun. Base module is the lit long face; the renderer mirrors and shades the opposite face to 82%. No baked shadows pointing another way. |
| Palette | Warm off-white plaster; muted sage and sand/salmon accents; blue-grey glazing; grey concrete roofs and pavement; restrained asphalt; mature olive greens. Keep brighter mission colours as local accents. |
| Materials | Small plaster wear, window mullions, occasional curtains, AC condensers and pipes. Avoid uniform grunge, every-window highlights and oversized ornamental details. |
| Ground | Seamless material fields; paving joints and drains placed by geometry. Never paint lane lines, repeating manholes, bay numbers or directional shadows into every terrain tile. |
| Transparency | PNG; hard outer alpha; no background colour or feathered halo. Keep exact module canvases and anchors. |
| Contact | Shared baked ground contact shadows and short screen-right cast shadows. No bright grass pedestals on new architecture. |
| Occlusion | Keep the existing depth bands and masks for decks, pillars and upper floors. Hidden actor portions use the existing silhouette. Linkway roofs fade locally. Do not flatten the precinct into one image. |
| Performance | Shared module/material textures and chunked ground; details baked once. The new detail target is about 1760×912 px, below a 2048 texture dimension. No per-frame texture generation. |

Procedural ground and module detail are **placeholders**, not PixelLab-generated art. Grey roofs and facade variants now give the modular kit one material language. The new renderer accepts approved module PNGs at exact expected dimensions; incompatible canvases fall back to the working geometry. The projection and collision contracts remain unchanged.

## Asset audit

- **63 environment PNGs:** 47 object sprites and 16 ground tiles. Every object is shown in [the contact sheet](precinct-review/asset-contact-sheet.png); dimensions and alpha counts are recorded in [the inventory](precinct-review/asset-inventory.json).
- **14 character sheets:** eight player bases and six walking residents; dimensions are recorded in [the character inventory](precinct-review/character-inventory.json). No character replacement is proposed.
- **Seven existing HDB template PNGs** in `docs/hdb-templates/` lock the bay, end, pillar, roof and recolour-mask geometry. Reuse these as module guides rather than generating an entire HDB image.

| Assets | Decision | Reason |
| --- | --- | --- |
| hdb-yellow, hdb-mondrian, hdb-teal | Retain outside the demonstration precinct; replace precinct housing with modules | Whole-sprite scaling cannot supply consistently proportioned playable decks. |
| hdb-point | Retain as a distant/background height variation | No new point-block art needed for the first batch. |
| bus-shelter, linkway, traffic-light, street-sign | Reuse now | Already recognisable, transparent and usable. A compatible bus-stop structure is deferred until a concrete gap is visible. |
| minimart, kopi, hawker-centre, neighbourhood-centre | Reuse | They already establish local commerce; clustering matters more than redrawing them. |
| MRT, interchange, mall, CC, library, school, carpark | Reuse in town-centre/background areas | Not the first spending priority. New court uses an open surface carpark drawn in code. |
| benches, lamps, bins, bikes, chess/kopitiam tables, garden, fitness, playground, pavilion | Reuse | Support the shared court; no generation justified. |
| trees and shrubs | Reuse, placed in groups | Mature canopy positions matter more than another tree sprite. The rain-tree filename currently contains palm art; do not mistake its label for the species. |
| house-h, house-i, house-mysterious | Retain mission landmarks | Changing them risks recognition and entrance alignment. These are intentional fictional exceptions. |
| terrain atlas | Keep outside the precinct; replace first three precinct material types | Main source of excessive repetition and noise. Calm procedural placeholders are installed. |

## PixelLab batch 01 — awaiting approval

The latest user spending limit supersedes the earlier 300-credit proposal. The revised first batch is **three reusable HDB modules**, estimated at **30 subscription generations**, or **60 maximum if one retry per asset is explicitly approved**, within a **150-generation absolute first-batch ceiling**. Stage 1 only has now been approved and completed: 10 generations used, 1,702 remaining. Later assets and retries are unapproved.

Latest authenticated balance check: **1,702 generations remaining**, $0.00 monetary credits. Free PixelLab tool references supplied the estimate. Bus shelter, linkways, void-deck components, ground materials and props remain existing art or code for this batch.

See [the exact asset list, dimensions, tool usage, prompts, pricing evidence and acceptance gates](precinct-review/pixellab-batch-01.md). See [the completed Stage 1 report](precinct-review/stage1-report.md) for its exact output, usage and verification. The remaining proposal is not approval for later assets. No automatic expansion or extra assets are authorised.

## Review and verification

Open [the local precinct review](http://localhost:5173/scripts/precinct-review.html). It mounts the real scenes with a separate bridge, never the app save store. Overview, street and deck controls fix the camera for comparison. Play/follow enables regular movement and E interactions. Check navigation uses the actual scene's collision **and rendered-building occlusion** predicate. Bus traffic enables normal motion on the retained routes.

### Build check

`npm run build`: TypeScript and production build pass. Vite reports the existing large bundle-size warning; no claim is made that this task solves code splitting.

### Automated gameplay and save checks

`npm test`: 48 tests pass. Coverage includes the original mini-games, mission layouts and save loading, every resident route sampled against scenery, existing deck/occlusion geometry, all mission entrances reachable from START, the new decks reachable and traversable within their own bounds, and a clear parking aisle. Tests retain original save/door coordinates. A save that falls in newly solid scenery still uses the existing scene spawn fallback.

### Browser visual and navigation checks

The rendered scene reports PASS at START, all four mission entrances, decks 106/109/110/112, the shared court and bus-stop approach. Matching before/after screenshots use the same browser viewport and fixed camera coordinates:

- Overview: centre (-560,650), zoom .9.
- Street: centre (-650,860), zoom 1.25.
- Additional deck view: centre (-700,690), zoom 1.5, player at (11.2,35.7), for occlusion inspection.

See `docs/precinct-review/` for comparison images. Reduced motion holds traffic/trees still in comparison views; resident walkers may differ between captures. The browser check is a desktop smoke test, not a mobile/GPU benchmark or a manual playthrough of every mission.

The final desktop review reported approximately 60 FPS with the precinct loaded. This is an observed single-session reading, not a before/after performance benchmark.

### Engine boundary

The shared Tiled map is used by Unity too. Its non-solid parking classification is updated to prevent an invisible carpark obstacle. Unity's pre-existing renderer does not implement Phaser's modular upper-floor art or the new ground/detail rendering. Unity rendering was not tested in this task; Phaser is the requested implementation target.
