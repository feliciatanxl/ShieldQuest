import type { ApiError, Scenario, VoteSubmission } from '../../types';

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
// City board reads the scenarios API. Session and voting writes remain scaffold endpoints.
export const api = {
  scenario: (id: string, signal?: AbortSignal) =>
    request<{ mode: string; data: Scenario }>(`/scenarios/${encodeURIComponent(id)}`, {
      signal: signal
        ? AbortSignal.any([signal, AbortSignal.timeout(10_000)])
        : AbortSignal.timeout(10_000),
    }),
  scenarios: () =>
    request<{ mode: string; data: Scenario[] }>('/scenarios', {
      signal: AbortSignal.timeout(10_000),
    }),
  join: (code: string) =>
    request<never>(`/sessions/${encodeURIComponent(code)}/join`, { method: 'POST', body: '{}' }),
  vote: (vote: VoteSubmission) =>
    request<never>('/votes', { method: 'POST', body: JSON.stringify(vote) }),
};
