# Guardian migration — feature 2

Ports `GuardianCard`, `GuardianArt`, `GuardianMet`, the responsive Guardians page,
and guardian/skill/district projections from `useShieldProgress`. Six portraits
appear in the original three-column desktop layout; phones select one detailed
card from a two-row portrait selector. Unmet Guardians remain visible with their
skill, motto and instructions for meeting them.

`types/guardians.ts` owns the contracts and S.H.I.E.L.D. competency mapping. IDs
use ShieldQuest's canonical `GuardianId` values. City board aliases reuse these
definitions and the same roster, artwork and progress calculation. Neutral art,
sheet and modal primitives moved to `src/components` for both features to share.

## State and API boundaries

- `sessionStore` holds the in-memory grant ledger, cumulative practice and
  first-meeting queue. One activity can award each guardian only once. A later
  distinct activity progresses that guardian; replay never adds progress.
- `guardianStanding` derives level and segmented-bar progress together: six
  practices reaches level 2 with zero of six toward the next level. Unmet
  Guardians never display a level. Board checkpoints use the same values.
- First meetings appear after the mission dialog closes. Later/replayed
  completions show a dismissible progress note. Multiple meetings are queued;
  acknowledging one does not discard another. Reload/session reset clears this
  explicitly labeled preview, including the grant ledger.
- No matching Express guardian endpoint exists. `TODO(GuardianProgress)` marks
  the temporary roster/state boundary. The Prisma model has `earnedAt`, `skill`
  and `guardian`, but needs cumulative practice and idempotency support before
  authenticated persistence can replace the local state.
- Phase 3 now uses explicit choice qualification for Express sample awards and
  the authored Guardian metadata in ported solo missions. Risky choices record
  participation without awarding Guardian progress. See `../scenarios/README.md`.
- The achievement/badge portion of the prototype hook belongs to assessment
  in feature 6. Its TODO identifies `Participant` and `GuardianProgress` as the
  future source. No achievement screen or reward shop was migrated here.

## Review and verification

Open Guardians from the navigation, inspect all six skills, finish a school
mission preview to meet Echo, then replay it. The count stays at one and the
first-meeting screen does not repeat. Echo's board checkpoint and roster card
both show level 1 and one of six practices.

`npm test` covers idempotency, independent guardian progress, level boundaries,
meeting queue order and reset behavior. `npm run test:e2e` covers the mobile
selector, first meeting, replay, checkpoint consistency and the prior city-board
flows. `npm run test:dev` checks the development build. Browser verification on
this machine uses `PLAYWRIGHT_CHANNEL=chrome`.

Phase 3 has now been ported separately; stop for review before phase 4 (voting).
