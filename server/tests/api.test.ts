import { test } from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';
import { app } from '../app.js';

test('health explicitly identifies the scaffold and disconnected database', async () => {
  const response = await request(app).get('/api/health').expect(200);
  assert.equal(response.body.mode, 'scaffold');
  assert.equal(response.body.database, 'not-connected');
});
test('demo scenarios can be read, unknown scenarios return 404', async () => {
  const response = await request(app).get('/api/scenarios').expect(200);
  assert.equal(response.body.data.length, 3);
  await request(app).get(`/api/scenarios/${response.body.data[0].id}`).expect(200);
  await request(app).get('/api/scenarios/missing').expect(404);
});
test('session and admin writes never pretend to persist data', async () => {
  for (const path of [
    '/api/sessions',
    '/api/sessions/DEMO01/join',
    '/api/scenarios',
    '/api/scenarios/demo/publish',
  ]) {
    const response = await request(app).post(path).send({}).expect(501);
    assert.equal(response.body.error.code, 'NOT_IMPLEMENTED');
  }
  await request(app).patch('/api/scenarios/demo').send({ title: 'Changed' }).expect(501);
  await request(app).delete('/api/scenarios/demo').expect(501);
});
test('vote contract rejects PII fields and invalid pseudonyms', async () => {
  const valid = {
    participantId: '03e7398f-27fa-4d78-82a3-96cb421f66ca',
    scenarioId: 'school-group-chat',
    choiceId: 'pause',
  };
  await request(app)
    .post('/api/votes')
    .send({ ...valid, name: 'No names here' })
    .expect(400);
  await request(app)
    .post('/api/votes')
    .send({ ...valid, participantId: 'a-name' })
    .expect(400);
  await request(app).post('/api/votes').send(valid).expect(501);
});
test('malformed JSON and unknown API routes return structured errors', async () => {
  const response = await request(app)
    .post('/api/votes')
    .set('Content-Type', 'application/json')
    .send('{')
    .expect(400);
  assert.equal(response.body.error.code, 'REQUEST_ERROR');
  await request(app).get('/api/missing').expect(404);
});
