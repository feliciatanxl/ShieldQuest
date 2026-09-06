import { test } from 'node:test';
import assert from 'node:assert/strict';
import { takeDueConsequences } from './engine';

test('only due events are consumed, future events remain queued without mutating input', () => {
  const base = { scenarioId: 'demo', choiceId: 'pause', message: 'A later reflection' };
  const queue = [
    { ...base, id: 'past', triggerAtStep: 1 },
    { ...base, id: 'now', triggerAtStep: 3 },
    { ...base, id: 'later', triggerAtStep: 5 },
  ];
  const { due, pending } = takeDueConsequences(queue, 3);
  assert.deepEqual(
    due.map((item) => item.id),
    ['past', 'now'],
  );
  assert.deepEqual(
    pending.map((item) => item.id),
    ['later'],
  );
  assert.equal(queue.length, 3);
  assert.deepEqual(takeDueConsequences(pending, 3).due, []);
});
