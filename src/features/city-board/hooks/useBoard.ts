import type { ResolvedSpace } from '../../../../types/city-board';
export type { ResolvedSpace } from '../../../../types/city-board';
import { useMemo } from 'react';
import { BOARD_SPACES, findSituationCard, normaliseBoardPosition } from '../data/board-data';
import { findNode } from '../data/world-data';
import { usePlayer } from './useCityPlayer';
import { useWorld, type ResolvedNode } from './useWorld';
import type { CityDistrictId } from '../../../../types/city-board';

/** A board space with its live state resolved against the player's progress. */

/**
 * The city track, resolved against the player's own progress.
 *
 * Nothing here consults the dice. A space's state comes from what the player
 * has completed and where their token stands — the roll only ever decides which
 * space they arrive at next.
 */
export function useBoard() {
  const { profile } = usePlayer();
  const { districts } = useWorld();

  const position = normaliseBoardPosition(profile.boardPosition);
  const completed = profile.completedActivities;
  const visited = profile.visitedSpaces;

  return useMemo(() => {
    const nodeById = new Map<string, ResolvedNode>();
    for (const district of districts) {
      for (const node of district.nodes) nodeById.set(node.id, node);
    }

    const spaces: ResolvedSpace[] = BOARD_SPACES.map((space) => {
      const node = space.nodeId ? nodeById.get(space.nodeId) : undefined;
      const planned = node?.availability === 'PLANNED';
      const locked = Boolean(node) && !node!.playable && !planned;

      return {
        ...space,
        node,
        card: space.situationCardId ? findSituationCard(space.situationCardId) : undefined,
        completed: node ? node.completed : false,
        visited: visited.includes(space.index),
        isCurrent: space.index === position,
        planned,
        locked,
        // Checkpoints always have something to show; activity spaces only when
        // the activity is actually playable.
        actionable: node ? node.playable : true,
      };
    });

    const current = spaces[position];

    /** Personal board progress: activity spaces finished, out of those built. */
    // Include API missions reached through district routes, even before they have a track tile.
    const playableNodes = [...nodeById.values()].filter((node) => node.availability !== 'PLANNED');
    const boardCompleted = playableNodes.filter((node) => node.completed).length;

    return {
      spaces,
      current,
      position,
      boardCompleted,
      boardPlayable: playableNodes.length,
    };
  }, [districts, position, completed, visited]);
}

/** Static lookup used outside the hook, e.g. by the landing sheet's copy. */
export function spaceDistrictName(
  districtId: CityDistrictId | undefined,
  districts: { id: CityDistrictId; name: string }[],
): string {
  if (!districtId) return 'Shield Central';
  return districts.find((d) => d.id === districtId)?.name ?? 'ShieldQuest City';
}

/** Where a space's activity leads, if anywhere. */
export function spaceHref(space: ResolvedSpace): string | undefined {
  if (!space.nodeId) return undefined;
  return findNode(space.nodeId)?.href;
}
