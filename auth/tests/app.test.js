import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';
import app from '../src/app.js';

describe('Auth service health checks', () => {
  it('should return a successful health response', async () => {
    const response = await request(app).get('/health');

    assert.equal(response.status, 200);
    assert.equal(response.body.success, true);
    assert.equal(response.body.service, 'hostelolx-auth');
    assert.equal(response.body.status, 'healthy');
  });

  it('should return service information on the root route', async () => {
    const response = await request(app).get('/');

    assert.equal(response.status, 200);
    assert.equal(response.body.success, true);
  });

  it('should return 404 for an unknown route', async () => {
    const response = await request(app).get('/unknown');

    assert.equal(response.status, 404);
    assert.equal(response.body.success, false);
  });
});
