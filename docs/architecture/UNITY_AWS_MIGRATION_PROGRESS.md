# Unity + AWS Migration Progress

Branch `feature/unity-csharp-migration`. Nothing committed, pushed, merged or deployed. No AWS resources created.
Earlier Unity-only notes: `/UNITY_MIGRATION_PROGRESS.md`. Audit: `docs/architecture/SHIELDQUEST_V4_AUDIT.md`.

## Completed (2026-11-19)
- **Shared contract** `GameHandoff` / `MissionExit` v1 with validators — `packages/shared/src/gameState.ts` (exported from `index.ts`).
- **API** anonymous sessions, versioned progress, idempotent per-skill decisions; storage port + in-memory adapter; CORS methods/headers explicit, `credentials:false`, 16 kB body limit — `apps/api/src/{app.ts,routes/sessions.ts,data/sessionStore.ts}`, `apps/api/tests/sessions.test.ts`.
- **Phaser** E in the `minimart-clue` zone emits `enter-mission`; `returnFrom()` restores position — `apps/web/src/game/scenes.ts`.
- **React** `UnityMission` (on-demand loader, progress, error + return, validated messages, Quit + cleanup), session client with offline fallback, page wiring that pauses Phaser and its keyboard capture while Unity runs, reload recovery; dev `__game` hook gated to DEV — `apps/web/src/components/UnityMission.tsx`, `apps/web/src/services/gameSession.ts`, `apps/web/src/pages/CharacterTestPage.tsx`, `apps/web/src/tests/gameHandoff.test.tsx`.
- **Unity** `GameStateManager` (C# mirror + same validation), `WebBridgeController` (SendMessage target, Esc exit), `Plugins/WebGL/ShieldQuestBridge.jslib`, `ShieldQuest/Build Web` menu → `apps/web/public/unity/Build/` (git-ignored).
- **Hosting** `customHttp.yml` (wasm MIME, loader no-cache, security headers); `public/manifest.webmanifest` + theme colour.

## Tests performed (all passing)
- `npm run typecheck` (0 errors) · API vitest 13/13 · web vitest 49/49 · `npm run build` OK.
- Unity 6000.6.10f1 batchmode PlayMode 5/5: map build, walk/run/facing, collision, handoff validation, round-trip JSON equal to the TS contract.
- `dotnet run` core asserts (Tests~/CoreTests).

- **Unity Web build succeeded** (batchmode, `ShieldQuest/Build Web`): uncompressed 36 MB (wasm 28.5 MB, data 7.2 MB). Copied to `apps/web/public/unity/Build/` (git-ignored).
- **Browser (Vite dev, in-app Chromium):** E in the minimart zone → Phaser paused + keyboard capture off → loader fetched on demand → Unity WebGL 2 started and rendered the Unity neighbourhood. Exit event (same payload the jslib dispatches) → Unity unmounted, loader script removed, Phaser resumed, player back at the entrance facing up, handoff cleared. With no API running, `/api/sessions` returned 500 and the page fell back to a local session as designed.

## Not performed
- Unity keyboard input/Esc inside the browser: the test pane was a hidden background page (~9 rAF/s), Unity didn't react to keys there. Needs a human check in a focused browser tab.
- Phaser's E uses `JustDown`; automated instant taps (down+up in one frame) are missed. Human presses work; not changed.
- Any real device, iOS/Android, PWA install, offline behaviour.
- ESLint (no config in repo). AWS deployment (not authorised).

## Remaining issues
- No minimart scene or Lookout Dilemma content; Unity "mission" is currently the Unity neighbourhood with Esc to leave.
- SHIELD scoring rules absent → server TODO in `routes/sessions.ts`.
- Phaser `MISSION_BRIEFS` / NPC lines are scam-themed (outside shop-theft scope) — content owner decision.
- PWA icons are SVG only; no service worker (deferred deliberately).
- Vite chunk warning: Phaser chunk 1.7 MB (lazy-loaded, only on game routes).
- Amplify SPA rewrite rule must be confirmed in the console; Unity build output isn't in git, so Amplify serves the "build not available" fallback until it is uploaded.

## Exact next steps
1. In a normal browser tab: `npm run dev`, open `/dev/character-test`, walk into the minimart zone, press E, then WASD and Esc inside Unity. Confirm Esc returns.
2. Shrink the build before mobile use (Code stripping High, IL2CPP "Optimize Size", strip unused engine modules — 28.5 MB wasm is too big for phones). Then decide how build files reach Amplify (commit to `apps/web/public/unity/` or a separate S3/CloudFront path).
3. Stage C in Unity: `NPCInteractionController`, `DialogueController`, minimart scene, `MissionController` driven by the approved Lookout Dilemma script; post decisions to `/api/sessions/:id/decisions`.
4. Implement the DynamoDB `SessionStore` adapter + Lambda entry; deploy only after approval.
