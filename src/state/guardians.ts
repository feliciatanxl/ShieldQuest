import type { ShieldCompetency, ShieldProgress } from './shield'

export const guardians = [
  { id: 'cluepaw', name: 'Cluepaw', competency: 'S', challenge: 'Spot the Risk' },
  { id: 'echo', name: 'Echo', competency: 'H', challenge: 'Hold Before Acting' },
  { id: 'verifox', name: 'VeriFox', competency: 'I', challenge: 'Identify the Influence' },
  { id: 'bytebuddy', name: 'ByteBuddy', competency: 'E', challenge: 'Evaluate Consequences' },
  { id: 'beacon', name: 'Beacon', competency: 'L', challenge: 'Lead the Right Choice' },
  { id: 'shieldfin', name: 'Shieldfin', competency: 'D', challenge: 'Defend Your Community' },
] as const satisfies readonly { id: string; name: string; competency: ShieldCompetency; challenge: string }[]

export type GuardianId = typeof guardians[number]['id']

export function readCollectedGuardians(value: unknown, shield: ShieldProgress): GuardianId[] {
  if (!Array.isArray(value)) return []
  return guardians
    .filter(({ id, competency }) => shield[competency] && value.includes(id))
    .map(({ id }) => id)
}
