import { create } from 'zustand';
import type { Scenario } from '../../types';
import type { CityDistrictId } from '../../types/city-board';
import { api } from '../lib/api';
import { demoScenarios } from '../../types/demo';
import { BOARD_SPACES, normaliseBoardPosition } from '../features/city-board/data/board-data';

interface CityBoardState {
  view: string;
  boardPosition: number;
  visitedSpaces: number[];
  discoveredDistricts: CityDistrictId[];
  casebookEntries: string[];
  scenarios: Scenario[];
  catalogueStatus: 'idle' | 'loading' | 'ready' | 'error';
  catalogueMode: string | null;
  catalogueError: string | null;
  navigate: (view: string) => void;
  discoverDistrict: (id: CityDistrictId) => void;
  travelTo: (id: CityDistrictId) => void;
  moveToSpace: (position: number) => void;
  recordCasebookEntry: (id: string) => void;
  loadScenarios: () => Promise<void>;
}

// TODO(Participant): persist travel/discovery/casebook through an authenticated session API.
// Prisma Participant has no travel fields yet. This preview deliberately remains in memory.
export const useCityBoardStore = create<CityBoardState>((set, get) => ({
  view: '/game',
  boardPosition: 0,
  visitedSpaces: [],
  discoveredDistricts: [],
  casebookEntries: [],
  scenarios: [],
  catalogueStatus: 'idle',
  catalogueMode: null,
  catalogueError: null,
  navigate: (view) => set({ view }),
  discoverDistrict: (id) =>
    set((state) => ({ discoveredDistricts: [...new Set([...state.discoveredDistricts, id])] })),
  travelTo: (id) => {
    const index = BOARD_SPACES.findIndex(
      (space) => space.districtId === id && space.kind === 'DISTRICT_CHECKPOINT',
    );
    if (index >= 0) get().moveToSpace(index);
    else get().discoverDistrict(id);
  },
  moveToSpace: (position) => {
    const index = normaliseBoardPosition(position);
    const district = BOARD_SPACES[index]?.districtId;
    set((state) => ({
      boardPosition: index,
      visitedSpaces: [...new Set([...state.visitedSpaces, index])],
      discoveredDistricts: district
        ? [...new Set([...state.discoveredDistricts, district])]
        : state.discoveredDistricts,
    }));
  },
  recordCasebookEntry: (id) =>
    set((state) =>
      state.casebookEntries.includes(id)
        ? state
        : { casebookEntries: [...state.casebookEntries, id] },
    ),
  loadScenarios: async () => {
    if (get().catalogueStatus === 'loading') return;
    set({ catalogueStatus: 'loading', catalogueError: null });
    try {
      const result = await api.scenarios();
      set({
        scenarios: result.data.filter((scenario) => scenario.status === 'published'),
        catalogueStatus: 'ready',
        catalogueMode: result.mode,
      });
    } catch {
      // Offline fallback guarantee
      set({
        scenarios: demoScenarios.filter((s) => s.status === 'published'),
        catalogueStatus: 'ready',
        catalogueMode: 'demo',
        catalogueError: null,
      });
    }
  },
}));
