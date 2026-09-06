# Scenario migration — feature 3

Phase 3 is ready for review. SecurePi_SPF was read only; all changes are in ShieldQuest.
Stop before phase 4 until the user approves continuing.

## Review the port

Run `npm run dev`, then open:

- Digi-District → **Easy Money?**: inspect/tag clues, choose Accept, see the immediate
  +200 Coins payoff, then the consequence three seconds later. Continue to Mission
  Complete, reopen the learning, or replay a different decision.
- Community Hub → **Jayden's Offer**: the teal Peer Shield flow preserves the friend
  card, transcript, three responses, worked response scripts and debrief. Desktop
  uses the prototype's two-column situation/decision layout; phones stack it.
- The original Express sample missions remain separate entries. They load their
  latest content through `GET /api/scenarios/:id`, with cancellation, timeout,
  loading/error/retry UI. Their existing six-phase presentation is retained.

`MissionRunner`, `MissionNode`, `DecisionOption`, `ScenarioMessage`, `ClueInspector`,
`DebriefCard`, `MissionComplete`, `RewardBurst` and `RewardTakeover` live here.
`ConsequenceTakeover` lives in `features/consequences`. MissionNode's prior
DistrictStop module re-exports the moved implementation. Shared contracts are in
`types/scenarios.ts`, reusing canonical Guardian IDs and competency contracts.

Navigation follows the existing Zustand view state: `/play` and `/peer-shield`
replace the Next pages. The app navigation is hidden during a mission so its
sticky decision rail remains usable. Return actions restore city/district views.
The prototype's decorative 2/4 and 1/3 counters are now Decision/Reflection,
since each implemented mission actually contains one decision.

## State and temporary backend boundaries

- `data.ts` contains only the two playable authored prototype scenarios. The
  existing Express API serves three different sample IDs, with no matching rich
  mission or decision endpoint. `TODO(Scenario.content, Choice.delayedConsequence)`
  identifies where this content and delayed outcome metadata belong. There is no
  silent fixture fallback for failed API sample requests.
- `useMissionRun` handles the solo flow, with a synchronous choice guard, delayed
  timer cleanup on replay/unmount, optional clue tags and fresh simulated stats
  on replay. Scenario cash/trust/risk/resilience are teaching figures, separate
  from participation tokens; they do not persist or accumulate across replays.
  This intentionally avoids the prototype's repeated simulation-stat accumulation.
- Completion records participation for every outcome. Only an explicitly authored
  non-risky `debrief.guardianId` grants skill progress. The prototype's cautious
  “Ask for proof” option still qualifies for VeriFox, as authored. Each activity
  can grant each Guardian once, including a later qualifying replay. First meetings
  wait until leaving the mission so they do not obscure the debrief/consequence.
- Express sample choices now declare `qualifiedGuardian` explicitly. Risky or
  unqualified samples complete without a Guardian; no positional/label heuristic
  decides qualification. This field must eventually come from `Choice` metadata.
- The original participation amounts are preserved: 40 tokens once per mission,
  plus 10 once for constructive Peer Shield intervention. Replays cannot farm
  tokens. `sessionStore` atomically records completion, Guardian and token grants.
  `TODO(Participant, GuardianProgress)` marks missing balance/ledger fields and
  authenticated transactional persistence. Reload resets the visit's state.
- The reward shop, voting, mini-games, assessment and admin migrations remain
  later work. No fake server writes, pilot telemetry or localStorage persistence
  were introduced. Missing features stay visibly planned.

## Verification and continuation

Run `npm run build`, `npm test`, `npm run test:e2e`, `npm run test:dev`.
On this machine use `$env:PLAYWRIGHT_CHANNEL='chrome'` for browser tests.
The active review server is `http://localhost:5174`; set
`$env:PLAYWRIGHT_DEV_PORT='5174'` for `npm run test:dev`. Run browser suites
sequentially because they share Playwright's output directory. A separate older
Vite process on port 5173 returned a proxy error during review.
The scenario tests cover delayed reveal ordering, focus containment, clue counts,
re-reading, replay, navigation cleanup, mobile layouts, qualification and API retry.

Verified 2026-09-06: production build, 14 unit/backend tests, 18 production browser
tests and one development startup test passed (33 tests total). Desktop encounter,
desktop/mobile Peer Shield, mobile completion and desktop/mobile consequence
screenshots were inspected. The 57 tracked prototype reference files match their
pre-port hashes; SecurePi_SPF remained unchanged.

Next authorized feature after review: phase 4, GroupDecisionRunner and useScenarioRun
integration in `features/voting`. `useMissionRun` is deliberately solo-only; the
prototype's group voting hook/orchestration has not been migrated. Reuse the shared
mission contracts, takeover/debrief UI, and atomic session grant ledger. Inspect
`server/routes/votes.ts` before deciding whether a usable write endpoint exists.

No commit was created. Existing phase 1/2 working-tree changes are preserved.
