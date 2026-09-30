import { Hono } from 'hono';
import { z } from 'zod';

import { query } from '../db.js';
import { ApiError, body, hashToken, notFound, ok } from '../http.js';
import { toSquad } from '../realtime.js';

export const votes = new Hono();

const RoundKey = z
  .string()
  .min(1)
  .max(80)
  .regex(/^[A-Za-z0-9:_-]+$/);

const CastVote = z.object({
  token: z.string().min(10).max(100),
  roundKey: RoundKey,
  choiceId: z
    .string()
    .min(1)
    .max(60)
    .regex(/^[A-Za-z0-9:_-]+$/),
  outcome: z.enum(['SAFE', 'CAUTIOUS', 'RISKY']).optional(),
});

const Reveal = z.object({
  token: z.string().min(10).max(100),
  roundKey: RoundKey,
});

interface Voter {
  participant_id: string;
  session_id: string;
  squad_id: string | null;
  status: 'open' | 'closed';
}

/**
 * Who a token belongs to.
 *
 * A token for a closed session is `410`, not `404`: the caller has already
 * proved they were in the room, so telling them it ended leaks nothing.
 */
async function voter(token: string): Promise<Voter & { squad_id: string }> {
  const found = await query<Voter>(
    `SELECT p.id AS participant_id, p.session_id, p.squad_id, s.status
       FROM participants p JOIN sessions s ON s.id = p.session_id
      WHERE p.token_hash = $1`,
    [hashToken(token)],
  );
  const row = found.rows[0];
  if (!row) throw notFound();
  if (row.status === 'closed') throw new ApiError(410, 'SESSION_ENDED', 'This session has ended.');
  if (!row.squad_id) throw new ApiError(409, 'NO_SQUAD', 'You are not in a squad.');
  return row as Voter & { squad_id: string };
}

async function progress(squadId: string, roundKey: string) {
  const found = await query<{ voted: number; members: number }>(
    `SELECT
       (SELECT count(*)::int FROM votes WHERE squad_id = $1 AND round_key = $2) AS voted,
       (SELECT count(*)::int FROM participants WHERE squad_id = $1) AS members`,
    [squadId, roundKey],
  );
  return found.rows[0] ?? { voted: 0, members: 0 };
}

async function tally(squadId: string, roundKey: string) {
  const found = await query<{ choiceId: string; count: number }>(
    `SELECT choice_id AS "choiceId", count(*)::int AS count
       FROM votes WHERE squad_id = $1 AND round_key = $2
      GROUP BY choice_id ORDER BY count DESC`,
    [squadId, roundKey],
  );
  return found.rows;
}

/**
 * Cast a private vote. The squad hears how many have voted, never who or what,
 * and the reveal fires by itself once everyone in the squad is in.
 */
votes.post('/', async (c) => {
  const input = await body(c, CastVote);
  const who = await voter(input.token);

  try {
    await query(
      `INSERT INTO votes (session_id, squad_id, participant_id, round_key, choice_id, outcome)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [
        who.session_id,
        who.squad_id,
        who.participant_id,
        input.roundKey,
        input.choiceId,
        input.outcome ?? null,
      ],
    );
  } catch (error) {
    if ((error as { code?: string }).code === '23505') {
      throw new ApiError(409, 'ALREADY_VOTED', 'You have already voted in this round.');
    }
    throw error;
  }

  const counts = await progress(who.squad_id, input.roundKey);
  toSquad(who.session_id, who.squad_id, {
    type: 'vote:progress',
    squadId: who.squad_id,
    roundKey: input.roundKey,
    ...counts,
  });

  const complete = counts.voted >= counts.members;
  if (complete) {
    toSquad(who.session_id, who.squad_id, {
      type: 'vote:reveal',
      squadId: who.squad_id,
      roundKey: input.roundKey,
      tally: await tally(who.squad_id, input.roundKey),
    });
  }
  return ok(c, { ...counts, revealed: complete }, 201);
});

/**
 * Reveal now, without waiting for everyone.
 *
 * Any squad member can call it — a squad of five with one phone gone flat
 * should not be stuck on "4 of 5 voted" for the rest of the session.
 */
votes.post('/reveal', async (c) => {
  const input = await body(c, Reveal);
  const who = await voter(input.token);
  const results = await tally(who.squad_id, input.roundKey);
  toSquad(who.session_id, who.squad_id, {
    type: 'vote:reveal',
    squadId: who.squad_id,
    roundKey: input.roundKey,
    tally: results,
  });
  return ok(c, { tally: results });
});
