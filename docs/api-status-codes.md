# ShieldQuest API — response codes

The status codes this API uses, what each one means **here**, and the ones it
deliberately never returns.

This is a contract, not a tutorial. A general HTTP reference lists every code in
the registry; most of them are meaningless for a crime-prevention workshop tool
that has no accounts, no payments and no file uploads. What follows is the
subset ShieldQuest actually needs, each tied to a real endpoint and a real rule
from the proposal.

Two things shape almost every decision on this page:

1. **Participants have no accounts.** The proposal commits to "no install and no
   accounts". A youth joins a session by typing a six-character code, and that
   code plus a random pseudonymous participant ID is the entire identity model.
   So `401 Unauthorized` is a _facilitator_ code here and a participant will
   never see one.
2. **Data minimisation is a commitment, not a preference.** No names, NRICs,
   phone numbers, addresses or banking data are collected — which constrains
   what an error body is allowed to say, not just what a request body is allowed
   to carry. See [Error bodies](#error-bodies).

> **Scope.** Most of ShieldQuest does not touch the network at all. The player
> app in `src/` is local-first: the board, the engine, the scenarios and the
> save are all on the device, and a run completes with the Wi-Fi off. This API
> exists for the _facilitated_ half — rooms, squads, the Think–Vote–Explain
> flow, and the Scenario Management Portal. The Express scaffold is archived at
> the `v1-archive` tag (`server/`) and is not yet ported to v2.

---

## The response envelope

Every response is JSON. Every **error** response is exactly this shape:

```json
{ "error": { "code": "NOT_FOUND", "message": "Route not found." } }
```

`error.code` is a stable, machine-readable string. `error.message` is one
sentence of plain English for a facilitator. Clients branch on `error.code` and
on the HTTP status — never on the message text, which is allowed to be reworded
for clarity at any time.

Success responses carry their payload under `data`, with `mode` naming where it
came from while the database is still unconnected:

```json
{ "mode": "demo", "data": { "…": "…" } }
```

---

## Success — 2xx

| Code  | Name       | When ShieldQuest returns it                                                                                                                                                                                                                                                                                                    |
| ----- | ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `200` | OK         | Any read that found something: `GET /api/scenarios`, `GET /api/scenarios/:id`, `GET /api/sessions/:code`, `GET /api/health`.                                                                                                                                                                                                   |
| `201` | Created    | A facilitator opened a room (`POST /api/sessions`) or a device joined one (`POST /api/sessions/:code/join`). Carries a `Location` header pointing at the created resource.                                                                                                                                                     |
| `202` | Accepted   | **A youth submitted a mission idea.** The request was accepted for educator moderation and has _not_ been published. This is the correct code and `201` is not: the proposal's Youth-Created Missions pipeline has no publish path out of the youth queue, so replying "created" would describe something that did not happen. |
| `204` | No Content | A draft scenario was deleted, or a facilitator ended a session. Nothing to return.                                                                                                                                                                                                                                             |

### 202 is load-bearing

The portal's youth queue converts an accepted submission into a **draft** for a
reviewer, and a human publishes it or does not (`src/portal/types.ts`,
`YouthMissionStatus`). A `201 Created` on submission would tell a young person
their scenario is live when it is sitting in a moderation queue — and if the
client believed it, the safeguarding step would be invisible in the UI. Use
`202`, and put the queue position in `data`.

---

## Redirection — 3xx

| Code  | Name         | When ShieldQuest returns it                                                      |
| ----- | ------------ | -------------------------------------------------------------------------------- |
| `304` | Not Modified | The client's `If-None-Match` matched the current `ETag` on the scenario library. |

`304` earns its place because of one line in the proposal: low-bandwidth access
in school halls and community venues. The scenario library is the largest thing
the client ever fetches and it changes rarely, so a room of 30 devices
revalidating with an `ETag` on a shared school connection sends 30 empty
responses instead of 30 copies of the library.

The API itself never issues `301`, `302`, `307` or `308`. Path handling belongs
to the SPA router (`src/router.ts`) and to the host, not to a JSON endpoint.

---

## Client errors — 4xx

| Code  | Name                   | When ShieldQuest returns it                                                                                                                                                                                                 |
| ----- | ---------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `400` | Bad Request            | The body is not valid JSON, or does not match the schema. Already implemented: the Express error handler maps a `SyntaxError` from the JSON parser to `400`, and `POST /api/votes` rejects anything failing its Zod schema. |
| `401` | Unauthorized           | **Facilitator and reviewer endpoints only.** Missing or invalid credentials on a portal route. Never returned to a participant — they have nothing to authenticate with.                                                    |
| `403` | Forbidden              | The caller is known but is not allowed: a reviewer trying to publish, or **a request for scenario content outside the session's age band**.                                                                                 |
| `404` | Not Found              | Unknown route, unknown scenario ID, unknown session code. Also returned in place of `403`/`410` wherever distinguishing them would leak whether a code exists — see below.                                                  |
| `405` | Method Not Allowed     | A known path with a verb it does not support. Send `Allow`.                                                                                                                                                                 |
| `409` | Conflict               | The request is valid but the current state refuses it: a squad already at five members, a second vote from a participant in the same round, publishing a scenario that is already published.                                |
| `410` | Gone                   | A session that has ended or expired — **only** to a caller already holding a participant token for it.                                                                                                                      |
| `413` | Payload Too Large      | Over the 16 KB JSON limit. Already implemented.                                                                                                                                                                             |
| `415` | Unsupported Media Type | A body that is not `application/json`.                                                                                                                                                                                      |
| `422` | Unprocessable Content  | Well-formed, schema-valid, and still refused by a rule.                                                                                                                                                                     |
| `429` | Too Many Requests      | Rate limit tripped. See [Rate limiting in a classroom](#rate-limiting-in-a-classroom).                                                                                                                                      |

### 403 carries an age-band rule, not just a permission

The proposal segments content into three bands (10–13, 14–16, 17–24) and the
engine already enforces this client-side — `engine.test.ts` asserts that
out-of-band content cannot reach a 10–13 session. The API has to enforce the
same thing server-side, because a client-side rule is a suggestion. A request
from a 10–13 session for a money-mule scenario is `403`, not `404`: the resource
exists, the session may not have it, and a reviewer reading the logs needs to be
able to tell those two apart.

### 400 versus 422

Draw the line at _schema_, not at _taste_:

- **`400`** — the server could not make sense of the body. Malformed JSON, a
  missing required field, a string where a UUID belongs.
- **`422`** — the body parsed and matched the schema, and a rule still says no.
  The clearest ShieldQuest case is a youth mission submission whose text
  contains something that looks like a phone number or an NRIC. It is a valid
  string in a valid field; the safeguard rejects it anyway.

Returning `400` for both is not wrong, but it collapses "your client has a bug"
and "a human needs to reword this", and only one of those is worth showing to
the person who typed it.

### 404 as a deliberate non-answer

Session codes are six characters from a 28-symbol alphabet with no vowels
(`SESSION_CODE_ALPHABET` in `src/game/engine.ts`). That is a large space, but it
is not a secret, and an endpoint that answers "that code exists but has ended"
is an oracle for anyone enumerating codes to find live rooms full of minors.

So, for an **unauthenticated** lookup: an unknown code, an expired code and a
closed code all return `404` with the same message. `410 Gone` is reserved for a
caller who already holds a participant token for that session — they have
already proved they were in the room, so telling them it has ended reveals
nothing and is far more useful than a `404`.

### Rate limiting in a classroom

The limit must be keyed to the **session code being attempted**, not to the
client IP.

A pilot session is 20–30 participants in one room, which in practice is 20–30
devices behind one school NAT. An IP-based limit on `POST /api/sessions/:code/join`
would throttle a legitimate class during onboarding — the 15-minute segment
where everyone joins at once — while barely inconveniencing an attacker on a
mobile connection. Key the limit to the code, and return `429` with a
`Retry-After` header.

---

## Server errors — 5xx

| Code  | Name                  | When ShieldQuest returns it                                                     |
| ----- | --------------------- | ------------------------------------------------------------------------------- |
| `500` | Internal Server Error | Something the server did not anticipate. The message is always the generic one. |
| `501` | Not Implemented       | The endpoint is scaffolded and not connected.                                   |
| `503` | Service Unavailable   | Database unreachable, or a deliberate maintenance window. Send `Retry-After`.   |

### 501 is a design decision, and it should survive the port

`server/services/notImplemented.ts` carries the comment _"Return an explicit
placeholder, never a fake successful write."_ Every unbuilt endpoint — session
creation, squad assignment, vote persistence, scenario writes — returns `501`
with `NOT_IMPLEMENTED` rather than a `200` and a stubbed object.

Keep that. A scaffold that returns plausible success is the single fastest way
to demonstrate a feature to a grant assessor that does not exist, and this
project has a rule against that everywhere else (the portal labels simulated
figures; achievements are derived rather than stored). `501` is that rule
expressed as a status code.

### 503 and the offline commitment

The player app must treat `503` — and a failed fetch, and a timeout — as
identical: fall back to local play and carry on. Gameplay never depends on the
network, so a server outage during a pilot session degrades the _facilitated_
features (live squad voting, aggregate signals) and nothing else. The session
still runs. Do not surface a server error inside a scenario sheet; a youth
mid-decision is not the audience for infrastructure news.

---

## Error bodies

Three rules, all of them downstream of data minimisation:

1. **Never echo submitted content back.** A validation error names the _field_,
   not the value. `"participantId must be a UUID"` — never
   `"'+65 9123 4567' is not a UUID"`, which would write a phone number into the
   API logs of a system that promised not to collect one.
2. **Never include a stack trace, query or internal identifier.** `500` always
   returns the generic message; the detail goes to the server log.
3. **Never say more than the caller has earned.** See `404` above.

---

## Codes ShieldQuest does not use

Listed because "we considered it and no" is more useful to whoever picks this up
than silence.

| Code                              | Why not                                                                                                                                                         |
| --------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `100 Continue`                    | No endpoint accepts a body large enough to be worth negotiating; the limit is 16 KB.                                                                            |
| `206 Partial Content`             | Nothing is streamed or range-requested. The scenario library is small and cached whole.                                                                         |
| `401` _for participants_          | There are no participant accounts, by design. A participant who has no valid session is `404`, not `401` — there is nothing they could have authenticated with. |
| `402 Payment Required`            | Nothing in ShieldQuest costs money. Coins and Shield Tokens are in-game and cannot be bought, cashed out or topped up.                                          |
| `407`, `421`, `426`, `506`, `511` | Infrastructure concerns that belong to the host, not to this application.                                                                                       |
| `418`                             | No.                                                                                                                                                             |
| `451`                             | Content is moderated before publication by an educator, so there is no takedown path that would produce this.                                                   |

---

## Reference

Status code semantics follow RFC 9110 (HTTP Semantics). Where this document and
the RFC disagree, the RFC is right and this document is a bug.

Related: [`README.md`](../README.md) for the architecture and the commitments
these codes enforce; `server/` at the `v1-archive` tag for the Express scaffold
being ported.
