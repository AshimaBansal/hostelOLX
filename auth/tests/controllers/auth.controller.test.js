
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import { createAuthController } from '../../src/controllers/auth.controller.js';

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
});
