import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import { createApp } from '../src/app.js';

const exit = (checkpoint: string, status = 'exited') => ({ v: 1, missionId: 'minimart-clue', status, checkpoint, completedObjectives: ['enter-shop'] });

describe('session API', () => {
  let app: ReturnType<typeof createApp>;
  let id: string;
  let auth: string;

  beforeEach(async () => {
    app = createApp();
    const res = await request(app).post('/api/sessions');
    expect(res.status).toBe(201);
    id = res.body.data.sessionId;
    auth = `Bearer ${res.body.data.token}`;
  });

  it('rejects missing or wrong tokens', async () => {
    expect((await request(app).get(`/api/sessions/${id}/progress`)).status).toBe(401);
    expect((await request(app).get(`/api/sessions/${id}/progress`).set('Authorization', 'Bearer nope')).status).toBe(401);
    const other = (await request(app).post('/api/sessions')).body.data;
    expect((await request(app).get(`/api/sessions/${id}/progress`).set('Authorization', `Bearer ${other.token}`)).status).toBe(401);
  });

  it('saves progress with optimistic concurrency', async () => {
    const first = await request(app).put(`/api/sessions/${id}/progress`).set('Authorization', auth).send({ expectedVersion: 0, exit: exit('aisle-2') });
    expect(first.status).toBe(200);
    expect(first.body.data.version).toBe(1);
    const stale = await request(app).put(`/api/sessions/${id}/progress`).set('Authorization', auth).send({ expectedVersion: 0, exit: exit('aisle-3') });
    expect(stale.status).toBe(409);
    const got = await request(app).get(`/api/sessions/${id}/progress`).set('Authorization', auth);
    expect(got.body.data.missions['minimart-clue'].checkpoint).toBe('aisle-2');
  });

  it('validates progress bodies against the shared contract', async () => {
    const bad = await request(app).put(`/api/sessions/${id}/progress`).set('Authorization', auth).send({ expectedVersion: 0, exit: { ...exit('x'), missionId: 'bank-heist' } });
    expect(bad.status).toBe(400);
    expect(bad.body.error.message).toBe('unknown missionId');
  });

  it('records decisions idempotently and per skill', async () => {
    const d = { decisionId: 'd1', missionId: 'minimart-clue', skill: 'S', choiceId: 'notice-lookout' };
    expect((await request(app).post(`/api/sessions/${id}/decisions`).set('Authorization', auth).send(d)).status).toBe(201);
    const retry = await request(app).post(`/api/sessions/${id}/decisions`).set('Authorization', auth).send({ ...d, choiceId: 'changed' });
    expect(retry.status).toBe(200);
    expect(retry.body.data.choiceId).toBe('notice-lookout'); // retry cannot overwrite
    expect((await request(app).post(`/api/sessions/${id}/decisions`).set('Authorization', auth).send({ ...d, decisionId: 'd2', skill: 'X' })).status).toBe(400);
  });
});
