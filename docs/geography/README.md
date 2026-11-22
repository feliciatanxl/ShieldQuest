# Ang Mo Kio Central: geographic playable foundation

Implemented in the existing React/Phaser project without committing, pushing or purchasing artwork. This pass replaces the fictional layout with source-derived geometry. It is a playable geographic foundation with temporary architectural massing, **not a finished Pixel Singapore-quality environment**.

## Review evidence

Open [the evidence gallery](index.html), or run `npm run dev` and visit `/docs/geography/index.html`. The interactive Phaser review is `/scripts/amk-review.html`; arrows/WASD move the actual character after selecting Play / follow.

| Requested evidence | Artifact |
| --- | --- |
| Real-world source map and study boundary | [reference.svg](reference.svg) |
| Landmark correspondence with coordinates and source IDs | [Gallery table](index.html), [database](correspondence.json) |
| Before / after, identical viewport, centre and zoom | [Before](before.png), [after](after.png) |
| HDB street and open ground floor | [street.png](street.png) |
| Neighbourhood centre | [centre.png](centre.png) |
| Transport relationship and bus stop | [transport.png](transport.png), [bus-stop.png](bus-stop.png) |
| Actual keyboard movement | [Before movement](movement-before.png), [after movement](movement-after.png), [measured coordinates](browser-checks.json) |
| Responsive rendering | [390×844 canvas](mobile.png), [product menu](mobile-menu.png) |

Comparison camera: 1440×1000 viewport; world centre (0,1700); zoom 0.24. The old map is smaller and fits within that view; the new district extends beyond it. The before image loads the frozen pre-rebuild map in the current renderer. It is not a claim that the old executable was rerun unchanged.

## Source geography and licence

Layout truth is the frozen [OSM API extract](amk-osm.json), downloaded from `https://www.openstreetmap.org/api/0.6/map?bbox=103.841,1.365,103.852,1.375`. Complete source ways may extend past the requested box. The retrieval timestamp is recorded in that JSON.

© [OpenStreetMap contributors](https://www.openstreetmap.org/copyright). The source extract and adapted geographic databases, including `correspondence.json` and the generated Tiled map, are available under [ODbL 1.0](https://opendatacommons.org/licenses/odbl/1-0/). The production build serves downloadable copies at `/map-data/` with consolidated repository attribution in [CREDITS.md](../../CREDITS.md). Artwork and code retain their separate licences. No reference-site artwork, screenshots, Google imagery or Roblox assets were extracted into the game.

Reference research:

- [HDB town-centre description](https://www.hdb.gov.sg/managing-my-home/living-in-my-community/exploring-my-neighbourhood/explore-my-town/ang-mo-kio/ang-mo-kio-town-centre) and [Remaking Our Heartland](https://assets.hdb.gov.sg/about-us/hdb_roh4/ang-mo-kio.html) provide town context.
- [Official HDB Town Design Guide](https://www.hdb.gov.sg/-/media/about-us/our-role/plan-and-design-towns/town-design-guides/Ang-Mo-Kio-Town-Design-Guide.pdf): indexed contents establish Central's design theme and connectivity emphasis. Full-PDF browsing failed on its 20 MB size; individual detailed design pages were not visually validated in this pass.
- [Town Council Teck Ghee map](https://www.amktc.org.sg/wp-content/uploads/2025/Teck-Ghee-Town-Map.pdf) and [Cheng San map](https://www.amktc.org.sg/wp-content/uploads/2025/Cheng-San-Town-Map.pdf): indexed labels provide corroborating context; direct PDF retrieval returned access errors. OSM, rather than an uninspected council image, drives coordinates.
- [AMK Hub operator](https://sg.linkreit.com/malls/amk-hub/mall-info/about-mall/) corroborates the Hub/MRT/interchange connection. It also reports temporary Avenue 3 changes. Those current diversions are **not reconstructed** by this OSM snapshot.
- [SBS Transit service 262](https://www.sbstransit.com.sg/Service/BusService?ServiceNo=262) corroborates the operating interchange. Game buses are schematic ambient traffic, not a verified service timetable or complete service route.
- [Roblox Ang Mo Kio](https://www.roblox.com/games/5788647637/Ang-Mo-Kio-Singapore) and [Singverse](https://www.roblox.com/games/15708677314/Singapore-Roleplay-Singverse): public descriptions reviewed; Roblox gameplay sessions were not launched.
- [Pixel Singapore](https://www.yadongxie.com/lab/singapore) and [making-of](https://www.yadongxie.com/blog/how-isometric-pixel-city-was-made): applied consistent orthographic scale, shared materials, contiguous spatial relationships and source-backed traffic principles. The reference uses an image-based workflow and a different camera angle; ShieldQuest retains its editable 64×32 projection.

## Coordinate contract and regeneration

Study boundary: west **103.843**, east **103.8505**, north **1.374**, south **1.3675**. Origin is its north-west corner. One game tile spans **5 metres**. East increases game x, south increases game y. The bounded playable area is **167×144 tiles**, approximately 835×720 metres after rounding; buildings within a 20-tile context margin continue beyond the playable boundary.

```text
x = (longitude − west) × 111320 × cos(north × π/180) / 5
y = (north − latitude) × 110574 / 5
screenX = (x − y) × 32
screenY = (x + y) × 16 − verticalHeight
```

This is a local equirectangular approximation, not an SVY21 survey transformation. It preserves the selected district's metric relationships to practical game precision. Buildings retain each source polygon vertex, not a substituted axis-aligned rectangle. Source block identifiers are only assigned where the source has an address tag. Unnamed buildings remain unnamed geometry.

Run these from the repository root:

```sh
node scripts/fetch-amk.mjs         # Explicit network refresh; inspect changes before accepting
node scripts/import-amk.mjs        # Deterministic offline generation from frozen extract
node scripts/render-amk-reference.cjs
node scripts/render-amk-evidence.cjs
npm test
npm run build
```

The importer writes the Tiled map, generated mission/location config, correspondence database and production database downloads together. Building polygons and road polylines are individually editable Tiled objects. The runtime reads Tiled polygon vertices so an editor change takes effect. Regeneration overwrites manual map edits; update source/rules for durable changes. `amk-config.json` remains the shared location contract for saves and entrances.

Ground is baked in 24-cell chunks. Each individual building is baked separately once and culled by the renderer; collisions use a spatial hash. The first district is bounded, with surrounding context, rather than attempting a full-town load. Dynamic district streaming and connections to additional playable districts remain future work; this pass does not claim to support unbounded expansion.

## Verified, approximate and fictional features

| Status | Features and limits |
| --- | --- |
| Verified against frozen OSM data | Building outlines and relative locations, tagged block addresses, Avenue 3/6/8 and Central 1/2/3 alignments, mapped paths, mapped park polygons and bus-stop points. Source IDs remain attached. OSM verification is not a survey or a guarantee of present-day completeness. |
| Corroborated landmark relationships | Hub and interchange together; MRT east of Hub; Block 724 north-west of Hub; town-centre block cluster follows source arrangement. |
| Approximate | Road width where untagged, pavement widths, generic façades, height conversion, inferred floor counts where untagged, void-deck pillars and lift cores, roof services, bus shelter shape/orientation, covered-path artwork, tree positions inside mapped parks, lighting, traffic speed/direction sprites. |
| Fictional gameplay | Sunshine Minimart interior at a Block 702 mission entrance; Mysterious House mission at Block 710; Freeze Frame at Block 715; Whisper Network at Block 728; named NPCs, noticeboard and mission narratives. These are not verified businesses, actual building occupants or real facilities. |
| Not yet represented faithfully | Current roadworks, tunnel/bridge elevation separation, precise crossing/light positions, detailed bus bays and lane restrictions, carpark layouts, mature roadside canopy, individual shopfronts, detailed Hub/interchange/MRT architecture, exact ground-floor plans and all façade orientations. |

The whole imported area defaults to a schematic paved urban surface except mapped parks. That avoids invented grass fields but is not an accurate land-cover survey. Low-rise commercial blocks and transport landmarks still use generic massing. The visual finish is below the requested final art standard.

## Gameplay and performance checks

`npm test`: **50 tests passed**, including interior activities and multiplayer regression tests, geographic coordinate correspondence, open HDB floors and solid supports, complete resident-path clearance, collision access to all four relocated missions, and legacy save migration. Old outdoor locations fall back once to the new start while preserving avatar, tutorial, coins and mission state. New outdoor saves keep their position. Indoor scene coordinates remain valid.

`npm run build`: passed TypeScript and Vite production build. Vite reports large JavaScript chunks; the larger geographic dataset increases bundle size. Further code/data splitting is still needed before making strong low-end-device performance claims.

[Browser results](browser-checks.json) record actual keyboard movement, zero JavaScript page errors, scene transitions checked by the capture script, per-view observed FPS and a 390×844 responsive render. NPC hotspot centres are intentionally solid; their interaction rings remain accessible. Headless desktop Chrome results are not physical-phone benchmarks. Touch input, full tutorial completion, every mission narrative and long-session GPU memory were not exhaustively retested.

The capture script uses Playwright and installed Chrome. For the current workstation Playwright is installed in the temporary `shieldquest-qa` directory, outside repository dependencies. `CHROME_PATH` overrides the executable. `node scripts/capture-amk.cjs` regenerates the screenshots and measured browser report.

## PixelLab asset backlog

Balance checked during this pass: **1,702 subscription generations, $0 credit**. No paid generation called; no batch is authorised or scheduled.

| Original reusable artwork needed | Reference and integration target |
| --- | --- |
| Slab facade bays, end walls, corridor/AC/laundry variants | Existing approved `hdb-bay-64.png`, source block proportions, consented street-level references; support oblique source outlines without moving the blocks. |
| Low-rise HDB shopfront / walkway bays | Town-centre commercial rows, particularly 702–730; replace generic windows with plausible retail ground floors. |
| Block 724 market roof and open hawker frontage | Verified Block 724 footprint; reference photos still need detailed visual review. |
| AMK Hub curved frontage and interchange entrance modules | Operator/public exterior references; remain on the same geographic outline, rather than inserting a separate interchange building. |
| Elevated MRT platform / canopy / entrance modules | Station source footprint and transport references; current massing is schematic. |
| Sheltered linkway roof bays and posts | Tagged covered OSM paths and HDB guide; preserve passable space underneath. |
| Kerbs, drains, bus poles, crossing and signage modules | Placement requires source verification before adding detail; bus/traffic requirements must account for current diversions. |

This is an asset backlog, not a generation proposal. Exact image sizes, generation count, references and current quoted cost must be presented for explicit approval before any paid batch.
