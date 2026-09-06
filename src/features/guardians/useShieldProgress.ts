import { useMemo } from 'react';
import { COMPETENCY_ORDER, type Competency } from '../../../types/guardians';
import { useSessionStore } from '../../stores/sessionStore';
import { useWorld } from '../city-board/hooks/useWorld';
import { guardians } from './data';
import { guardianStanding } from './progress';

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
    const guardianStandings = guardians.map((guardian) => {
      const met = session.guardians.includes(guardian.id);
      const cumulative = met ? (session.guardianProgress[guardian.id] ?? 0) : 0;
      return { guardian, met, cumulative, ...guardianStanding(guardian, cumulative) };
    });
    return {
      profile: {
        metGuardians: session.guardians,
        guardianProgress: session.guardianProgress,
        currentGuardianId: session.currentGuardianId,
      },
      completedNodes,
      skillCounts,
      skillsPractised: COMPETENCY_ORDER.filter((skill) => skillCounts[skill] > 0),
      districtsVisited: districts.filter((district) => district.completed > 0).length,
      districtCount: districts.length,
      guardianStandings,
      progress,
      // Assessment achievements/badges from the original hook belong to feature 6.
      // TODO(Participant, GuardianProgress): aggregate authenticated progress and milestones there.
    };
  }, [districts, progress, session.guardians, session.guardianProgress, session.currentGuardianId]);
}
