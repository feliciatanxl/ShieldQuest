| planter | 59cc729f-9ec4-4fad-96c8-77aed1602a5c || bin | 317d8cd1-5e01-40ee-aef8-1ad2f00f9487 || bikes | 742d5ce9-3a61-40ba-9393-56aadaab7406 || traffic-light | cc2ba94c-f0ec-4d1c-af8e-1b58e9b54e71 || rain-tree (drawn as a palm) | 293e872c-5a20-48dd-82dc-c61ac792aa50 || bench | a3c5d799-d817-4fa6-8167-306374a59dc7 || lamp | 912ced48-9b23-45c8-8963-31ae61a0e6c6 || linkway | ad0cf52c-d35c-44b0-b88d-4df900dd89a8 || bus-shelter | a715ff60-da59-48fb-b169-d9ba0c63d211 || house-i (pink Peranakan shophouse) | f1510200-fd9a-4a1b-97ec-2902a96c1c4f || house-h (mint Peranakan shophouse) | 67f8c240-9054-4eea-ab47-91d4cd0c1614 || house-mysterious (black-and-white bungalow) | 5be063d0-037e-4781-b91d-109e2a6404fc || minimart (provision shop) | a888895e-d430-42d9-9f61-20f3d38794e3 || kopi (void-deck kopitiam) | 3a66d9c8-da5d-44fe-9cf4-2b9d14737a4e || hdb-yellow (slab) | c3166df7-aa53-4d39-9f8f-30c36e07b826 || hdb-mondrian (red-band slab) | 0b531191-d0fd-4884-b8fb-dbad2a96f783 || hdb-teal | 7f3e275d-4372-499b-9d6a-da55b6579932 |# Sunshine Estate — PixelLab asset library

One generated asset set, drawn by both engines.

| Path | What it is |
|---|---|
| `src/game/assets/pixellab/ground/tile_0..15.png` | 64×32 isometric floor tiles (in 64×64 canvases). Tiled gid *n* → `tile_{n-1}`: 1–4 grass, 5–8 pavement, 9–12 asphalt, 13–16 brick plaza. |
| `src/game/assets/pixellab/objects/*.png` | Building and prop sprites, transparent edges trimmed, drawn bottom-centre-anchored. |
| `src/game/maps/neighbourhood.tmj` | Gameplay source of truth: ground, roads, object footprints (= collisions), walking residents. See **Sinar Town map** below. |

## Engines

- **Phaser** — `src/game/pixellabArt.ts` loads every PNG above. It bakes the ground (plus a 14-cell grass border) into one render texture and draws each `.tmj` object as a sprite. Buildings are scaled to their footprint width so doors and collisions line up, drawn with smooth filtering, and get their names painted onto their own signboard or HDB end wall (the `signs` table: position in sprite pixels and the wall slope). Slab blocks drawn along the other axis are mirrored to match their footprint. Road markings and zebra crossings are still drawn in code (`world.ts`). Kinds with no sprite fall back to the old Graphics art.
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
| hdb-point | d0d52352-4f6d-4da4-8b60-f1843a9197a6 |
| angsana | fc2ab05c-1e37-4743-8e19-4a0d7e62a1db |
| hawker-centre | ee36ec5f-5b73-479b-9762-c93c2e53a6c1 |
| chess-table | 50c91838-a392-462c-ae78-fb24a2b35071 |
| fitness-corner | ff41f10f-6547-4aa5-a87f-69fbf6030929 |
| pavilion | 3f97c93a-3ef7-4b83-8d5d-9bb7b9d674df |
| recycling-bins | 1f9898b1-be1f-4b55-8e7f-347e1bda523e |
| mrt-station | 746dcde4-5e9d-41b2-bcf3-9e8842baa962 |
| bus-interchange | 79d1155d-51c7-45f2-89f9-813c19114b47 |
| town-mall | d88ffc32-63b1-48aa-ade9-f9443b7037b8 |
| neighbourhood-centre | 7c05907a-d94b-4e49-a881-03ee96d8a6f8 |
| community-club | 2493330e-f034-4265-9174-fae95e7a6303 |
| carpark | 45f153bf-bdc6-4fe5-99db-dbc186514b32 |
| school | 4d4fd78d-36c2-4fd5-b411-68cd657b39b4 |
| library | cf8c1678-90e6-4e2f-96dd-01a6567ab6e7 |
| pond | 63c833e5-87f9-4e6a-ad90-eed890a3c300 |
| player (Unity stand-in) | 93cdb109-9190-4977-ad81-74cbe0ae7ebc |
| npc-may (Chinese auntie, resident May) | 9dff46df-6f87-4ec0-acd8-7ea7ced69594 |
| npc-amir (Malay youth, resident Amir) | 4f363b88-54ba-48ab-a5f4-a5996863ccbc |
| npc-cashier (Indian minimart worker) | 6895e9bf-5efb-410f-9bb9-346ed18046f0 |
| npc-jun (student) | 1beea7ef-410c-4037-8bd9-32493faf9696 |
| npc-kopi-uncle | df120667-2cb1-44a3-a2cf-6a32fa9bc97b |
| npc-auntie-tudung | db70ec5d-212f-4d74-b5b4-6e1730dd0d72 |
| npc-elderly | c5cbcf7d-e173-43c1-8d83-5f0e219cbb2a |
| npc-office | 95900e8f-27ef-4e54-b7a6-aae80836550b |

## Sinar Town map

`neighbourhood.tmj` is a 60×54 HDB town laid out like a mature Singapore estate. All names are invented. It has a town centre (MRT, bus interchange, mall, community club, library), neighbourhood centres, slab and point blocks with void decks, a shophouse row, a hawker centre and market, a town garden and covered linkways. The original estate keeps its coordinates in the north-west, so door positions and saves still match.

- `road` and `crossing` rectangles drive the road markings in `world.ts`: kerbs, double yellow lines and lane dashes, broken at junctions, plus zebra crossings.
- `building` objects name their sprite and optional sign text, with lines split by `|`. `block` objects may override the sprite chosen from their number.
- Footprints follow each sprite's base proportions. A building's depth is taken from its nearest front wall, so anyone along either front wall draws in front of it.
- The **Beyond the edge** layer is scenery past the playable edge: blocks behind the north and west edges, trees in front.
- Characters can't stand right behind a building (within 2.5 tiles), so nobody walks under one. Further behind a tall building the player can walk and shows as a see-through ghost (`hiddenByBuilding` in `pixellabArt.ts`).

## Walking residents

Residents walk back and forth along `walker` polylines in the **Residents** layer. Each `sheet` property names `src/game/assets/characters/npc-<sheet>.png`, a sheet with the same layout as the player base sheets, built with the same script from the character download. They wait while the player is in the way, and the player can't walk through them.

| Sheet | Character id |
|---|---|
| kopi-uncle | 57415ea1-6ac2-4f08-ab88-903457e5762c |
| makcik | 05f1a3ac-d002-4160-897a-f3f06e9af806 |
| indian-uncle | 4e526a6b-1a13-4373-96b5-8a87539a7d89 |
| office-worker | 75bc89ab-a761-44aa-a23f-d44ad4f6a618 |
| student | fc89270c-1f50-4b93-ba8d-1ea72a78d267 |
| auntie | e0aee214-75ec-49e3-84e1-aa5ab594d050 |

Residents standing in exploration scenes use `npc-<id>`. Mini-games that walk residents around use player base bodies dressed by `residentData.ts` to match. Friend and dialogue portraits crop the `npc-<id>` sprite (`ResidentPortrait` in `AvatarSprite.tsx`).
## Player base bodies

The player is drawn from eight PixelLab base bodies, one per hairstyle option, at `src/game/assets/characters/base-<hairstyle index>.png`. Each sheet holds 80×80 cells in 8 rows: south, north, east, west, south-east, south-west, north-east, north-west; column 0 is the standing pose, columns 1–6 the walk cycle and 7–12 the run cycle (used while Shift is held or the joystick is pushed past its ring). West art is recoloured as if it faced east and then flipped back, so the profile rules for eyes, cap brim and bag apply to it as well. Every base wears the same outfit (white tee, navy shorts, red sneakers, black hair or a teal tudung). `playerArt.ts` classifies each pixel by colour and height and recolours skin, hair, top, bottom and shoes from the wardrobe. It relabels pixels for long pants, long sleeves, singlets and open footwear, and draws glasses, collars, lanyard, satchel, hair clip, cap and bucket hat on top. If you add a base, keep that outfit so the classifier still fits.

The script reads the rotations and the `walk` and `run` animations in every direction. A `run-<direction>` clip replaces that direction of `run`. Frames on a larger canvas, such as skeleton-v3 output, are cropped to 80. Single frames drawn facing the wrong way are swapped for a mirrored frame. If most of a clip is turned, that clip is skipped and the game walks instead. A south walk frame drawn from behind is swapped for the opposite-phase frame, mirrored.

Each base is two PixelLab characters: the original 4-direction one (cardinal rotations, walk and run) and an 8-direction copy made from those exact rotations, which adds the diagonals and their walk and run. Build a sheet from both downloads: `node scripts/pixellab/character-sheet.cjs src/game/assets/characters/base-<n>.png <4-direction dir> <8-direction dir>`.

| Base | 4-direction id | 8-direction id |
|---|---|---|
| 0 Side swept | 6c24b890-57ff-4ede-bd20-1ac2d0d6fdd4 | 36e4901c-05db-48fe-953a-53a841f566f8 |
| 1 Bob cut | fdf999ed-99f5-42cc-81c8-c5ea91cbbf14 | 1a7b0b68-fb7e-4600-99f8-9adf90d10426 |
| 2 High bun | 0adab75d-98ce-4ec8-b644-6debc07eed0f | 678200fe-2947-4163-888d-111a41c67a23 |
| 3 Soft curls | 1ffc3865-3d5c-4dbb-8f6e-405675012bf4 | 599e65ab-80be-4c87-8e54-4fb69760e740 |
| 4 Short crop | abc5321a-c6ea-4a90-8247-88091b197923 | 30a296b7-1d12-46af-b2c9-b0c4ace2cca3 |
| 5 Ponytail | c7b25298-f9a7-484f-b0f4-3d65e90c6303 | 67df9a73-4aed-4366-89d5-77bed267c936 |
| 6 Long straight | c4d5d143-7875-4f92-bad9-de39d42f44a9 | 9b084a32-7768-4102-9d89-5823b4a33fd6 |
| 7 Tudung | ad20e4a5-cb6a-4e0d-ad0b-9d9d13d5f363 | c7c030a6-b6a8-4fb8-ab2d-50c58abea7e1 |

Add new options to the end of each list in `state/avatar.ts`, never in the middle, because saves store option indices. `normalizeAvatar` upgrades older saves.

Buildings were generated at 260–400px, which PixelLab returns on a flat background: `node scripts/pixellab/cutout.cjs <download.png> <out.png>` removes it and trims. Re-download a sprite: `https://api.pixellab.ai/mcp/map-objects/<id>/download`, then trim its transparent margin.

Unused from this run: 5 square top-down terrain tilesets (5 generations) and one flat front-view HDB test (1 generation). Both were generated before switching to isometric.

## Generation spend (Nov 2026 run)

39 generations of the 2,000 monthly allowance: 10 ground tiles, 23 sprites at 1 each, and 6 unused (listed above).
Second run: 8 NPC sprites (8 generations). Total 47.
Third run: 8 base bodies (standard mode, 4 directions, 1 each) and 6-frame walks for 7 of them (3 directions × 1 each = 21). 29 generations. Total 76.
Fourth run: west walks for 7 bases (7), a 4-direction walk for the high bun (4), 4-direction runs for all 8 (32), one template retry of the north run for soft curls, side swept and long straight, which had been drawn facing the camera (3; only soft curls came out right), and skeleton-v3 north runs for the other two (6). 52 generations. Total 128.
Fifth run: 8-direction copies of all 8 bases (v3 with the existing rotations as references, 8), diagonal walk and run for each (64), and the tudung north-east run redone after it drifted side-on (1). 73 generations. Total 201.
Sixth run: the 3 HDB blocks, kopitiam, minimart and 3 houses regenerated at 260–400px as Singapore slab blocks, a void-deck kopitiam, a provision shop, two Peranakan shophouses and a black-and-white bungalow (8). Total 209.
Seventh run: 6 walking residents (standard 8-direction characters, 6) with 8-direction walks (48); hawker centre, chess table, fitness corner, pavilion, recycling bins (5); bus stop and linkway at higher resolution (2); Sinar Town buildings (MRT, bus interchange, mall, neighbourhood centre, community club, car park, school, library, point block, 9), a pond and 9 street props (lamp, bench, palm, angsana, traffic light, bikes, bin, planter), 10. 79 generations. Total 288.
