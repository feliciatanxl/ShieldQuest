# Native Unity version

Open `ShieldQuest` in Unity **6000.6.10f1**, open `Assets/Scenes/SunshineEstate.unity`, then press Play. `Bootstrap` creates the native world and interface. No browser/WebView is embedded.

## Alignment with Phaser

| Area | Current implementation |
| --- | --- |
| District | Same 167×144 Tiled map, OSM footprints, 5 m cells, start point and four mission entrances. 117 interactable building entrances in the playable area, including shared shop/lobby/station interiors and return-to-entry exits. The other 50 masses are outside the playable boundary. 167 individually exported building sprites with separate lit-window layers; native geographic collisions and void-deck pillars. |
| Interiors | Minimart, Mysterious House, Freeze Frame House, Whisper Network House and Freeze Frame room. Source artwork exported as separate layers, with source collisions and hotspots. NPCs are captured in standing poses. |
| Movement | Same walk/run speeds, eight facings, six walking/running frames, reduced motion, keyboard, interaction prompts, camera zoom and a basic touch pad. |
| Avatar | Seven shared preset/base looks, immediate on-map refresh, name editing and purchased preset outfits. |
| Panels | Profile, Friends, Guardians, pack/evidence, missions, settings, area map and coin shop. Shared Outfit/Press Start 2P fonts and cream/navy/teal palette; native IMGUI layout approximates the React interface. |
| Shop | Source catalogue, prices, quantity and ownership rules; persistent coin balance, furniture collection and outfit equip. Furniture is collected, not placed in rooms. |
| SHIELD | All six source assessment definitions, grading, prerequisites, saved results and Guardian collection. |
| Mysterious House | Evidence pickups, inventory/documents, letter/book/timeline sequences, drawer code, evidence review, safe, hints and exit-key completion using the source prerequisite/reward graph. |
| Clock/weather | Singapore time, solar night strength, warm building windows; NEA temperature and Ang Mo Kio forecast requests, with unavailable/delayed labels. |
| Traffic | Native route movement, exported directional bus art, shelter dwell, yield and collision; simpler walkers. |
| Persistence | Version-3 save JSON contract, native PlayerPrefs, checkpoint persistence, JSON import/export in Settings. Browser storage and Unity PlayerPrefs are separate; saves do not automatically sync between engines. |

## Remaining differences

- The complete per-part wardrobe renderer is not ported. Imported custom avatar fields are retained, but unsupported combinations display the nearest available preset/body style. Choosing a native preset replaces that custom look.
- Freeze Frame's timed scenarios and Whisper Network's deduction/chat interactions are not ported. Their rooms are explorable and link to the SHIELD assessments; these links do not reproduce those practice games.
- Friends are local entries and estate neighbours. The Phaser multiplayer service, live presence and remote avatars are not connected.
- The native UI, map legend, occlusion, walker animation, decorative street details and interior camera behaviour still differ. Audio, accessibility/focus navigation and mobile layout need a Unity play-through. This is not a claim of pixel-perfect or complete gameplay parity.

## Refreshing the shared exports

From the repository root:

```powershell
npm ci
npm ci --prefix infra/multiplayer
npm run unity:export
npm run unity:check
```

The exporter starts a temporary Vite server on port 5174, renders the original Phaser objects in headless Chrome, copies shared art and converts the existing font files. Chrome defaults to the normal Windows installation; set `CHROME_PATH` for another executable. Exports are checked in so Unity does not require Node, Chrome or Vite just to open the project.

`unity:check` verifies copied map/config data, source hashes, every generated image's dimensions, fonts, eight interior variants and the building inventory. Re-export after changing shared source or artwork. `ShieldQuest > Sync PixelLab Assets` copies raw source art/map/config only; it does not regenerate procedural building/interior/character exports.

## Validation

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File scripts/check-unity-csharp.ps1
```

This requires .NET 10 and the installed Unity editor assemblies (override `-EditorPath` if needed). It compiles native runtime/editor C# using C# 9, runs 69 pure C# gameplay checks, then passes the actual native passing/failing assessment results and completed house save through Phaser's own readers. It does **not** start Unity or prove that rendering, input, web requests or scene travel work in PlayMode.

PlayMode tests are in `Assets/Tests/PlayMode/EstateTests.cs`. Run them through Unity Test Runner after activating an editor license. The batch run attempted during this update exited with code 198 because no valid Unity Editor license was available; PlayMode and visual checks remain unverified.

Credits, map-data licensing and font notices remain in [CREDITS.md](../../CREDITS.md), [third-party notices](../../docs/THIRD_PARTY_LICENSES.md) and the copied font licence files. The same source-art and database terms apply to these exports.
