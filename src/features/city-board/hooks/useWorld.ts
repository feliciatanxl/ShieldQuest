import type { ResolvedNode, ResolvedDistrict } from '../../../../types/city-board';
export type { ResolvedNode, ResolvedDistrict } from '../../../../types/city-board';
import { useMemo } from 'react';
import {
  DISTRICTS,
  NODE_DIGI_FINALE,
  NODE_EASY_MONEY,
  NODE_PEER_JAYDEN,
} from '../data/world-data';
import { usePlayer } from './useCityPlayer';
import { useCityBoardStore } from '../../../stores/cityBoardStore';
import { MOCK_GUARDIANS } from '../data/reference';
import type { CityDistrictId, CityMissionNode, WorldProgress } from '../../../../types/city-board';

/** A node with its live state resolved against the player's own progress. */

/**
 * Resolves the city board against the player's own completions.
 *
 * The board is deliberately not gated behind chance: every district is
 * reachable from the first second, and the only locked content unlocks through
 * the player's own completions *inside the same district*, so the requirement
 * printed on a locked tile is always something they can act on immediately.
 *
 * `PLANNED` nodes never become playable — they are designed content that is out
 * of scope for this prototype, and are labelled as such rather than pretending
 * to be earnable.
 */
export function useWorld() {
  const { profile, newlyUnlockedNodeIds } = usePlayer();
  const completed = profile.completedActivities;
  const scenarios = useCityBoardStore((state) => state.scenarios);

  return useMemo(() => {
    const districts: ResolvedDistrict[] = DISTRICTS.map((district) => {
      // The two authored solo flows are available; later features stay explicitly planned.
      // API samples remain separate entries because they are different authored content.
      const catalogue: CityMissionNode[] = [
        ...scenarios
          .filter((scenario) => scenario.district === district.id)
          .map((scenario): CityMissionNode => ({
            id: scenario.id,
            districtId: district.id,
            kind: 'SCENARIO',
            title: scenario.title,
            summary: scenario.summary,
            primaryCompetency:
              MOCK_GUARDIANS.find((g) => g.id === scenario.guardian)?.competency ?? 'SPOT',
            guardianId: scenario.guardian,
            estimatedMinutes: scenario.durationMinutes,
            availability: 'OPEN',
            href: `/mission/${encodeURIComponent(scenario.id)}`,
            chapterRole: 'Mission preview',
          })),
        ...district.nodes.map((node): CityMissionNode => ({
          ...node,
          availability: [NODE_EASY_MONEY, NODE_PEER_JAYDEN, NODE_DIGI_FINALE].includes(node.id)
            ? node.availability
            : 'PLANNED',
          href: [NODE_EASY_MONEY, NODE_PEER_JAYDEN, NODE_DIGI_FINALE].includes(node.id)
            ? node.href
            : undefined,
        })),
      ];
      const builtNodes = catalogue.filter((node) => node.availability !== 'PLANNED');
      const doneInDistrict = builtNodes.filter((node) => completed.includes(node.id)).length;

      const nodes: ResolvedNode[] = catalogue.map((node) => {
        const isDone = completed.includes(node.id);
        const needed = node.requiredInDistrict ?? 0;
        const shortfall = Math.max(0, needed - doneInDistrict);

        return {
          ...node,
          completed: isDone,
          playable:
            node.availability === 'OPEN' || (node.availability === 'UNLOCK' && shortfall === 0),
          remainingToUnlock: node.availability === 'UNLOCK' ? shortfall : 0,
          unlockCompleted: node.availability === 'UNLOCK' ? Math.min(doneInDistrict, needed) : 0,
          unlockRequired: node.availability === 'UNLOCK' ? needed : 0,
          newlyUnlocked: newlyUnlockedNodeIds.includes(node.id),
        };
      });

      const playableTotal = nodes.filter((n) => n.availability !== 'PLANNED').length;

      return {
        ...district,
        nodes,
        completed: doneInDistrict,
        total: playableTotal,
        cleared: playableTotal > 0 && doneInDistrict >= playableTotal,
        discovered: profile.discoveredDistricts.includes(district.id),
      };
    });

    const progress: WorldProgress = {
      completed: districts.reduce((sum, d) => sum + d.completed, 0),
      total: districts.reduce((sum, d) => sum + d.total, 0),
      districts: districts.map((d) => ({
        districtId: d.id,
        name: d.name,
        completed: d.completed,
        total: d.total,
      })),
    };

    return { districts, progress, currentDistrictId: profile.currentDistrictId };
  }, [
    scenarios,
    completed,
    newlyUnlockedNodeIds,
    profile.currentDistrictId,
    profile.discoveredDistricts,
  ]);
}

/** Single district view, resolved the same way. Returns null for a bad id. */
export function useDistrict(id: string): ResolvedDistrict | null {
  const { districts } = useWorld();
  return districts.find((d) => d.id === (id as CityDistrictId)) ?? null;
}
