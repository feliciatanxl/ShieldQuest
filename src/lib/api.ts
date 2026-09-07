import type { ApiError, Scenario, VoteSubmission } from '../../types';
import { demoScenarios } from '../../types/demo';

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`/api${path}`, {
    ...options,
    headers: { 'Content-Type': 'application/json', ...options?.headers },
  });
  if (!response.ok) {
    const body = (await response.json().catch(() => null)) as ApiError | null;
    throw new Error(body?.error.message ?? `Request failed (${response.status})`);
  }
  return response.json() as Promise<T>;
}

// City board reads the scenarios API. Silently falls back to demo scenarios if the backend is offline.
export const api = {
  scenario: async (id: string, signal?: AbortSignal) => {
    try {
      return await request<{ mode: string; data: Scenario }>(`/scenarios/${encodeURIComponent(id)}`, {
        signal: signal
          ? AbortSignal.any([signal, AbortSignal.timeout(3_000)])
          : AbortSignal.timeout(3_000),
      });
    } catch {
      const found = demoScenarios.find((s) => s.id === id);
      if (found) return { mode: 'demo', data: found };
      throw new Error('Scenario not found');
    }
  },
  scenarios: async () => {
    try {
      return await request<{ mode: string; data: Scenario[] }>('/scenarios', {
        signal: AbortSignal.timeout(3_000),
      });
    } catch {
      return { mode: 'demo', data: demoScenarios };
    }
  },
  join: (code: string) =>
    request<never>(`/sessions/${encodeURIComponent(code)}/join`, { method: 'POST', body: '{}' }),
  vote: (vote: VoteSubmission) =>
    request<never>('/votes', { method: 'POST', body: JSON.stringify(vote) }),
};
