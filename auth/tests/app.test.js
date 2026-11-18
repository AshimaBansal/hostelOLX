import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';
import { SignJWT } from 'jose';
import app from '../src/app.js';
import env from '../src/env.js';

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

describe('Protected me endpoint', () => {
  it('should return 401 when accessing /api/auth/me without a token', async () => {
    const response = await request(app).get('/api/auth/me');

    assert.equal(response.status, 401);
    assert.equal(response.body.message, 'Authentication token is required.');
  });

  it('should return 401 when accessing /api/auth/me with an invalid token', async () => {
    const response = await request(app)
      .get('/api/auth/me')
      .set('Authorization', 'Bearer invalid-token');

    assert.equal(response.status, 401);
  });

  it('should return 200 and authenticated user details with a valid token', async () => {
    const secretKey = new TextEncoder().encode(env.JWT_SECRET);
    const token = await new SignJWT({
      email: 'student@example.com',
      role: 'STUDENT',
    })
      .setProtectedHeader({ alg: 'HS256' })
      .setSubject('profile-123')
      .setIssuer(env.JWT_ISSUER)
      .setAudience(env.JWT_AUDIENCE)
      .setIssuedAt()
      .setExpirationTime('15m')
      .sign(secretKey);

    const response = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${token}`);

    assert.equal(response.status, 200);
    assert.equal(response.body.user.id, 'profile-123');
    assert.equal(response.body.user.email, 'student@example.com');
    assert.equal(response.body.user.role, 'STUDENT');
  });
});

describe('Google auth route registration', () => {
  it('should handle POST /api/auth/google validation', async () => {
    const response = await request(app).post('/api/auth/google').send({});

    assert.equal(response.status, 400);
    assert.equal(response.body.message, 'Google ID token is required.');
  });
});
