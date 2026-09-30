# ShieldQuest server

The facilitated half of ShieldQuest: rooms, squads and live Think–Vote–Explain
voting. Solo play never touches it, and the game must keep working when it is
down. Status codes and error bodies follow [`../docs/api-status-codes.md`](../docs/api-status-codes.md).

## Run it locally

```bash
cd server
npm install
cp .env.example .env   # then paste DATABASE_URL (see below)
npm run dev
```

Check it: `curl http://localhost:8787/api/health` should return `"db":"up"`.

`DATABASE_URL` for local work is Railway → Postgres → Variables →
**`DATABASE_PUBLIC_URL`** (the private `DATABASE_URL` only resolves inside
Railway). `.env` is gitignored. Never commit it, since this repo is public.

The schema in `src/schema.sql` is applied on every boot, and all of it is
idempotent. `npm run migrate` applies it without starting the server.

## Deploy on Railway

One service serves everything: the public site, `/play`, `/portal`, `/api`
and `/ws`, all on one origin. The build and start commands live in
[`../railway.json`](../railway.json).

1. In the ShieldQuest project: **+ Create → GitHub Repo → feliciatanxl/ShieldQuest**.
2. Service **Settings**: leave Root Directory **empty** (the repo root), region
   Southeast Asia (Singapore).
3. Service **Variables**:
   - `DATABASE_URL` = `${{Postgres.DATABASE_URL}}` (a reference, so it uses the private network)
   - `FACILITATOR_KEY` = a long random string, **not** the one in your local `.env`
   - `DATA_RETENTION_DAYS` = `90`
4. **Settings → Networking → Generate Domain**. That is the site's address.

`CORS_ORIGINS` is not needed in production, because the site and the API share
an origin. Locally, `vite` proxies `/api` and `/ws` to this server, so run
`npm run dev` in both the repo root and `server/`.

## API

| Method   | Path                                     | Who         | What                                                   |
| -------- | ---------------------------------------- | ----------- | ------------------------------------------------------ |
| `GET`    | `/api/health`                            | anyone      | `200` if the database answers, `503` if not            |
| `POST`   | `/api/sessions`                          | facilitator | Open a room: `{ ageBand, squads?, leaderboard? }`      |
| `GET`    | `/api/sessions/:code`                    | anyone      | Age band and squads with space; `404` if not open      |
| `POST`   | `/api/sessions/:code/join`               | participant | `{ handle, squadId? }` returns a token, kept on device |
| `DELETE` | `/api/sessions/:code`                    | facilitator | Close the room; connected devices are told             |
| `POST`   | `/api/votes`                             | participant | `{ token, roundKey, choiceId, outcome? }`              |
| `POST`   | `/api/votes/reveal`                      | participant | Reveal the squad's tally without waiting for everyone  |
| `GET`    | `/api/sessions/:code/leaderboard`        | facilitator | `501`, not built yet                                   |
| `*`      | `/api/minigames/*`, `/api/assessments/*` | —           | `501`, not built yet                                   |

Facilitator routes need the `X-Facilitator-Key` header.

**Live updates:** open a WebSocket to `/ws` and send one message first:
`{ "type": "hello", "token": "…" }` (participant) or
`{ "type": "hello", "facilitatorKey": "…", "code": "ABC123" }` (projector).
You then receive `vote:progress` (how many have voted), `vote:reveal` (choice
tallies) and `session:closed`. No message ever says who voted for what.

## What it stores

Session code, age band, squads, a random participant ID with the in-game
codename (letters only, so digits and phone numbers are refused), votes,
and later mini-game scores and pre/post assessments. No names, NRIC, phone
numbers, emails or school IDs. Tokens are stored hashed. Sessions and
everything in them are deleted after `DATA_RETENTION_DAYS`.
