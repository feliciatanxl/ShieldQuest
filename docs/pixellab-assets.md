# Sunshine Estate — PixelLab asset library

One generated asset set, drawn by both engines.

| Path | What it is |
|---|---|
| `src/game/assets/pixellab/ground/tile_0..15.png` | 64×32 isometric floor tiles (in 64×64 canvases). Tiled gid *n* → `tile_{n-1}`: 1–4 grass, 5–8 pavement, 9–12 asphalt, 13–16 brick plaza. |
| `src/game/assets/pixellab/objects/*.png` | Building and prop sprites, transparent edges trimmed, drawn bottom-centre-anchored. |
| `src/game/maps/neighbourhood.tmj` | Gameplay source of truth: ground, object footprints (= collisions), NPCs. The `Landscaping` layer adds trees and bougainvillea to empty grass. |

## Engines

- **Phaser** — `src/game/pixellabArt.ts` loads every PNG above. It bakes the ground (plus a 14-cell grass border) into one render texture and draws each `.tmj` object as a sprite. Buildings are scaled to their footprint width so doors and collisions line up. Road markings and zebra crossings are still drawn in code (`world.ts`). Kinds with no sprite fall back to the old Graphics art.
- **Unity 6** (`games/unity/ShieldQuest`) — `Editor/PixelLabSync.cs` copies the PNGs and the `.tmj` into `Assets/Resources/PixelLab/` (gitignored) whenever the editor loads. `EstateBuilder.cs` repeats the sprite rules from `pixellabArt.ts` and the door positions from `locations.ts`. If you change one engine, change the other.
  - Open the folder in Unity Hub with 6000.6.10f1 and press Play in any scene; `Bootstrap.cs` builds the estate. Menu **ShieldQuest ▸ Create Sunshine Estate Scene** saves a scene.
  - Play Mode tests: `Assets/Tests/PlayMode/EstateTests.cs`.
  - `PixelLabExport/SunshineEstateGround.unitypackage` is PixelLab's own Unity export of the ground map below (tiles only), kept for reference.

## PixelLab IDs

Map: `0ee147af-0dd8-464f-99fc-3deecde52060` ("ShieldQuest Sunshine Estate", isometric tile map, ground only).
Ground tile group: `641697e0-2993-4a06-a489-d64fe86e3b57` (10 generations).

| Sprite | Object id |
|---|---|
| hdb-teal | 7de80db8-2ec7-49f5-899e-ad4f00043c5e |
| hdb-mondrian | 63fd4f60-3948-4d97-b713-22d67250c1af |
| hdb-yellow | e2dfe44e-5648-402b-9584-c5406e347339 |
| kopi | ab868093-72fb-43df-9571-818c3d64c9e8 |
| minimart | 3178a559-219b-4322-ae0f-ea3b7956c3fd |
| house-mysterious | ab2ccb18-5a1d-4051-b851-0c03a3ce210f |
| house-h | 4eedc2cd-a48c-47a3-912f-28eed9c5d9f8 |
| house-i | 2273b5c8-9700-49ca-98b2-acb607a84973 |
| bus-shelter | 3e1ac409-3231-4675-baea-b0cf9e79a0cf |
| linkway | af647778-30fa-4992-a78a-b2a36b04fed2 |
| rain-tree | d6f56399-5033-4937-802b-d1a392f13fc7 |
| frangipani (palm) | e9bec6ff-d3a6-40bc-9e4e-434578ad6963 |
| planter | 24d46557-c1d8-42c5-b384-96d437d56a6b |
| lamp | d4dde252-f681-41d8-80ac-cd0cc7492285 |
| bench | 4f663496-c794-4664-8fd4-7ea9aab8cb42 |
| bikes | 5a48b6ea-7113-4fae-a3aa-5d0eda8edb11 |
| playground | aabd0f9a-8bfb-46be-bea9-fd4456594f6e |
| traffic-light | 276db161-618f-4e35-970f-99a8986b0339 |
| kopitiam-table | 2dd4c412-6465-4017-91c7-fa2bfd77b8f8 |
| bin | a5d19105-6938-43e1-bc2a-a01f1cc6f9d3 |
| street-sign | 99db4d92-e7a5-462f-9555-19786f9fedce |
| garden | 72be29c3-3e89-4278-9449-1211071cfd07 |
| player (Unity stand-in) | 93cdb109-9190-4977-ad81-74cbe0ae7ebc |

Re-download a sprite: `https://api.pixellab.ai/mcp/map-objects/<id>/download`, then trim its transparent margin.

Unused from this run: 5 square top-down terrain tilesets (5 generations) and one flat front-view HDB test (1 generation). Both were generated before switching to isometric.

## Generation spend (Nov 2026 run)

39 generations of the 2,000 monthly allowance: 10 ground tiles, 23 sprites at 1 each, and 6 unused (listed above).
