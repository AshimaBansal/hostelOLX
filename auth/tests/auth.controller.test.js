
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import { createAuthController } from '../src/auth.controller.js';

describe('Auth controller', () => {
  it('should return 201 when registration succeeds', async () => {
    const service = {
      registerUser: async (data) => ({
        id: 'profile-123',
        fullName: data.fullName,
        email: data.email,
        role: 'STUDENT',
      }),
    };

    const controller = createAuthController(service);
    const req = {
      body: {
        fullName: 'Test Student',
        email: 'student@example.com',
        password: 'Student123',
      },
    };

    const res = {
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

    await controller.register(req, res);

    assert.equal(res.statusCode, 201);
    assert.equal(res.body.message, 'Account created successfully.');
    assert.equal(res.body.user.id, 'profile-123');
  });

  it('should return 400 for invalid registration details', async () => {
    const service = {
      registerUser: async () => {
        throw new Error('Service should not be called');
      },
    };

    const controller = createAuthController(service);
    const req = {
      body: {
        fullName: 'A',
        email: 'invalid-email',
        password: '123',
      },
    };

    const res = {
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

    await controller.register(req, res);

    assert.equal(res.statusCode, 400);
    assert.equal(res.body.message, 'Invalid registration details.');
    assert.ok(Array.isArray(res.body.errors));
  });

  it('should return 409 when email already exists', async () => {
    const service = {
      registerUser: async () => {
        const error = new Error('An account with this email already exists.');
        error.statusCode = 409;
        error.code = 'EMAIL_ALREADY_EXISTS';
        throw error;
      },
    };

    const controller = createAuthController(service);
    const req = {
      body: {
        fullName: 'Test Student',
        email: 'student@example.com',
        password: 'Student123',
      },
    };

    const res = {
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

    await controller.register(req, res);

    assert.equal(res.statusCode, 409);
    assert.equal(res.body.code, 'EMAIL_ALREADY_EXISTS');
  });

  it('should return 500 for unexpected errors', async () => {
    const originalError = console.error;
    console.error = () => {};

    try {
      const service = {
        registerUser: async () => {
          throw new Error('Database connection failed');
        },
      };

      const controller = createAuthController(service);
      const req = {
        body: {
          fullName: 'Test Student',
          email: 'student@example.com',
          password: 'Student123',
        },
      };

      const res = {
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

      await controller.register(req, res);

      assert.equal(res.statusCode, 500);
      assert.equal(
        res.body.message,
        'Something went wrong while creating your account.'
      );
    } finally {
      console.error = originalError;
    }
  });

  it('should return 200 when Google login succeeds', async () => {
    const service = {
      loginWithGoogle: async () => ({
        user: {
          id: 'profile-123',
          fullName: 'Test Student',
          email: 'student@gmail.com',
          role: 'STUDENT',
        },
        accessToken: 'test-access-token',
      }),
    };

    const controller = createAuthController(service);
    const req = {
      body: {
        idToken: 'valid-google-token',
      },
    };

    const res = {
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

    await controller.googleLogin(req, res);

    assert.equal(res.statusCode, 200);
    assert.equal(res.body.message, 'Google login successful.');
    assert.equal(res.body.user.id, 'profile-123');
    assert.equal(res.body.accessToken, 'test-access-token');
  });

  it('should return 400 when Google ID token is missing', async () => {
    const service = {
      loginWithGoogle: async () => {
        throw new Error('Service should not be called');
      },
    };

    const controller = createAuthController(service);
    const req = { body: {} };

    const res = {
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

    await controller.googleLogin(req, res);

    assert.equal(res.statusCode, 400);
    assert.equal(res.body.message, 'Google ID token is required.');
  });

  it('should return 409 when Google account conflicts with an existing account', async () => {
    const service = {
      loginWithGoogle: async () => {
        const error = new Error('An account with this email already exists.');
        error.statusCode = 409;
        error.code = 'ACCOUNT_ALREADY_EXISTS';
        throw error;
      },
    };

    const controller = createAuthController(service);
    const req = {
      body: {
        idToken: 'valid-google-token',
      },
    };

    const res = {
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

    await controller.googleLogin(req, res);

    assert.equal(res.statusCode, 409);
    assert.equal(res.body.code, 'ACCOUNT_ALREADY_EXISTS');
  });

  it('should return 401 when Google authentication fails', async () => {
    const service = {
      loginWithGoogle: async () => {
        const error = new Error('Invalid Google token');
        error.statusCode = 401;
        throw error;
      },
    };

    const controller = createAuthController(service);
    const req = {
      body: {
        idToken: 'invalid-google-token',
      },
    };

    const res = {
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

    await controller.googleLogin(req, res);

    assert.equal(res.statusCode, 401);
    assert.equal(res.body.message, 'Google authentication failed.');
  });

  it('should return 200 and user info for me endpoint', async () => {
    const controller = createAuthController();
    const req = {
      user: {
        id: 'profile-123',
        email: 'student@example.com',
        role: 'STUDENT',
      },
    };

    const res = {
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

    await controller.me(req, res);

    assert.equal(res.statusCode, 200);
    assert.equal(res.body.user.id, 'profile-123');
    assert.equal(res.body.user.email, 'student@example.com');
    assert.equal(res.body.user.role, 'STUDENT');
  });

  it('should return 401 when user is not attached to request in me', async () => {
    const controller = createAuthController();
    const req = {};

    const res = {
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

    await controller.me(req, res);

    assert.equal(res.statusCode, 401);
    assert.equal(res.body.message, 'Authentication token is required.');
  });
});
