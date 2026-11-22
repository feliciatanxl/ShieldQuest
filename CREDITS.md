# ShieldQuest credits and licences

## Project

ShieldQuest / Project SHIELD is created by **Team SecurePi**. Original project code, game content, SHIELD framework, Guardian characters and original artwork are governed by the repository's [proprietary licence](LICENSE), subject to separately licensed third-party material identified below.

## Map data

**© OpenStreetMap contributors.** Contains information from OpenStreetMap, made available under the [Open Database License (ODbL) 1.0](https://opendatacommons.org/licenses/odbl/1-0/). See [OpenStreetMap copyright and attribution](https://www.openstreetmap.org/copyright).

The geographical source extract and adapted map databases retain their ODbL terms separately from ShieldQuest code and artwork:

- [Frozen source extract](docs/geography/amk-osm.json).
- [Transformed building footprints and correspondence data](docs/geography/correspondence.json).
- [Editable Tiled game map](src/game/maps/neighbourhood.tmj).
- [Public database downloads and licence information](public/map-data/attribution.html), served at `/map-data/` in the built game.
- [Geographic pipeline, reference sources and accuracy limitations](docs/geography/README.md).

The source extract comes from the [OpenStreetMap API](https://www.openstreetmap.org/api/0.6/map?bbox=103.841,1.365,103.852,1.375). Retrieval metadata is recorded in the source JSON. HDB block addresses and geometry are source-derived; mission interiors and stories are fictional. The map is a game reconstruction, not a live navigation service.

## Weather and time

Weather data is supplied through **NEA / Meteorological Service Singapore** datasets on **data.gov.sg**:

- [Air-temperature observations](https://api-open.data.gov.sg/v2/real-time/api/air-temperature).
- [Two-hour weather forecast](https://api-open.data.gov.sg/v2/real-time/api/two-hr-forecast).
- [data.gov.sg](https://data.gov.sg/) for dataset documentation and applicable data-use terms.

The game uses the nearest available temperature station to the district and the Ang Mo Kio forecast area. Observations and forecasts have timestamps; delayed or missing data is labelled. Time is displayed in Asia/Singapore. Day/night lighting uses a solar-position approximation, with artistic lighting rather than measured illumination.

## Original artwork and reference material

Original generated environmental and character assets were created using **PixelLab**, with project-specific assembly, recolouring, animation and procedural artwork. See the [asset documentation](docs/pixellab-assets.md), [asset audit](ASSET_AUDIT.md), and [PixelLab terms](https://pixellab.ai/termsofservice). This work does not claim ownership of PixelLab's service or tools.

The following were studied as references; their game assets, models, map imagery and source code were not incorporated into ShieldQuest:

- Yadong Xie's [Pixel Singapore](https://www.yadongxie.com/lab/singapore) and [making-of article](https://www.yadongxie.com/blog/how-isometric-pixel-city-was-made).
- [Ang Mo Kio, Singapore](https://www.roblox.com/games/5788647637/Ang-Mo-Kio-Singapore) and [Singverse](https://www.roblox.com/games/15708677314/Singapore-Roleplay-Singverse).
- HDB and Ang Mo Kio Town Council publications linked in the [geographic report](docs/geography/README.md).

User-provided UI screenshots informed layout direction. Their third-party branding and artwork were not copied into the shop or profile implementation.

## Fonts, icons and libraries

- **Outfit** and **Press Start 2P**, distributed through Fontsource — SIL Open Font License 1.1.
- **Lucide icons** — ISC.
- **React**, **React DOM**, **Phaser**, **Vite**, and the Vite React plugin — MIT.
- **TypeScript** — Apache-2.0.

The root app and multiplayer infrastructure also depend on other open-source packages. See the [complete lockfile dependency inventory](docs/THIRD_PARTY_LICENSES.md) for declared licences and pinned versions. Upstream package archives contain the applicable full licence and notice texts; those terms continue to apply independently of the project licence.
