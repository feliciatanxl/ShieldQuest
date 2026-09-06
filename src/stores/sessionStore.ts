import { create } from 'zustand';
import type { DistrictId, GuardianId } from '../../types';

interface SessionState {
  district: DistrictId;
  previewCode: string | null;
  completed: string[];
  guardians: GuardianId[];
  selectDistrict: (district: DistrictId) => void;
  setPreviewCode: (code: string) => void;
  completePreview: (scenarioId: string, guardian: GuardianId) => void;
  reset: () => void;
}
// In-memory demo only. Do not persist participant tokens or private votes in localStorage.
export const useSessionStore = create<SessionState>((set) => ({
  district: 'school',
  previewCode: null,
  completed: [],
  guardians: [],
  selectDistrict: (district) => set({ district }),
  setPreviewCode: (previewCode) => set({ previewCode }),
  completePreview: (scenarioId, guardian) =>
    set((state) => ({
      completed: [...new Set([...state.completed, scenarioId])],
      guardians: [...new Set([...state.guardians, guardian])],
    })),
  reset: () => set({ district: 'school', previewCode: null, completed: [], guardians: [] }),
}));
