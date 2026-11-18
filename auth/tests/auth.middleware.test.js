import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { SignJWT } from 'jose';
import { authenticate, createAuthMiddleware } from '../src/auth.middleware.js';
import env from '../src/env.js';

const secretKey = new TextEncoder().encode(env.JWT_SECRET);

function createMockResponse() {
  return {
    statusCode: null,
    body: null,
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(data) {
      this.body = data;
      return this;
    },
  };
}

describe('Auth middleware', () => {
  it('should return 401 when authorization header is missing', async () => {
    const req = { headers: {} };
    const res = createMockResponse();
    let nextCalled = false;

    await authenticate(req, res, () => {
      nextCalled = true;
    });

    assert.equal(nextCalled, false);
    assert.equal(res.statusCode, 401);
    assert.equal(res.body.message, 'Authentication token is required.');
  });

  it('should return 401 when authorization header does not use Bearer scheme', async () => {
    const req = {
      headers: {
        authorization: 'Basic dXNlcjpwYXNz',
      },
    };
    const res = createMockResponse();
    let nextCalled = false;

    await authenticate(req, res, () => {
      nextCalled = true;
    });

    assert.equal(nextCalled, false);
    assert.equal(res.statusCode, 401);
    assert.equal(res.body.message, 'Authentication token is missing or invalid.');
  });

  it('should return 401 when Bearer scheme is present without a token', async () => {
    const req = {
      headers: {
        authorization: 'Bearer ',
      },
    };
    const res = createMockResponse();
    let nextCalled = false;

    await authenticate(req, res, () => {
      nextCalled = true;
    });

    assert.equal(nextCalled, false);
    assert.equal(res.statusCode, 401);
    assert.equal(res.body.message, 'Authentication token is missing or invalid.');
  });

  it('should return 401 for a malformed token', async () => {
    const req = {
      headers: {
        authorization: 'Bearer not-a-valid-jwt-token',
      },
    };
    const res = createMockResponse();
    let nextCalled = false;

    await authenticate(req, res, () => {
      nextCalled = true;
    });

    assert.equal(nextCalled, false);
    assert.equal(res.statusCode, 401);
    assert.equal(res.body.message, 'Invalid or expired authentication token.');
  });

  it('should return 401 for a token signed with an invalid secret', async () => {
    const wrongSecret = new TextEncoder().encode(
      'wrong-secret-key-that-is-at-least-32-characters-long'
    );
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
      .sign(wrongSecret);

    const req = {
      headers: {
        authorization: `Bearer ${token}`,
      },
    };
    const res = createMockResponse();
    let nextCalled = false;

    await authenticate(req, res, () => {
      nextCalled = true;
    });

    assert.equal(nextCalled, false);
    assert.equal(res.statusCode, 401);
    assert.equal(res.body.message, 'Invalid or expired authentication token.');
  });

  it('should return 401 for a token with an invalid issuer', async () => {
    const token = await new SignJWT({
      email: 'student@example.com',
      role: 'STUDENT',
    })
      .setProtectedHeader({ alg: 'HS256' })
      .setSubject('profile-123')
      .setIssuer('invalid-issuer')
      .setAudience(env.JWT_AUDIENCE)
      .setIssuedAt()
      .setExpirationTime('15m')
      .sign(secretKey);

    const req = {
      headers: {
        authorization: `Bearer ${token}`,
      },
    };
    const res = createMockResponse();
    let nextCalled = false;

    await authenticate(req, res, () => {
      nextCalled = true;
    });

    assert.equal(nextCalled, false);
    assert.equal(res.statusCode, 401);
    assert.equal(res.body.message, 'Invalid or expired authentication token.');
  });

  it('should return 401 for a token with an invalid audience', async () => {
    const token = await new SignJWT({
      email: 'student@example.com',
      role: 'STUDENT',
    })
      .setProtectedHeader({ alg: 'HS256' })
      .setSubject('profile-123')
      .setIssuer(env.JWT_ISSUER)
      .setAudience('invalid-audience')
      .setIssuedAt()
      .setExpirationTime('15m')
      .sign(secretKey);

    const req = {
      headers: {
        authorization: `Bearer ${token}`,
      },
    };
    const res = createMockResponse();
    let nextCalled = false;

    await authenticate(req, res, () => {
      nextCalled = true;
    });

    assert.equal(nextCalled, false);
    assert.equal(res.statusCode, 401);
    assert.equal(res.body.message, 'Invalid or expired authentication token.');
  });

  it('should return 401 for an expired token', async () => {
    const expiredToken = await new SignJWT({
      email: 'student@example.com',
      role: 'STUDENT',
    })
      .setProtectedHeader({ alg: 'HS256' })
      .setSubject('profile-123')
      .setIssuer(env.JWT_ISSUER)
      .setAudience(env.JWT_AUDIENCE)
      .setIssuedAt(Math.floor(Date.now() / 1000) - 120)
      .setExpirationTime(Math.floor(Date.now() / 1000) - 60)
      .sign(secretKey);

    const req = {
      headers: {
        authorization: `Bearer ${expiredToken}`,
      },
    };
    const res = createMockResponse();
    let nextCalled = false;

    await authenticate(req, res, () => {
      nextCalled = true;
    });

    assert.equal(nextCalled, false);
    assert.equal(res.statusCode, 401);
    assert.equal(res.body.message, 'Invalid or expired authentication token.');
  });

  it('should return 401 for a token missing required payload fields', async () => {
    const token = await new SignJWT({
      email: 'student@example.com',
    })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuer(env.JWT_ISSUER)
      .setAudience(env.JWT_AUDIENCE)
      .setIssuedAt()
      .setExpirationTime('15m')
      .sign(secretKey);

    const req = {
      headers: {
        authorization: `Bearer ${token}`,
      },
    };
    const res = createMockResponse();
    let nextCalled = false;

    await authenticate(req, res, () => {
      nextCalled = true;
    });

    assert.equal(nextCalled, false);
    assert.equal(res.statusCode, 401);
  });

  it('should set req.user and call next for a valid token', async () => {
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

    const req = {
      headers: {
        authorization: `Bearer ${token}`,
      },
    };
    const res = createMockResponse();
    let nextCalled = false;

    await authenticate(req, res, () => {
      nextCalled = true;
    });

    assert.equal(nextCalled, true);
    assert.equal(res.statusCode, null);
    assert.equal(req.user.id, 'profile-123');
    assert.equal(req.user.email, 'student@example.com');
    assert.equal(req.user.role, 'STUDENT');
  });
});
