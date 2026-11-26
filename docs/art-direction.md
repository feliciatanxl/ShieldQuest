# ShieldQuest art direction — locked spec

**Status: APPROVED 2026-11-26** with decisions D1–D4 accepted and the revisions in this version. Every asset, precinct
and UI screen is accepted or rejected against it. Where it conflicts with `docs/isometric-art-spec.md`, this spec wins.
That file stays the technical how-to (painter API, depth sorting, footprints).

**Source-of-truth hierarchy:**
1. Real Ang Mo Kio: geography and architectural authenticity.
2. The two locked reference screens: final appearance, detail, atmosphere, lighting and UI. **If a rule below produces
   a result that visibly differs from the references, the references win and the rule is revised here** (see the
   change log at the end).
3. Habbo: perspective, interaction design and character readability.
4. This document: measurable implementation standards.

The references are high-detail isometric game illustration with pixel-art characteristics, not low-resolution 16-bit
art. Depth, detail and expressive characters matter more than minimal geometry. A numerical check never accepts an
asset on its own; it must also look right beside the references.

**References (locked):** `docs/art-direction/reference-day.webp` (17:30) and `docs/art-direction/reference-evening.webp`
(19:15). Both are concept art at gameplay zoom. They fix the look; they are not a map, and nothing is traced or cut from
them.

**Roles:** Habbo-style clarity is the gameplay reference. These two screens are the art reference. Real Ang Mo Kio is
the geography and architecture reference. Everything is original; no third-party sprites, logos or brand names appear
in the game.

How the numbers below were measured: the hex values are dominant colours (k-means) of regions in the two reference
images, rounded and grouped into ramps. Sizes are measured against the character height in the references (about 112
of 633 px) and converted to our 62 px character.

---

## 1. Core visual identity

These are **composition guidelines, not placement quotas.** Open spaces, roads, parks and quiet residential areas stay
natural, and real Ang Mo Kio composition and the references take precedence over any decoration count.

| Guideline | What it means in practice |
|---|---|
| It reads as a game screen, not a map | Busy places (void decks, shopfronts, bus stops) carry interactive or "life" detail. Quiet streets and lawns may be empty; no frame is forced to contain an NPC |
| Warm, lived-in heartland | Props appear where people actually use the space: benches where people wait, bikes by the lift lobby, plants by front doors. Nothing is scattered to fill area |
| Unmistakably Singapore | Typical estates show HDB blocks with void decks, letterboxes, noticeboards, tiled-base pillars, covered linkways and tropical planting. Shops appear only where Ang Mo Kio has them; not every precinct needs one |
| Real variety | Block heights and types follow Ang Mo Kio (low slabs, tall slabs, point blocks), not a uniform cap |
| Player first (measurable) | The player is always the highest-contrast figure: name tag, outline, and never fully hidden (x-ray silhouette when occluded) |

## 2. Projection and scale

Unchanged and approved: 2:1 dimetric, 64 × 32 px tiles, whole-number camera zoom, characters 58–62 px in an 80 px cell.

| Item | Reference ratio (× character height) | Spec value | Current | Change |
|---|---|---|---|---|
| Character | 1.0 | 62 px | 62 px | — |
| Void-deck clear height | ≈ 1.35 | **84 px** | 84 px | — |
| Upper storey | ≈ 1.1 | **64 px** | 56 px | **+8 px** (decision D1) |
| Pillar width (both faces) | ≈ 0.4 | 0.45 tile ≈ 29 px | same | — |
| Pillar tiled base | ≈ 0.4 of pillar | 38 px of 84 | 38 px | — |
| Letterbox cabinet | ≈ 0.85 | 52 px | 52 px | — |
| Door / shopfront glazing | ≈ 1.1 | 64–68 px | 60 px | +6 px |
| Stone table / stool | 0.3 / 0.15 | 18 / 10 px | 18 / 14 px | stools −4 px |
| Bus-stop roof underside | ≈ 1.3 | 80 px | 78 px | — |
| Rain-tree crown | ≈ 2–2.5 wide | 140–180 px wide | 160–192 px sprites | — |

- Screen share: the player is about **15–18 % of screen height** (reference 17.7 %). At 1280 × 800 and zoom 2 the
  current figure is 15.5 %. Keep that zoom.
- Block heights follow Ang Mo Kio (low slabs, tall slabs, point blocks). Tall blocks keep the cutaway and x-ray, so they never hide the player.

## 3. Palette

Each material has a ramp ordered **highlight → base → shade (right face) → outline**. Faces lit from the upper left take
the base colour, faces turned lower right take the shade, and roofs and floors take the highlight.

### 3.1 Daytime materials (17:30 golden-hour reference)

| Material | Highlight | Base | Shade | Notes |
|---|---|---|---|---|
| HDB cream concrete | `#efe6d4` | `#e5d3b4` | `#b99c7c` | frames, slabs, pillars |
| HDB panel — blue | `#8fb0b8` | `#66858c` | `#3c4f55` | colour-blocked service-yard and balcony walls |
| HDB panel — orange | `#d8955f` | `#c67847` | `#7c563c` | as above, alternates with blue by block |
| HDB panel — brick red | `#c0715a` | `#a4704f` | `#6b4a34` | third block colour |
| Recess / balcony interior | `#b6a18c` | `#917967` | `#493529` | anything set back from the wall plane |
| Mosaic pillar tile | `#d8a070` / `#7fa6a0` | `#be7242` / `#5e8b95` | `#6b4a34` / `#3c4f55` | two-colour checker, grout `#e8dcbf` |
| Void-deck floor | `#baac96` | `#b39c7f` | `#7c6e5f` | large panels, no busy grid |
| Pavement slab | `#d4c4af` | `#c2a988` | `#917d69` | 1-tile slabs, joints `#a38f77` |
| Covered drain / grating | `#6d6c6a` | `#585b61` | `#2c2923` | continuous strip with cross-bars |
| Tactile paving | `#f0c070` | `#dca657` | `#a87d3a` | studs in the shade colour |
| Asphalt | `#3a3832` | `#292721` | `#1b1914` | near-black and warm, never blue-grey |
| Road paint | `#f2c94c` yellow, `#efece4` white | | | "BUS" lettering, bay outlines, lane lines |
| Grass | `#b5ae55` | `#949339` | `#6d6c2e` | warm olive, never blue-green |
| Foliage | `#b5ae55` | `#918a3e` | `#635c28` / `#322d0f` | four-step clumps |
| Bark | `#8a6a48` | `#6a4e34` | `#3e2a1a` | |
| Terracotta pot | `#d08a5e` | `#b0683f` | `#7a4229` | |
| Steel (letterboxes, railing) | `#c7c0b0` | `#a09888` | `#6d5f50` | |
| Recycling bin green | `#6f8a4e` | `#4d6338` | `#2f3d22` | |
| Minimart fascia | `#f6d872` | `#f2c94c` | `#c9a032` | ink `#9a2219` (contrast 5.1:1) |
| Drinks-crate blue | `#4f6f96` | `#365374` | `#1f3358` | |

**Outline:** a single 1-px line in **warm near-black `#24160c`**, mixed with 30 % of the underlying colour, so it
never reads navy. The current rasteriser pushes outlines towards blue-black; that changes (P1 in §16).
Interior seams stay at 80 % of the face colour.

### 3.2 Evening grade (19:15 reference)

The world is multiplied by an ambient tint, and light sources are added on top (§5).

| Time | Ambient multiply | Check |
|---|---|---|
| Day (07:00–17:00) | `#ffffff` | — |
| Golden hour (17:00–18:45) | `#ffe6c8` | cream walls read `#e5cfa8` |
| Evening (18:45–20:30) | **`#8a85bb`** | cream wall → `#7d7089` (reference `#796f89`) |
| Night (20:30–06:00) | `#6f6f9e` | still lighter than the current `#56618f` |

Characters take half the strength of the ambient tint, as now. Lights:

| Light | Colour | Where |
|---|---|---|
| Window warm | `#f4c86f` | 40–60 % of windows |
| Window cool | `#f2e6c8` | 15 % of windows (fluorescent homes) |
| Street-lamp pool | core `#db9e54`, edge `#c4a281` | ellipse 3 tiles × 1.5 tiles |
| Void-deck ceiling | `#debc87` on walls and floor | one pool every 4 tiles |
| Shop interior | `#e5cd92` | every shopfront |
| Linkway string lights | `#f6d98a` dots every 0.5 tile | linkway and bus-stop eaves |

## 4. Line and outline rules

- Silhouette: one outline weight across every sprite, judged at gameplay zoom. Code-drawn art uses 1 px at zoom 1 (2 px on screen at zoom 2), which matches the reference weight. PixelLab sprites keep their own single-colour outline if it reads the same at zoom 2. Never anti-aliased.
- Interior detail lines (window frames, panel joints, grout) are 1 px in the material's shade colour. They are not
  outline colour, so detail never looks scribbled.
- Small details (dots for leaves, fruit, grout) are seamless: no ring around each dot.
- Text is never outlined. Plates behind text are.

## 5. Lighting rules

- One sun from the **upper left**. Faces turned lower left take the base colour. Faces turned lower right take the
  shade, about 76 % luma. Tops take the highlight, about 114 %.
- Ground shadows: one flat ellipse per character or object, `#2c2923` at 25 % alpha, offset 0 px (reference shadows
  sit straight under the feet). Trees get a canopy shadow 1 tile to the lower right at 20 %.
- At night, light is **additive and depth-sorted**: a wall in front hides a lit window behind it. There is no
  full-screen veil and no bloom. Light pools may be softly feathered (a smooth radial falloff on the light layer only), as in the evening reference; sprites themselves stay crisp.
- Readability gate: at evening grade, the player, prompts, mission doors and road edges keep contrast **≥ 3:1**
  against what is behind them.

## 6. Architecture rules (HDB)

- **Every block is a frame-and-infill façade.** A cream structural grid (slab every storey, column every flat) is
  infilled with recessed bays. The infill alternates between:
  - **balcony or service yard**: recessed `0.4–0.6 tile`, coloured panel back wall, laundry poles with clothes,
    a door or window visible inside;
  - **window bay**: sliding window with a dark grille, AC compressor on a ledge.
- Colour blocking: each block picks **two** panel colours from blue, orange and brick red (§3.1), alternating per flat.
  Neighbouring blocks never share the same pair.
- Required per block: a painted block number on the gable (pixel height ≥ 30 px), a breeze-block stair core, a lift
  core rising past the roof as a motor room, and a parapet and water tank on the roof.
- **Personality:** each precinct mixes at least two of: corridor-side slab, service-side slab, point block (square,
  later round). No two adjacent blocks share façade type *and* colour pair.
- Weathering: at most one stain streak per 3 flats, `#00000014`. No noise textures.

## 7. Void-deck rules

- Floor: large terrazzo panels in the void-deck floor ramp, with 1-px joints every 2 tiles.
- Pillars: square, cream, with a mosaic-tile base to 38 px, a darker skirting and a cap trim.
- **Every void deck has:** a letterbox cabinet, a Town Council noticeboard (cork with pinned papers), a lift lobby with
  a "BLK nnn" plate, a resident info board and wall lamps.
- **Each void deck picks one personality** (one of four layouts) from: seating (stone table with 4 stools, benches),
  bikes (rack, potted plants), community (chess table, plants, bin) or quiet (bench, plant).
- **Lived-in detail (guideline):** void decks people use show a few of: cat, cardboard box, potted plants, recycling bin, folded chair, notice taped to a
  pillar, "No Smoking" sign on a pillar.
- Walkable gap: ≥ 1 tile between furniture and pillars. The lobby, the stairs and any shop door are never blocked.

## 8. Road, pavement and street-furniture rules

- Pavement: 1-tile concrete slabs, with a **covered drain strip** between the pavement and the road (dark grating
  with cross-bars every 0.25 tile).
- Kerb: 4 px raised edge in the pavement shade colour.
- Markings: double yellow on main roads, single yellow on estate roads, white dashed lane lines. Bus bays get a
  yellow box outline and **"BUS"** painted in road letters 1 tile tall.
- Crossings get tactile strips at both kerbs and a zebra or signal crossing.
- **Pedestrian guardrail** (steel, 30 px high, posts every 0.5 tile) along the kerb next to bus stops and junctions,
  broken at crossings.
- Street lamp: a 92 px pole with a curved arm and a warm head. Every bus stop has a shelter, a bench, a route pole and a
  bin.
- Covered linkway: a **curved grey metal roof** (`#bdb6a6` / `#8f877a`) on white round posts, with a gutter on both
  eaves and string lights underneath. This replaces the current maroon pitched roof.

## 9. Greenery rules

- Trees come from approved PixelLab sprites (rain tree, angsana, tembusu, frangipani, palm, flame tree). Procedural
  trees are a fallback only.
- **No tree stands alone on bare grass.** Each tree on grass sits in a planting bed with at least 2 shrubs or ground
  plants and a mulch ring. On paving it gets a tree grate.
- Beds have kerbed edges, and grass edges follow paths instead of tile steps where possible.
- Potted plants (terracotta, ferns and palms) cluster in 2–3s at void decks, shopfronts and corridors.
- Greens are natural and varied: warm olive for sunlit grass and canopy tops, deeper true greens for shade and tropical leaves (heliconia, ferns, palms). Never one flat olive across the estate. Flowers are accents only: at most 10 % of a bed's pixels.

## 10. Storefront and minimart rules

- Shop bay: pilasters, a roller-shutter box, recessed glazing showing stocked shelves, an awning standing out 0.7 tile
  and a fascia signboard. Bay width 2.6 tiles.
- **Sunshine Minimart** must show: a yellow fascia with red mixed-case lettering, glass-door drinks fridges, stacked
  blue drink crates, a snack rack, a fruit stand, and "No Smoking" signs on the adjacent pillars. Goods stand outside
  on the walkway but never block the door.
- Other units take short fictional names (≤ 10 characters), each with its own plate colour. No real brands.

## 11. Character design rules

- Keep the approved player sheet, proportions (≈ 3 heads), outline and 8 facings.
- NPCs use the same cell, feet row and outline and come from one PixelLab character template. Required set: uncle
  (singlet or checked shirt, slippers), auntie with a plastic grocery bag, student in uniform with a bag, office
  worker, minimart cashier, elderly resident, cat.
- Skin tones and outfits represent Singapore's mix. No caricature.
- The interaction marker is a green triangle `#4cd44c`, outlined, 12 px wide, bobbing 2 px above the NPC's head.

## 12. UI style rules

The HUD moves from navy to the reference's **warm cream and brown panels** (decision D2): a compact, modern, urban game UI. No medieval or fantasy styling (no parchment scrolls, no ornate wood grain, no gothic type). The same identity applies to menus, wardrobe, inventory, map and settings. Functions stay the same; only the presentation changes.
changes.

| Element | Spec |
|---|---|
| Portrait | Round medallion, 64 px, frame `#6b4935` with `#ddc295` inner ring, top left |
| Progress | The existing XP level and progress bar (no health or energy: decision D2 adds no mechanics). Fill , track , 8 px tall; coins in a cream chip |
| Clock and weather | Cream pill `#eacda6`, ink `#2b2118` (10.3:1), top right |
| Quest panel | Charcoal `#2a2a2c`, title gold `#e8b84a` (7.8:1), body cream `#f3e9d2` (11.9:1), bottom left |
| Action buttons | 4 square wooden buttons, 56 px, face `#c79971`, frame `#462617`, icon ink `#3a2416` (5.7:1), bottom right |
| Type | Pixel display font for titles; Outfit for body text at ≥ 14 px |
| Every panel | 2 px dark frame, 1 px light inner edge, hard 3 px drop shadow; no blur, no glass effects |

Mobile: the same components at 0.85 scale. The joystick stays bottom left and the quest panel moves above it.

## 13. Dialogue bubble rules

- Fill `#eee9dc`, 2 px outline `#151008`, 6 px corner radius, a tail pointing at the speaker's head.
- Optional 24 px item icon on the left (for example the lost transit card).
- Text in Outfit, 14 px, ink `#2b2118` (13:1), at most 2 lines of 32 characters.
- Bubbles never cover the player. If they would, they flip to the other side of the speaker.
- Singlish lines are welcome and written for clarity ("Eh boy, did you see my bus card?").

## 14. PixelLab asset acceptance checklist

Generate with `outline: single color outline`, `shading: medium shading`, `view: high top-down`, a transparent
background, and a canvas sized so 1 tile is 64 px. The prompt always says "no ground, no base, no shadow" unless a base
is wanted. Reject the asset if **any** answer is no.

| # | Check | How it's measured |
|---|---|---|
| A1 | Projection matches | Ground-contact edges slope 26.6° ± 4° |
| A2 | Hard alpha | Every pixel is alpha 0 or 255 after cleanup; no halo |
| A3 | No unwanted base, ground or shadow | Lowest opaque rows are trunk, feet or legs |
| A4 | Outline | Silhouette is 1 px, luma < 45 and warm (red ≥ blue) |
| A5 | Light from the upper left | Lower-left faces are ≥ 10 % lighter than lower-right faces |
| A6 | Palette | ≥ 80 % of pixels within ΔE 12 of a §3.1 ramp |
| A7 | Scale | Height in px matches the §2 table ± 10 % |
| A8 | Reusable | No baked context, no text, no brand |
| A9 | Singapore-specific | It is the local version of the thing (HDB letterbox, not a generic mailbox) |
| A10 | Sits beside approved assets | In-game screenshot at zoom 2 next to two approved assets, side by side with the reference |

Batches stay small (≤ 6 assets). Each batch is reviewed against this table before the next one is generated. Batch 1
(2026-11-26) result: rain tree and heliconia accepted; "palm cluster" (A3, A9) and "yellow flame tree" (A9) rejected.

## 15. Handcrafted precinct build checklist — Sunshine Minimart precinct

Scope: everything within about 25 tiles of the Sunshine Minimart door, including the nearest void-deck block (Block 116).
Props here are **placed by hand in a layout module**, not scattered by code. The rest of the estate is untouched until
this precinct passes.

1. Minimart bay meets §10 (fascia, fridges, crates, snack rack, fruit stand, No Smoking signs).
2. Block 116 meets §6 (frame and infill, colour pair, block number) and §7 (all required items, one personality, the
   lived-in minimum).
3. Bus stop with bay markings, "BUS" lettering, guardrail, route pole and bench (§8).
4. Covered linkway from the bus stop to the void deck (curved roof, §8).
5. Two planted beds with trees, shrubs and potted plants (§9). No bare-grass trees.
6. Two NPCs with idle animation and one dialogue bubble (§11, §13); one cat.
7. HUD restyled to §12.
8. Day and evening screenshots captured at the reference composition, then reviewed side by side.

**Screen-level pass (all must be yes):** Does this look like a game, not a map? Recognisably Singaporean? Does the
player stand out at once? Do the HDB blocks look like HDB? Does the void deck feel lived-in? Is the minimart a real
neighbourhood minimart? Is the greenery tropical and local? Does the UI belong to the game?

**Regression gate:** tests pass, the production build passes, every mission entrance and the Lookout Dilemma still
work, there are no collision or NPC-navigation regressions, and the frame rate is ≥ 50 on desktop and mobile.

Only after this precinct passes are the modules rolled out across Ang Mo Kio.

## 16. Gaps between the current build and this spec

| # | Gap | Fix | Kind |
|---|---|---|---|
| P1 | Outline nudged navy (`pixelIso.rasterise`) | Warm near-black `#24160c` mix | code, global |
| P2 | Greens too cool and saturated | Olive ramp §3.1 | code and sprite recolour |
| P3 | Asphalt blue-grey `#59606a` | `#292721` ramp | code |
| P4 | Pavement half-tile pavers look busy | 1-tile slabs + drain grating strip | code |
| P5 | Façade bands are thin; storey 56 px | Frame-and-infill recessed bays; 64 px storey (D1) | code |
| P6 | Linkway roof maroon and pitched | Curved grey metal + string lights | code |
| P7 | No guardrail, no "BUS" bay lettering | Add | code |
| P8 | Lived-in clutter missing (cats, boxes, No Smoking signs, potted clusters) | PixelLab batch 2 + layout | sprite |
| P9 | NPC set incomplete (uncle, auntie with bag, cat) | PixelLab character batch | sprite |
| P10 | HUD is navy web UI | Wood and leather HUD (D2) | UI |
| P11 | Signs use the 3×5 capitals font | 5×7 mixed-case pixel font for fascias | code |
| P12 | Evening too dark (`#56618f`) | `#8a85bb` evening, string lights | code |
| P13 | Dialogue is a modal, not a bubble | World-space bubble (§13) | UI |

## Decisions (resolved 2026-11-26)

- **D1** Approved: 64 px upper storey. Character proportions, camera scale and cutaways are unchanged.
- **D2** Approved with conditions: warm cream and brown HUD, modern and recognisably Singaporean, not fantasy. Existing XP, coins, progression and controls are kept, and no health or energy bars are added.
- **D3** Approved: the fictional transit card is **SunCard**.
- **D4** Approved: late night is darker than the evening reference, while the player, NPCs, architecture, paths and mission interactions stay clearly readable.

## Change log

- 2026-11-26: approved. Density and content rules became composition guidelines (§1, §7). Building heights follow Ang Mo Kio (§2). Outline weight is judged at gameplay zoom (§4). Feathered light pools are allowed (§5). Greens are varied, not uniformly olive (§9). The HUD is modern warm cream and brown with existing XP only (§12). Hierarchy: the references win over written rules.
- 2026-11-26, precinct build (findings while matching the references in the real game):
  - **Precinct location.** Block 116 is about 60 tiles from the minimart and the nearest bus stop about 47, so the
    reference's single frame (minimart, void deck and bus stop together) cannot exist on the real map. The precinct
    (`SHOWCASE` in `estateLayout.ts`) is Block 101 and its town-centre surroundings down to the bus stop on the main road.
  - **Block 101** (the minimart's building, previously a 2-storey shop block) is drawn as a 4-storey HDB block with a
    void deck and Sunshine Minimart as its ground-floor shop. The footprint and the minimart door are unchanged.
  - **Cutaway rule (§ depth sorting):** a void-deck block's upper floors are cut away only while they actually cover
    the player (pixel-tested), whether the player is under the deck or behind the block. In front of an open deck the
    whole block stays standing, as in the reference.
  - **HUD:** colours and shapes follow §12. Positions are unchanged (objective top left, tools top right) to keep the
    mobile joystick and interaction prompt clear. Moving the quest panel and buttons to the bottom corners, as in the
    reference, is an open option.
  - **Outline (§4):** the warm near-black outline is implemented globally in the rasteriser.
  - **Sprites:** the old PixelLab `palm` sprite was retired (semi-transparent fronds); the procedural palm is used.

## Original decision questions

- **D1** Raise the upper storey from 56 to 64 px? This matches the reference proportions. Blocks get about 15 % taller
  and hide a little more ground behind them; precinct blocks stay at 3–5 storeys.
- **D2** Restyle the HUD from navy to wood and leather? This touches every HUD component and modal.
- **D3** The reference quest says "EZ-Link", which is a real brand. In-game it should be a fictional card (for example
  "SunCard"). Confirm the name.
- **D4** Is the evening reference also the night look, or should late night (after 20:30) be darker, as in §3.2?
