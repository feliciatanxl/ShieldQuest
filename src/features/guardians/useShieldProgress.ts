import { useMemo } from 'react';
import { COMPETENCY_ORDER, type Competency } from '../../../types/guardians';
import type { Achievement, DistrictBadge, ResolvedAchievement } from '../../../types/assessment';
import { useSessionStore } from '../../stores/sessionStore';
import { useWorld } from '../city-board/hooks/useWorld';
import { guardians } from './data';
import { guardianStanding } from './progress';
import { ACHIEVEMENTS, DISTRICT_BADGES } from '../assessment/data';

function achievementProgress(
  achievement: Achievement,
  data: {
    skillCounts: Record<Competency, number>;
    completedKinds: string[];
    guardianProgress: Record<string, number>;
    skillBreadth: number;
  },
): number {
  const { metric } = achievement;
  switch (metric.kind) {
    case 'COMPETENCY':
      return data.skillCounts[metric.competency] ?? 0;
    case 'NODE_KIND':
      return data.completedKinds.filter((k) => k === metric.nodeKind).length;
    case 'GUARDIAN':
      return data.guardianProgress[metric.guardianId] ?? 0;
    case 'SKILL_BREADTH':
      return data.skillBreadth;
  }
}

/** Personal practice only: no comparison, ranking, or inferred participant traits. */
export function useShieldProgress() {
  const session = useSessionStore();
  const { districts, progress } = useWorld();
  return useMemo(() => {
    const completedNodes = districts.flatMap((district) =>
      district.nodes.filter((node) => node.completed).map((node) => ({ node, district })),
    );
    const skillCounts = Object.fromEntries(COMPETENCY_ORDER.map((skill) => [skill, 0])) as Record<
      Competency,
      number
    >;
    for (const { node } of completedNodes) skillCounts[node.primaryCompetency] += 1;
    const skillsPractised = COMPETENCY_ORDER.filter((skill) => skillCounts[skill] > 0);
    const completedKinds = completedNodes.map(({ node }) => node.kind);

    const guardianStandings = guardians.map((guardian) => {
      const met = session.guardians.includes(guardian.id);
      const cumulative = met ? (session.guardianProgress[guardian.id] ?? 0) : 0;
      return { guardian, met, cumulative, ...guardianStanding(guardian, cumulative) };
    });

    const achievements: ResolvedAchievement[] = ACHIEVEMENTS.map((a) => {
      const raw = achievementProgress(a, {
        skillCounts,
        completedKinds,
        guardianProgress: session.guardianProgress,
        skillBreadth: skillsPractised.length,
      });
      const value = Math.min(a.target, raw);
      return { ...a, progress: value, earned: value >= a.target };
    });

    const badges: DistrictBadge[] = session.districtBadges
      .map((id) => DISTRICT_BADGES[id])
      .filter(Boolean);

    return {
      profile: {
        metGuardians: session.guardians,
        guardianProgress: session.guardianProgress,
        currentGuardianId: session.currentGuardianId,
        shieldTokens: session.shieldTokens,
        earnedAchievements: session.earnedAchievements,
        districtBadges: session.districtBadges,
      },
      completedNodes,
      skillCounts,
      skillsPractised,
      districtsVisited: districts.filter((district) => district.completed > 0).length,
      districtCount: districts.length,
      guardianStandings,
      achievements,
      badges,
      progress,
      // TODO(Participant, GuardianProgress): persistent earned achievements and badges require backend sync.
    };
  }, [
    districts,
    progress,
    session.guardians,
    session.guardianProgress,
    session.currentGuardianId,
    session.shieldTokens,
    session.earnedAchievements,
    session.districtBadges,
  ]);
}
