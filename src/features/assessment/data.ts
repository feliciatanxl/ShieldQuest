// TODO(Participant, GuardianProgress): persistent earned achievements, district badges, and assessment responses require schema models and authorized endpoints.
import {
  GUARDIAN_BEACON,
  GUARDIAN_BYTEBUDDY,
} from '../city-board/data/reference';
import type { Achievement, DistrictBadge } from '../../../types/assessment';
import type { CityDistrictId } from '../../../types/city-board';

/**
 * Achievements.
 *
 * Personal milestones against the player's own practice. There is no
 * leaderboard, no percentile, no cohort comparison and no visibility of anyone
 * else's progress anywhere in this app — a crime-prevention programme has no
 * business ranking the young people taking part in it against each other.
 */
export const ACHIEVEMENTS: Achievement[] = [
  {
    id: 'ach_risk_spotter',
    title: 'Risk Spotter',
    description: 'Practise Spot the Risk five times.',
    target: 5,
    metric: { kind: 'COMPETENCY', competency: 'SPOT' },
  },
  {
    id: 'ach_pause_first',
    title: 'Pause First',
    description: 'Practise Hold Before Acting five times.',
    target: 5,
    metric: { kind: 'COMPETENCY', competency: 'HOLD' },
  },
  {
    id: 'ach_peer_protector',
    title: 'Peer Protector',
    description: 'Complete three Peer Shield missions.',
    target: 3,
    metric: { kind: 'NODE_KIND', nodeKind: 'PEER_SHIELD' },
  },
  {
    id: 'ach_trusted_helper',
    title: 'Trusted Helper',
    description: 'Strengthen Beacon through safe-reporting decisions.',
    target: 3,
    metric: { kind: 'GUARDIAN', guardianId: GUARDIAN_BEACON },
  },
  {
    id: 'ach_clear_eyed',
    title: 'Clear-Eyed',
    description: 'Practise Identify the Influence five times.',
    target: 5,
    metric: { kind: 'COMPETENCY', competency: 'IDENTIFY' },
  },
  {
    id: 'ach_account_keeper',
    title: 'Account Keeper',
    description: 'Strengthen ByteBuddy through cyber-hygiene decisions.',
    target: 3,
    metric: { kind: 'GUARDIAN', guardianId: GUARDIAN_BYTEBUDDY },
  },
  {
    id: 'ach_community_defender',
    title: 'Community Defender',
    description: 'Practise all six S.H.I.E.L.D. skills.',
    target: 6,
    metric: { kind: 'SKILL_BREADTH' },
  },
];

/** Earned by finishing every playable activity in a district. Never ranked. */
export const DISTRICT_BADGES: Record<CityDistrictId, DistrictBadge> = {
  school: {
    districtId: 'school',
    name: 'Street Guardian',
    blurb: 'You practised holding your ground where the pressure is personal.',
  },
  retail: {
    districtId: 'retail',
    name: 'Retail Watch',
    blurb: 'You practised reading a dare for what it actually costs.',
  },
  digital: {
    districtId: 'digital',
    name: 'Digi Defender',
    blurb: 'You practised spotting an easy-money offer for what it is.',
  },
  community: {
    districtId: 'community',
    name: 'Community Champion',
    blurb: 'You practised stepping in for someone else, and finding help.',
  },
};

export function findAchievement(id: string): Achievement | undefined {
  return ACHIEVEMENTS.find((a) => a.id === id);
}
