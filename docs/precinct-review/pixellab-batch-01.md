# PixelLab batch 01 — Stage 1 completed; later stages unapproved

Prepared 22 November 2026 for ShieldQuest's Ang Mo Kio-inspired Sunshine Court precinct.

**Stage 1 only was explicitly approved and completed:** one facade-bay edit, 10 generations used, 1,702 remaining. See [the stage report](stage1-report.md). End wall, roof and retries remain unapproved. The original three-asset proposal below does not authorise further work.

## Balance and spending limit

Authenticated `get_balance` reports **1,712 subscription generations remaining**, 288 used of 2,000; monetary credits $0.00. Active Pixel Apprentice subscription, resetting 21 December 2026.

The user's latest **150–250 maximum** supersedes the earlier 300 allocation. Use **150 generations as the absolute first-batch ceiling**, not a target. This proposal needs only **30 planned**, or **60 maximum if one retry per asset is explicitly approved**. The other 90 are unallocated and may not be spent on extra assets or variations.

Estimated balance after the three initial edits: **1,682**. If all three receive one paid retry: **1,652**. Re-read `get_balance` after the batch; these are projections, not receipts.

## Pricing evidence

Read the free `search_help(tool="edit_image")` reference and the alternative `create_image_pro` and `create_isometric_tile` references. Pro editing is preferable to unconstrained generation here because input geometry must survive. The edit reference states 10 generations for a canvas up to 256×256; all three modules are below 128 px on both dimensions. Thus budget **10 per edit**, including reference-mode edits. These are documentation-based estimates, not preflight price quotes or submitted generation receipts.

Do not use `create_image_pro` merely to learn an exact non-square price: its help says submission starts generation and cancellation may still charge. The isometric-tile generator adds tile thickness that is unsuitable for these flat facade faces. No new tiles are needed to test the architectural kit.

## Exact proposed assets and order

| Order | Output and input template | Need and reuse | Canvas / projection / anchor | Tool and planned calls | Estimated usage |
| --- | --- | --- | --- | --- | ---: |
| 1 | `src/game/assets/pixellab/modules/hdb-bay-64.png`; input `docs/hdb-templates/bay.png` | Highest-impact facade material. One accepted bay repeats across floors and both block orientations; already supports Blocks 102/106/109/110/112. | 64×96 transparent PNG. Lit face polygon (0,0),(64,32),(64,96),(0,64), anchor (0,64). +x=(32,16), +y=(-32,16). Screen-left lighting. | `edit_image`, one template-based text edit, width=64, height=96, no_background=true. | 10 |
| 2 | `src/game/assets/pixellab/modules/hdb-end-64.png`; input `docs/hdb-templates/end.png` | Matching plain end wall/ventilation and block-number area; shared by every storey and block. | 64×96, same polygon and anchor. Base face lit; renderer mirrors and shades the other orientation to 82%. | `edit_image`, one edit of the end template, using the accepted bay as style reference. | 10 |
| 3 | `src/game/assets/pixellab/modules/hdb-roof.png`; input `docs/hdb-templates/roof.png` | Consistent concrete roof cap, replacing green/toy-like roof materials across all modular slabs. Existing procedural tank variant remains. | 128×90. Roof polygon (64,26),(128,58),(64,90),(0,58), anchor (64,26). Same orthographic view and lighting. | `edit_image`, one edit of the roof template, using accepted bay as style reference. | 10 |
| **Initial total** | **Three assets / three paid calls** | No directional expansion or character generation. | Exact native module canvases. | Stop if the bay cannot satisfy the contract. | **30** |
| Optional retries | At most one additional edit per listed asset, only if included in user approval. | Fix a failed seam or geometric/style defect. No new asset categories. | Same canvases and templates. | At most three additional paid calls. | **+30 maximum** |

## Prepared instructions

**Bay edit:** Refine this existing HDB facade module into cohesive mature Singapore HDB estate pixel art. Preserve its exact canvas, face outline, projection, window positions and alpha silhouette. Warm off-white painted plaster, blue-grey aluminium casement windows, restrained air-conditioning ledge/grille and subtle plaster wear. Sun from screen-left. Keep the existing pilaster/spandrel tint-mask regions clear and aligned. No complete building, roof, ground pedestal, text, perspective convergence or extra objects. Do not add facade elements outside the face. This is a repeatable one-storey bay, not a standalone landmark.

**End-wall edit:** Refine only the supplied end-wall template, borrowing materials, pixel density and lighting from the approved bay reference. Preserve geometry and alpha. Quiet warm off-white plaster with sparse ventilation, a plain area for code-painted BLK numbers, and the existing accent-mask region. No added windows filling the gable, signage, roof, ground or extra building mass.

**Roof edit:** Refine only the supplied roof-cap template, borrowing materials and lighting from the approved bay. Preserve its exact roof polygon, anchor, continuous parapet and transparent exterior. Weathered warm-grey concrete with subtle seams and restrained edge wear. No green lawn, additional building, overhanging foliage or cast ground shadow. Edges must repeat continuously along the slab.

## Acceptance gates and integration

1. Generate the bay first only after approval. Check the output and reported usage before continuing. Reject or stop if the face outline or grid changes; do not keep paying for speculative retries.
2. Inspect a 3×3 repeat using (+64,+32) bay offsets and a −64 px storey offset. Require continuous slab/pilaster edges and readable windows at the real player scale.
3. Keep existing procedural white panel masks and tint settings. Any new texture must fit those masks; no additional mask generation is included.
4. Use the accepted bay as the end/roof material reference. Preserve the end-wall numbering area and roof anchor.
5. Integrate via existing `moduleTexture` overrides; reject wrong-sized outputs instead of stretching them. Keep pillars, lift cores, collisions and walkability in code.
6. Recheck deck/NPC occlusion and all quest entrances, run the build and gameplay tests, and capture the same overview/street camera positions used in the existing before/after set.
7. Report exact tool calls, asset/job IDs, each actual debit, the final balance and any rejected output. Do not commit or push.

PixelLab is reachable through the configured HTTP endpoint and authenticated bearer header. Its methods are not injected into this chat's normal tool namespace. The local MCP configuration's token/environment-variable field issue was diagnosed earlier; no configuration changes are part of this batch proposal. Never log tokens or put them in project files.

## Explicitly deferred — zero first-batch generations

- Void-deck pillars, lift doors, letterboxes, tiled floor and collision modules: existing procedural kit is playable and proportioned; keep it until facade results show a specific gap.
- Bus shelter, route pole, bus bay and tactile paving: reuse the existing shelter and code detail.
- Sheltered linkway pieces: reuse the connected existing kit.
- Asphalt, paving and grass: retain the calm procedural material fields and geometry-driven kerbs/drains in the representative precinct.
- Trees, benches, bins, cycle stands, playground/fitness equipment and parked cars: reuse existing art/code.
- Kopitiam, minimart, hawker centre and town-centre buildings: retain and cluster; do not redraw as one-off filler.

The first acceptance target is **Sunshine Court**. Full-map expansion waits until its architecture and playability are reviewed and accepted. Expand the same modular kit and urban hierarchy without automatically authorising a second generation batch.
