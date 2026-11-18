
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import bcrypt from 'bcrypt';

import { createAuthService } from '../src/auth.service.js';

describe('Auth service', () => {
  it('should register a user with a hashed password', async () => {
    let createdAccount;

    const repository = {
      findLocalIdentityByEmail: async () => null,
      createLocalAccount: async (account) => {
        createdAccount = account;

        return {
          id: 'profile-123',
          full_name: account.fullName,
          email: account.email,
          role: 'STUDENT',
        };
      },
    };

    const authService = createAuthService(repository);

    const result = await authService.registerUser({
      fullName: 'Test Student',
      email: 'student@example.com',
      password: 'Student123',
    });

    assert.equal(result.id, 'profile-123');
    assert.equal(result.fullName, 'Test Student');
    assert.equal(result.email, 'student@example.com');
    assert.equal(result.role, 'STUDENT');
    assert.equal('password' in result, false);
    assert.equal('passwordHash' in result, false);

    assert.notEqual(createdAccount.passwordHash, 'Student123');
    assert.equal(
      await bcrypt.compare('Student123', createdAccount.passwordHash),
      true
    );
  });

  it('should reject registration when email already exists', async () => {
    const repository = {
      findLocalIdentityByEmail: async () => ({
        email: 'student@example.com',
      }),
      createLocalAccount: async () => {
        throw new Error('Account should not be created');
      },
    };

    const authService = createAuthService(repository);

    await assert.rejects(
      () =>
        authService.registerUser({
          fullName: 'Test Student',
          email: 'student@example.com',
          password: 'Student123',
        }),
      (error) => {
        assert.equal(error.statusCode, 409);
        assert.equal(error.code, 'EMAIL_ALREADY_EXISTS');
        return true;
      }
    );
  });

  it('should handle duplicate email database errors', async () => {
    const repository = {
      findLocalIdentityByEmail: async () => null,
      createLocalAccount: async () => {
        const error = new Error('Duplicate key');
        error.code = '23505';
        throw error;
      },
    };

    const authService = createAuthService(repository);

    await assert.rejects(
      () =>
        authService.registerUser({
          fullName: 'Test Student',
          email: 'student@example.com',
          password: 'Student123',
        }),
      (error) => {
        assert.equal(error.statusCode, 409);
        assert.equal(error.code, 'EMAIL_ALREADY_EXISTS');
        return true;
      }
    );
  });

  it('should propagate unexpected repository errors', async () => {
    const repository = {
      findLocalIdentityByEmail: async () => null,
      createLocalAccount: async () => {
        throw new Error('Database connection failed');
      },
    };

    const authService = createAuthService(repository);

    await assert.rejects(
      () =>
        authService.registerUser({
          fullName: 'Test Student',
          email: 'student@example.com',
          password: 'Student123',
        }),
      {
        message: 'Database connection failed',
      }
    );
  });

  it('should login an existing Google user', async () => {
    const repository = {
      findGoogleIdentityBySubject: async () => ({
        profile_id: 'profile-123',
        full_name: 'Test Student',
        email: 'student@gmail.com',
        role: 'STUDENT',
      }),
      findIdentityByEmail: async () => null,
    };

    const verifyGoogleToken = async () => ({
      sub: 'google-123',
      email: 'student@gmail.com',
      email_verified: true,
      name: 'Test Student',
    });

    const authService = createAuthService(repository, verifyGoogleToken);
    const result = await authService.loginWithGoogle('fake-google-token');

    assert.equal(result.user.id, 'profile-123');
    assert.equal(result.user.email, 'student@gmail.com');
    assert.equal(result.user.role, 'STUDENT');
    assert.ok(result.accessToken);
  });

  it('should create an account for a new Google user', async () => {
    let createdAccount;

    const repository = {
      findGoogleIdentityBySubject: async () => null,
      findIdentityByEmail: async () => null,
      createGoogleAccount: async (account) => {
        createdAccount = account;

        return {
          id: 'profile-456',
          full_name: account.fullName,
          email: account.email,
          role: 'STUDENT',
        };
      },
    };

    const verifyGoogleToken = async () => ({
      sub: 'google-456',
      email: 'newstudent@gmail.com',
      email_verified: true,
      name: 'New Student',
    });

    const authService = createAuthService(repository, verifyGoogleToken);
    const result = await authService.loginWithGoogle('fake-google-token');

    assert.equal(createdAccount.googleSubject, 'google-456');
    assert.equal(result.user.id, 'profile-456');
    assert.equal(result.user.role, 'STUDENT');
    assert.ok(result.accessToken);
  });

  it('should reject Google login when a local account uses the same email', async () => {
    const repository = {
      findGoogleIdentityBySubject: async () => null,
      findIdentityByEmail: async () => ({ provider: 'local' }),
    };

    const verifyGoogleToken = async () => ({
      sub: 'google-789',
      email: 'student@example.com',
      email_verified: true,
    });

    const authService = createAuthService(repository, verifyGoogleToken);

    await assert.rejects(
      () => authService.loginWithGoogle('fake-google-token'),
      (error) => {
        assert.equal(error.statusCode, 409);
        assert.equal(error.code, 'ACCOUNT_ALREADY_EXISTS');
        return true;
      }
    );
  });

  it('should reject an unverified Google account', async () => {
    const repository = {};

    const verifyGoogleToken = async () => ({
      sub: 'google-999',
      email: 'student@gmail.com',
      email_verified: false,
    });

    const authService = createAuthService(repository, verifyGoogleToken);

    await assert.rejects(
      () => authService.loginWithGoogle('fake-google-token'),
      {
        message: 'Google account verification failed.',
      }
    );
  });

});
