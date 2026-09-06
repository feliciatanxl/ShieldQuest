# City board migration — feature 1

Ports the read-only SecurePi_SPF board, four illustrated districts, dice turns,
landing cards, district discovery, district sheets and full district routes.
`CityBoard` is the entry point from `App`. Navigation and travel use Zustand,
following ShieldQuest's existing view-state approach. Shared contracts live in
`types/city-board.ts`; `digital` remains the backend's canonical district ID.

## Data boundaries

- `GET /api/scenarios` populates district routes and launches the existing
  ShieldQuest scenario player. Express currently responds with `mode: demo`;
  this migration does not claim database persistence. API loading, retry,
  failure and empty results are handled explicitly. No mock fallback masks an
  API failure. Static board art and discovery remain available offline.
- Existing API missions are separate entries. Prototype activities retain their
  names and previews. Phase 3 now enables Easy Money? and Jayden's Offer; the
  remaining activities stay planned until their feature migrations. Prototype
  IDs do not match the backend's existing demos.
- Temporary world/board content has `TODO(Scenario.content)` comments.
  Community Hub requires an extension to Prisma's `District` enum before it
  can be persisted as `Scenario.district`.
- Travel, discovered districts and encountered cards are in-memory only.
  `TODO(Participant)` identifies the missing fields and authenticated endpoint.
- Guardian portraits and district activity marks were presentation dependencies
  in feature 1. Feature 2 now owns the roster and checkpoint practice counters;
  see `src/features/guardians/README.md`. Phase 3 now owns the solo scenario
  engine. Voting, mini-game, assessment and admin migrations remain separate steps.
- Flash alerts await `Scenario` API metadata. Reward/settings destinations
  explain that they are coming later and provide a return to the city.

## Review

Run `npm run dev`. Open the city board, roll a die, dismiss a landing sheet,
discover each district directly, and open a full district route. Existing API
missions appear at the beginning of each supported district's route. Discovery
and dice movement never increment completion counts or reward balances.

Board CSS retains the prototype's tokens and artwork. Existing app CSS is in
the base cascade layer so board utilities retain their intended styling.

Checks: `npm run build`, `npm test`, `npm run test:e2e`, and `npm run test:dev`.
Verified on 2026-09-06: production build, six backend/unit tests, eleven
end-to-end tests, and the development startup test passed. Browser checks used
`PLAYWRIGHT_CHANNEL=chrome`; Edge stalled during browser shutdown on this machine.
Desktop and mobile screenshots were inspected. All 42 prototype files read for
the port were hash-checked afterwards and remained unchanged.

Phases 2 and 3 have since been ported. See their feature READMEs; stop for review
before feature 4 (group decisions).
