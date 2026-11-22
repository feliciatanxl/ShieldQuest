# Batch 01, Stage 1 — HDB facade bay

## Authorisation and usage

Only the facade bay was approved. Exactly **one `edit_image` call** was submitted with `docs/hdb-templates/bay.png`, 64×96 output, transparency and seed 112110.

- Job: `81bd6815-32db-46be-96bb-49617aecb769`
- Gallery asset: `45f72993-c31d-5103-972e-8ef7125822ef`
- Actual charge: **10 subscription generations**
- Before: **1,712** remaining, 288 used
- After: **1,702** remaining, 298 used
- No retry, end wall, roof, second asset, commit or push.

The complete prompt and receipt are in [stage1-generation-receipt.json](stage1-generation-receipt.json); the completed result and charge are in [stage1-image-result.json](stage1-image-result.json). No Pixel Singapore image or extracted asset was passed to PixelLab.

## Authentication check

Fixed the user-level `pixel_lab` MCP entry outside the repository: removed the token from the environment-variable-name field and configured its supported authentication headers. No credential was printed or added to project files.

Verified `get_balance` using a standard MCP SDK Client/StreamableHTTP transport loading the saved server configuration. No token-looking variable-name fallback or one-off bearer injection is used. This configured connection performed the single approved edit and the result/balance lookups.

PixelLab tools are still not injected into this existing chat's native tool namespace. Verification covers the saved configuration and standard MCP client, not a claim that this chat's tool registry was hot-reloaded. The SDK helper and exclusive one-shot submission lock live outside the repository.

## Geometry and seam check

Output: [`hdb-bay-64.png`](../../src/game/assets/pixellab/modules/hdb-bay-64.png).

`node scripts/pixellab/validate-hdb-bay.cjs` produced [the validation record](stage1-validation.json):

- Exactly **64×96**; 4,096 opaque pixels, 2,048 transparent pixels, zero partial-alpha pixels.
- **Zero exterior additions and zero missing face pixels**: alpha silhouette matches the template exactly.
- Original renderer anchor **(0,64)** retained; bay offset **(+64,+32)**, upper storey **(0,−64)**.
- 3×3 repeat coverage matches template assembly exactly, with no new holes or overlaps.
- Visual inspection: slab lines continue across bays, floor joins remain aligned and plaster/frame tones remain coherent. Pilasters mark each bay; no resizing, clipping or texture retouch was needed.

[Native transparent repeat](stage1-repeat-3x3.png) · [3× nearest-neighbour preview](stage1-repeat-preview.png).

## Integration

The existing module loader picks up the approved native-size PNG. A live scene check counted **140 bay placements** across the five existing modular blocks, all sharing one texture. Existing mirroring and 82% opposite-face shading remain.

Close-up inspection caught the old broad procedural accent band covering the new air-con detail. For loaded module art only, that band is narrowed to four pixels; tinted pilasters remain. The generated PNG is unchanged. Fallback procedural facades retain their previous band. Pillars, lift cores, collisions, actor depth bands and map coordinates are unchanged.

## Screenshots

Both sets use the same 1105×840 viewport and player at (14.4,36.6). Moving residents may differ.

| View | Camera centre / zoom | Before | After |
| --- | --- | --- | --- |
| Full Block 110 beside player | (−700,610), 1.05× | [Before](stage1-before-gameplay.jpg) | [After](stage1-after-gameplay.jpg) |
| Facade close-up | (−690,640), 2.2× | [Before](stage1-before-closeup.jpg) | [After](stage1-after-closeup.jpg) |

## Architectural comparison

Revisited [Pixel Singapore](https://www.yadongxie.com/lab/singapore#15282,10681,0.3277), including Chinatown, and [the making-of article](https://www.yadongxie.com/blog/how-isometric-pixel-city-was-made). This was visual comparison only, with no assets or layout extracted.

The casement frames, condenser ledges and restrained plaster give repeated housing a more consistent architectural material language. Windows read at gameplay scale and the 3×3 assembly reads as one continuous wall.

The full neighbourhood is **not yet at the reference's level of realism**. Plain end walls and roof caps contrast with the detailed bay. Identical condenser placement is conspicuous at close zoom. Floor/deck proportions and some older saturated props still limit realism. This demonstrates the facade direction; it does not establish full-map acceptance or authorise more art.

## Build check

`npm run build`: TypeScript and production build pass. Existing Vite bundle-size warnings remain.

## Gameplay and save check

`npm test`: **48 tests pass**, including resident routes, mission access, saved positions, void-deck traversal and modular occlusion geometry. A moving resident can temporarily occupy a live probe point; that is expected collision behaviour.

## Visual/runtime check

The browser confirms the generated texture in 140 placements. Checked full-block scale, the magnified facade and the open deck; moved the player out of the deck. Existing silhouette masks still show occluded residents. All 11 live navigation probes passed on a clear sample; a moving resident briefly occupied the court probe on an earlier sample.

**Performance limitation:** this session's visible/focused embedded browser reported approximately 4–7 FPS. To check attribution, temporarily disabled only the new PNG, reloaded the same overview, and confirmed zero generated placements: the procedural baseline also reported 4 FPS. Restored the PNG and reran exact geometry validation. The low reading is therefore present without the generated asset; this is not a controlled GPU benchmark and does not establish its cause. No unqualified 60 FPS or performance-parity claim is made for this stage. Foreground play on the user's normal browser remains an important follow-up; a complete manual mission playthrough and mobile benchmark were not performed.
