# ShieldQuest V4 — Architecture Audit

Audited 2026-11-19 on branch `feature/unity-csharp-migration`. Baseline before changes: typecheck clean, API 9/9 and web 38/38 tests passing, production build succeeding.

## Status matrix

| # | Area | Status | Evidence / files | Action |
|---|---|---|---|---|
| 1 | React website | **Implemented and verified** (tests + build) | `apps/web/src/App.tsx`, pages | None. Large-chunk warning from Vite (three.js) — P5 |
| 2 | Phaser gameplay | **Implemented and verified** in prior work; not re-played this pass | `apps/web/src/game/*` | Added Unity hand-off trigger (`scenes.ts`) |
| 3 | Unity 6 project | **Implemented and verified** (Unity 6000.6.10f1, 0 warnings, 5/5 PlayMode tests) | `games/unity/ShieldQuest` | Added GameStateManager, WebBridgeController, jslib |
| 4 | Singapore neighbourhood | **Verified** in both engines (Unity test asserts layers/colliders/spawn) | `public/game/maps`, `NeighbourhoodBuilder.cs` | — |
| 5 | Movement & animation | Phaser verified; Unity movement/run/collision **verified by tests**, visuals **unverified** | `m01.ts`, `Player*.cs` | Eyeball in Editor |
| 6 | NPC interactions | Phaser: **partially implemented** (single line, no choices). Unity: **missing** | `scenes.ts`, `neighbourhood.ts` | Stage C |
| 7 | Minimart shop-theft mission | **Missing** (no scene, no case content). Phaser brief for `minimart-clue` is placeholder text about a "shopfront notice" | `scenes.ts` `MISSION_BRIEFS` | Needs approved Lookout Dilemma script |
| 8 | Phaser → Unity transition | **Implemented and verified (automated)**: trigger, pause, container, bridge, return. End-to-end in a browser **unverified** | see "Hand-off design" | Manual browser test after Web build |
| 9 | Shared player/game state | **Implemented and verified** (TS + C# validators, tests both sides) | `packages/shared/src/gameState.ts`, `GameStateManager.cs` | — |
| 10 | PWA | **Partially implemented**: manifest added (SVG icon only). No service worker — **intentionally deferred** (avoid stale Unity builds). Installability **unverified** | `public/manifest.webmanifest` | Add 192/512 PNG icons; decide SW scope |
| 11 | Mobile controls | Phaser touch joystick exists (unverified on device). Unity touch input written, **untested**, no on-screen graphics | `m01.ts`, `PlayerInputHandler.cs` | Device checklist below |
| 12 | Amplify config | **Partially implemented**: `amplify.yml` builds shared+web correctly. SPA rewrite not in repo (console setting) — **unverified**. Added `customHttp.yml` | `amplify.yml`, `customHttp.yml` | Confirm rewrite rule in console |
| 13 | API Gateway + Lambda | **Missing**. Backend is Express, not deployed by Amplify | `apps/api` | Proposal below; not deployed |
| 14 | DynamoDB | **Missing**. Storage port + in-memory adapter added | `apps/api/src/data/sessionStore.ts` | DynamoDB adapter (design below) |
| 15 | Auth | **Missing → implemented minimal**: anonymous session id + bearer token (SHA-256 hashed, timing-safe compare). Cognito **intentionally deferred** | `routes/sessions.ts` | Revisit for facilitator accounts |
| 16 | SHIELD assessment records | **Partially implemented**: per-skill decision records, idempotent, never scored client-side. **Scoring missing** (no approved criteria in repo) — TODO, not fabricated | `routes/sessions.ts` | Need approved criteria |
| 17 | Security & privacy | No secrets/`.env` in git (scanned). Fixed: dev `window.__game` hook was exposed in production; CORS now methods/headers explicit, `credentials:false`; JSON body limit 16 kB; 24 h session expiry. Rate limiting **missing** (use API Gateway throttling) | `app.ts`, `CharacterTestPage.tsx` | API Gateway usage plan |
| 18 | Automated tests | API 13, web 49, Unity 5 PlayMode, dotnet core asserts — all passing. No ESLint config exists (`npm run lint` is a no-op) | — | Add ESLint (P5) |
| 19 | Documentation | This file + `UNITY_AWS_MIGRATION_PROGRESS.md` | — | — |

**Content scope note:** existing Phaser NPC/mission text (`verify-message`, `playground-choice`, Auntie Mei's line) is about scams/phishing, outside the funded shop-theft pilot. Left unchanged (approved-text rule); flag for the content owner.

## Hand-off design (one player, one engine at a time)

```
Phaser neighbourhood ──E in "minimart-clue" zone──▶ game.events 'enter-mission' {missionId, returnTo}
   React CharacterTestPage: pause Phaser loop + disable its keyboard capture
   ensureSession() → GameHandoff (validated by parseHandoff) → sessionStorage (survives reload)
   <UnityMission> lazy-loads /unity/Build/ShieldQuest.loader.js (only now)
      ──SendMessage('WebBridge','ReceiveHandoff', json)──▶ Unity GameStateManager.Parse/Apply
      ◀──window 'shieldquest:unity' event (jslib)── MissionExit json, validated by parseMissionExit
   instance.Quit(), script removed, Phaser resumed, player placed at returnTo
   saveMissionExit() → PUT /api/sessions/:id/progress (optimistic version) — skipped for offline local sessions
```

Contract (`GameHandoff`, v1): `sessionId`, `avatar.characterId`, `engine`, `missionId`, `checkpoint`, `completedObjectives[]`, `returnTo{scene,x,y,facing}`. Presentation only; server progress is the trusted copy.

## API (implemented in Express; Lambda-ready shape)

| Method | Path | Notes |
|---|---|---|
| POST | `/api/sessions` | Anonymous session → `{sessionId, token}`. No personal data |
| GET | `/api/sessions/:id/progress` | Bearer token for that session only |
| PUT | `/api/sessions/:id/progress` | `{expectedVersion, exit: MissionExit}`; 409 on stale version |
| POST | `/api/sessions/:id/decisions` | `{decisionId, missionId, skill S/H/I/E/L/D, choiceId}`; idempotent on `decisionId` (201 first, 200 retry, never overwritten) |

Avatar read/update and squad/workshop endpoints: **deferred** until there is a UI that needs them.

## AWS proposal (not deployed, no resources created)

- **Hosting:** Amplify as today. Add rewrite `</^[^.]+$|\.(?!(css|gif|ico|jpg|js|png|txt|svg|woff2?|ttf|map|json|webmanifest|wasm|data|tmj|tsj)$)([^.]+$)/>` → `/index.html` (200). Unity files under `/unity/Build/` (uncompressed export; headers in `customHttp.yml`).
- **API:** API Gateway HTTP API → one Node 20 Lambda running the existing Express app via a thin adapter (e.g. `@codegenie/serverless-express`) — reuses routes and tests; no C# backend needed. Throttling via stage/route limits. CORS restricted to the Amplify domain(s).
- **DynamoDB (single table `ShieldQuest`)**, on-demand billing, TTL attribute `expiresAt`:

  | Item | PK | SK | Notes |
  |---|---|---|---|
  | Session | `SESSION#<id>` | `META` | `tokenHash`, `createdAt`, `expiresAt` |
  | Progress | `SESSION#<id>` | `PROGRESS` | `version`, `missions` map; `UpdateItem` with `ConditionExpression version = :expected` |
  | Decision | `SESSION#<id>` | `DECISION#<decisionId>` | `PutItem` with `attribute_not_exists(SK)` → idempotent; `skill` kept per item so skills never mix |
  | Workshop (later) | `WORKSHOP#<code>` | `SESSION#<id>` | facilitator view; needs auth first |

  All reads are by session (`Query PK`), so no GSIs yet. Lambda role: `dynamodb:GetItem/PutItem/UpdateItem/Query` on this table ARN only.
- **Cognito:** not needed for anonymous pilot sessions; add for facilitators when workshop dashboards exist.
- **Retention:** 24 h TTL on workshop sessions by default; no names, emails or free text stored.

## Device test checklist (manual; nothing below has been tested on devices)
For each of Windows Chrome/Edge, macOS Safari/Chrome, Android Chrome, iPhone Safari, iPad Safari:
1. `/dev/character-test` loads; move with keys (desktop) or joystick + RUN (touch).
2. Walk into the minimart zone, press E / tap E → Unity loading % shows → Unity view appears.
3. Esc (desktop) returns; player stands where they entered; Phaser keys work again.
4. Rotate device during both engines; no blank canvas.
5. Background the tab 30 s and return; game resumes.
6. Throttle to "Fast 3G": record Unity load time; Return button works during loading.
7. Install prompt (Android Chrome) / Add to Home Screen (iOS) — record whether offered.
