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
// Feature UIs currently use bundled demo data. These are integration points for the next phase.
export const api = {
  scenarios: () => request<{ mode: string; data: Scenario[] }>('/scenarios'),
  join: (code: string) =>
    request<never>(`/sessions/${encodeURIComponent(code)}/join`, { method: 'POST', body: '{}' }),
  vote: (vote: VoteSubmission) =>
    request<never>('/votes', { method: 'POST', body: JSON.stringify(vote) }),
};
