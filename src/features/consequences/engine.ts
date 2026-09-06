import type { DelayedConsequence } from '../../../types';

/** Pure scheduling seam. The server will eventually own authoritative session steps. */
export function takeDueConsequences(queue: DelayedConsequence[], step: number) {
  return {
    due: queue.filter((item) => item.triggerAtStep <= step),
    pending: queue.filter((item) => item.triggerAtStep > step),
  };
}
