-- ShieldQuest schema. Idempotent: safe to run on every start.
--
-- Data minimisation is the design constraint. There is no column anywhere for
-- a real name, NRIC, phone number, email, address or school ID. A participant
-- is a random UUID plus the codename they picked in the game, and everything
-- belongs to a session that is deleted after DATA_RETENTION_DAYS.

CREATE TABLE IF NOT EXISTS sessions (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code                text NOT NULL UNIQUE,
  age_band            text NOT NULL CHECK (age_band IN ('B10_13', 'B14_16', 'B17_24')),
  status              text NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'closed')),
  leaderboard_enabled boolean NOT NULL DEFAULT false,
  created_at          timestamptz NOT NULL DEFAULT now(),
  closed_at           timestamptz
);

CREATE TABLE IF NOT EXISTS squads (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid NOT NULL REFERENCES sessions (id) ON DELETE CASCADE,
  name       text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (session_id, name)
);

CREATE TABLE IF NOT EXISTS participants (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid NOT NULL REFERENCES sessions (id) ON DELETE CASCADE,
  squad_id   uuid REFERENCES squads (id) ON DELETE SET NULL,
  -- The in-game codename ("Swift Falcon"), never a real name.
  handle     text NOT NULL,
  -- What the device holds to prove it joined. Stored hashed.
  token_hash text NOT NULL UNIQUE,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS participants_squad ON participants (squad_id);

-- One Think–Vote–Explain vote. `round_key` identifies the decision
-- (scenario id + turn), so a squad voting on the same scenario is one round.
CREATE TABLE IF NOT EXISTS votes (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id     uuid NOT NULL REFERENCES sessions (id) ON DELETE CASCADE,
  squad_id       uuid REFERENCES squads (id) ON DELETE SET NULL,
  participant_id uuid NOT NULL REFERENCES participants (id) ON DELETE CASCADE,
  round_key      text NOT NULL,
  choice_id      text NOT NULL,
  outcome        text CHECK (outcome IN ('SAFE', 'CAUTIOUS', 'RISKY')),
  created_at     timestamptz NOT NULL DEFAULT now(),
  UNIQUE (participant_id, round_key)
);
CREATE INDEX IF NOT EXISTS votes_round ON votes (squad_id, round_key);

CREATE TABLE IF NOT EXISTS minigame_scores (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id     uuid NOT NULL REFERENCES sessions (id) ON DELETE CASCADE,
  participant_id uuid NOT NULL REFERENCES participants (id) ON DELETE CASCADE,
  game           text NOT NULL,
  score          integer NOT NULL CHECK (score >= 0),
  created_at     timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS assessments (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id     uuid NOT NULL REFERENCES sessions (id) ON DELETE CASCADE,
  participant_id uuid NOT NULL REFERENCES participants (id) ON DELETE CASCADE,
  phase          text NOT NULL CHECK (phase IN ('pre', 'post', 'followup')),
  answers        jsonb NOT NULL,
  created_at     timestamptz NOT NULL DEFAULT now(),
  UNIQUE (participant_id, phase)
);
