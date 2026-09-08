import { useCityBoardStore } from '../../../stores/cityBoardStore';
import { useSessionStore } from '../../../stores/sessionStore';
import { MOCK_GUARDIANS, DEFAULT_PLAYER_TOKEN } from '../data/reference';
import { BOARD_SPACES } from '../data/board-data';
import { readPlayerPreferences } from '../playerPreferences';

const noUnlocks: string[] = [];
const acknowledgeNewUnlocks = () => {};
const equippedIn = (_slot: string) => undefined;

/** Board adapter using shared guardian practice; rewards and assessment remain later migrations. */
export function usePlayer() {
  const city = useCityBoardStore();
  const completed = useSessionStore((state) => state.completed);
  const guardianProgress = useSessionStore((state) => state.guardianProgress);
  const shieldTokens = useSessionStore((state) => state.shieldTokens);
  const preferences = readPlayerPreferences();
  return {
    profile: {
      ...city,
      completedActivities: completed,
      currentDistrictId: BOARD_SPACES[city.boardPosition]?.districtId,
      guardianProgress,
      // TODO(Participant): reward balances/settings have no Prisma fields or endpoint yet.
      coins: 0,
      resiliencePoints: 0,
      shieldTokens,
      settings: {
        reducedMotion: preferences.reducedMotion,
        sound: preferences.soundEnabled,
        highContrast: preferences.highContrast,
        enhanced3d: preferences.enhanced3d,
      },
      playerTokenId: DEFAULT_PLAYER_TOKEN,
    },
    guardians: MOCK_GUARDIANS,
    hydrated: true,
    newlyUnlockedNodeIds: noUnlocks,
    discoverDistrict: city.discoverDistrict,
    moveToSpace: city.moveToSpace,
    travelTo: city.travelTo,
    recordCasebookEntry: city.recordCasebookEntry,
    acknowledgeNewUnlocks,
    equippedIn,
  };
}
