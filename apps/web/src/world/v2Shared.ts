// The subset of V2's @shieldquest/shared that the ported Guardian art reads.
// name / creature / color are copied verbatim from ShieldQuest-V2 packages/shared/src/framework.ts:
// the procedural geometry derives every paper tone from `color`, so these must not change.
export type GuardianId = 'cluepaw' | 'echo' | 'verifox' | 'bytebuddy' | 'beacon' | 'shieldfin';

export interface GuardianArt {
  id: GuardianId;
  name: string;
  creature: string;
  color: string;
}

export const GUARDIANS: readonly GuardianArt[] = [
  { id: 'cluepaw', name: 'Cluepaw', creature: 'origami cat with ink paw prints', color: '#f59e0b' },
  { id: 'echo', name: 'Echo', creature: 'origami otter', color: '#a78bfa' },
  { id: 'verifox', name: 'VeriFox', creature: 'origami fox with a magnifier-fold tail', color: '#fb7185' },
  { id: 'bytebuddy', name: 'ByteBuddy', creature: 'folded cube robot with a fold-out screen face', color: '#38bdf8' },
  { id: 'beacon', name: 'Beacon', creature: 'origami lantern firefly', color: '#facc15' },
  { id: 'shieldfin', name: 'Shieldfin', creature: 'origami manta ray whose wings spread into a shield', color: '#2dd4bf' },
];

export const guardianById = (id: GuardianId): GuardianArt => GUARDIANS.find((g) => g.id === id)!;

/** Only `timeOfDay` is read (by kit/Lighting). */
export interface Mission {
  timeOfDay: 'morning' | 'afternoon' | 'evening' | 'night';
}
