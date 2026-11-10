import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { createApp } from '../src/app.js';

describe('ShieldQuest API', () => {
  const app = createApp();

  it('GET /api/health should return status healthy', async () => {
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('healthy');
    expect(res.body.service).toBe('shieldquest-api');
    expect(typeof res.body.uptime).toBe('number');
  });

  it('GET /api/public/site should return site metadata', async () => {
    const res = await request(app).get('/api/public/site');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.name).toBe('ShieldQuest');
    expect(res.body.data.tagline).toContain('Protect Together');
  });

  it('GET /api/public/guardians should return all six guardians', async () => {
    const res = await request(app).get('/api/public/guardians');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveLength(6);

    const ids = res.body.data.map((g: { id: string }) => g.id);
    expect(ids).toContain('verifox');
    expect(ids).toContain('echo');
    expect(ids).toContain('beacon');
    expect(ids).toContain('shieldfin');
    expect(ids).toContain('cluepaw');
    expect(ids).toContain('bytebuddy');
  });

  it('GET /api/public/guardians/:id should return single guardian', async () => {
    const res = await request(app).get('/api/public/guardians/verifox');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.name).toBe('VeriFox');
    expect(res.body.data.discipline).toBe('Verification');
  });

  it('GET /api/public/guardians/:id with unknown id should return 404', async () => {
    const res = await request(app).get('/api/public/guardians/unknown-guardian');
    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
  });

  it('GET /api/public/districts should return the 4 districts', async () => {
    const res = await request(app).get('/api/public/districts');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveLength(4);

    const names = res.body.data.map((d: { name: string }) => d.name);
    expect(names).toContain('School Street');
    expect(names).toContain('Retail District');
    expect(names).toContain('Digi-District');
    expect(names).toContain('Community Hub');
  });

  it('GET /api/public/framework should return S.H.I.E.L.D. 6 steps', async () => {
    const res = await request(app).get('/api/public/framework');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveLength(6);
    expect(res.body.data[0].letter).toBe('S');
    expect(res.body.data[5].letter).toBe('D');
  });

  it('GET /api/public/teaser should return teaser scenarios', async () => {
    const res = await request(app).get('/api/public/teaser');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.length).toBeGreaterThan(0);
    expect(res.body.data[0].choices).toHaveLength(2);
  });

  it('GET /api/unknown-endpoint should return 404 with error payload', async () => {
    const res = await request(app).get('/api/non-existent');
    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
  });
});
