// Engine-handoff contract shared by React, Phaser, Unity (mirrored in C# GameHandoff) and the API.
// Presentation state only: trusted progress and assessment records live on the server.

export const GAME_STATE_VERSION = 1 as const;
export type Engine = 'phaser' | 'unity';
export type Facing = 'down' | 'up' | 'left' | 'right';

/** Missions the Phaser map can hand to Unity. The funded pilot covers shop theft only. */
export const UNITY_MISSIONS = ['minimart-clue'] as const;
export type UnityMissionId = (typeof UNITY_MISSIONS)[number];

export const AVATAR_IDS = ['student', 'worker', 'poly', 'rider', 'cafe', 'hijab'] as const;
export type AvatarId = (typeof AVATAR_IDS)[number];

export interface ReturnLocation { scene: 'neighbourhood'; x: number; y: number; facing: Facing }

export interface GameHandoff {
  v: typeof GAME_STATE_VERSION;
  sessionId: string;
  avatar: { characterId: AvatarId };
  engine: Engine;
  missionId: UnityMissionId;
  checkpoint: string;
  completedObjectives: string[];
  returnTo: ReturnLocation;
}

/** What Unity reports back when it hands control to Phaser. */
export interface MissionExit {
  v: typeof GAME_STATE_VERSION;
  missionId: UnityMissionId;
  status: 'completed' | 'exited';
  checkpoint: string;
  completedObjectives: string[];
}

export type Parsed<T> = { ok: true; value: T } | { ok: false; error: string };

const ID = /^[A-Za-z0-9_-]{1,64}$/;
const isObj = (x: unknown): x is Record<string, unknown> => typeof x === 'object' && x !== null && !Array.isArray(x);
const isId = (x: unknown): x is string => typeof x === 'string' && ID.test(x);
const isNum = (x: unknown): x is number => typeof x === 'number' && Number.isFinite(x);
const ids = (x: unknown): x is string[] => Array.isArray(x) && x.length <= 64 && x.every(isId);
const oneOf = <T extends string>(list: readonly T[], x: unknown): x is T => list.includes(x as T);
const FACINGS: readonly Facing[] = ['down', 'up', 'left', 'right'];

function fail<T>(error: string): Parsed<T> { return { ok: false, error }; }

/** Validates untrusted JSON (from storage, another engine, or the network). */
export function parseHandoff(input: unknown): Parsed<GameHandoff> {
  const d = typeof input === 'string' ? safeJson(input) : input;
  if (!isObj(d)) return fail('handoff is not an object');
  if (d.v !== GAME_STATE_VERSION) return fail(`unsupported handoff version ${String(d.v)}`);
  if (!isId(d.sessionId)) return fail('invalid sessionId');
  if (!isObj(d.avatar) || !oneOf(AVATAR_IDS, d.avatar.characterId)) return fail('invalid avatar');
  if (d.engine !== 'phaser' && d.engine !== 'unity') return fail('invalid engine');
  if (!oneOf(UNITY_MISSIONS, d.missionId)) return fail('unknown missionId');
  if (!isId(d.checkpoint)) return fail('invalid checkpoint');
  if (!ids(d.completedObjectives)) return fail('invalid completedObjectives');
  const r = d.returnTo;
  if (!isObj(r) || r.scene !== 'neighbourhood' || !isNum(r.x) || !isNum(r.y) || !oneOf(FACINGS, r.facing)) return fail('invalid returnTo');
  return {
    ok: true,
    value: {
      v: GAME_STATE_VERSION, sessionId: d.sessionId, avatar: { characterId: d.avatar.characterId }, engine: d.engine,
      missionId: d.missionId, checkpoint: d.checkpoint, completedObjectives: [...d.completedObjectives],
      returnTo: { scene: 'neighbourhood', x: r.x, y: r.y, facing: r.facing },
    },
  };
}

export function parseMissionExit(input: unknown): Parsed<MissionExit> {
  const d = typeof input === 'string' ? safeJson(input) : input;
  if (!isObj(d)) return fail('mission exit is not an object');
  if (d.v !== GAME_STATE_VERSION) return fail(`unsupported version ${String(d.v)}`);
  if (!oneOf(UNITY_MISSIONS, d.missionId)) return fail('unknown missionId');
  if (d.status !== 'completed' && d.status !== 'exited') return fail('invalid status');
  if (!isId(d.checkpoint)) return fail('invalid checkpoint');
  if (!ids(d.completedObjectives)) return fail('invalid completedObjectives');
  return { ok: true, value: { v: GAME_STATE_VERSION, missionId: d.missionId, status: d.status, checkpoint: d.checkpoint, completedObjectives: [...d.completedObjectives] } };
}

export const isUnityMission = (id: string): id is UnityMissionId => oneOf(UNITY_MISSIONS, id);

function safeJson(s: string): unknown { try { return JSON.parse(s); } catch { return undefined; } }
