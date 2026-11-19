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
      email: 'student@rishihood.edu.in',
      password: 'Student123',
    });

    assert.equal(result.id, 'profile-123');
    assert.equal(result.fullName, 'Test Student');
    assert.equal(result.email, 'student@rishihood.edu.in');
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
        email: 'student@rishihood.edu.in',
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
          email: 'student@rishihood.edu.in',
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
          email: 'student@rishihood.edu.in',
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
          email: 'student@rishihood.edu.in',
          password: 'Student123',
        }),
      {
        message: 'Database connection failed',
      }
    );
  });

  it('should reject registration with unauthorized domain', async () => {
    const repository = {
      findLocalIdentityByEmail: async () => null,
    };

    const authService = createAuthService(repository);

    await assert.rejects(
      () =>
        authService.registerUser({
          fullName: 'Test Student',
          email: 'student@gmail.com',
          password: 'Student123',
        }),
      (error) => {
        assert.equal(error.statusCode, 403);
        assert.equal(error.code, 'UNAUTHORIZED_EMAIL_DOMAIN');
        return true;
      }
    );
  });

  it('should allow registration with @nst.rishihood.edu.in domain', async () => {
    const repository = {
      findLocalIdentityByEmail: async () => null,
      createLocalAccount: async (account) => ({
        id: 'profile-nst-1',
        full_name: account.fullName,
        email: account.email,
        role: 'STUDENT',
      }),
    };

    const authService = createAuthService(repository);

    const result = await authService.registerUser({
      fullName: 'NST Student',
      email: 'student@nst.rishihood.edu.in',
      password: 'Student123',
    });

    assert.equal(result.email, 'student@nst.rishihood.edu.in');
  });

  it('should login an existing Google user', async () => {
    const repository = {
      findGoogleIdentityBySubject: async () => ({
        profile_id: 'profile-123',
        full_name: 'Test Student',
        email: 'student@rishihood.edu.in',
        role: 'STUDENT',
      }),
      findIdentityByEmail: async () => null,
    };

    const verifyGoogleToken = async () => ({
      sub: 'google-123',
      email: 'student@rishihood.edu.in',
      email_verified: true,
      name: 'Test Student',
    });

    const authService = createAuthService(repository, verifyGoogleToken);
    const result = await authService.loginWithGoogle('fake-google-token');

    assert.equal(result.user.id, 'profile-123');
    assert.equal(result.user.email, 'student@rishihood.edu.in');
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
      email: 'newstudent@rishihood.edu.in',
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

  it('should login Google user with @nst.rishihood.edu.in domain', async () => {
    const repository = {
      findGoogleIdentityBySubject: async () => null,
      findIdentityByEmail: async () => null,
      createGoogleAccount: async (account) => ({
        id: 'profile-nst-2',
        full_name: account.fullName,
        email: account.email,
        role: 'STUDENT',
      }),
    };

    const verifyGoogleToken = async () => ({
      sub: 'google-nst-1',
      email: 'user@nst.rishihood.edu.in',
      email_verified: true,
      name: 'NST Student',
    });

    const authService = createAuthService(repository, verifyGoogleToken);
    const result = await authService.loginWithGoogle('fake-google-token');

    assert.equal(result.user.email, 'user@nst.rishihood.edu.in');
    assert.ok(result.accessToken);
  });

  it('should login Google user with uppercase institutional email and normalize', async () => {
    let createdAccount;

    const repository = {
      findGoogleIdentityBySubject: async () => null,
      findIdentityByEmail: async () => null,
      createGoogleAccount: async (account) => {
        createdAccount = account;
        return {
          id: 'profile-upper',
          full_name: account.fullName,
          email: account.email,
          role: 'STUDENT',
        };
      },
    };

    const verifyGoogleToken = async () => ({
      sub: 'google-upper',
      email: 'STUDENT@NST.RISHIHOOD.EDU.IN',
      email_verified: true,
      name: 'Uppercase Student',
    });

    const authService = createAuthService(repository, verifyGoogleToken);
    const result = await authService.loginWithGoogle('fake-google-token');

    assert.equal(createdAccount.email, 'student@nst.rishihood.edu.in');
    assert.equal(result.user.email, 'student@nst.rishihood.edu.in');
  });

  it('should reject Google login with personal Gmail address', async () => {
    const repository = {
      findGoogleIdentityBySubject: async () => null,
    };

    const verifyGoogleToken = async () => ({
      sub: 'google-gmail',
      email: 'student@gmail.com',
      email_verified: true,
      name: 'Gmail User',
    });

    const authService = createAuthService(repository, verifyGoogleToken);

    await assert.rejects(
      () => authService.loginWithGoogle('fake-google-token'),
      (error) => {
        assert.equal(error.statusCode, 403);
        assert.equal(error.code, 'UNAUTHORIZED_EMAIL_DOMAIN');
        return true;
      }
    );
  });

  it('should reject Google login with similar unauthorized domain', async () => {
    const repository = {
      findGoogleIdentityBySubject: async () => null,
    };

    const verifyGoogleToken = async () => ({
      sub: 'google-fake-domain',
      email: 'student@nst.rishihood.edu.in.example.com',
      email_verified: true,
      name: 'Fake Domain User',
    });

    const authService = createAuthService(repository, verifyGoogleToken);

    await assert.rejects(
      () => authService.loginWithGoogle('fake-google-token'),
      (error) => {
        assert.equal(error.statusCode, 403);
        assert.equal(error.code, 'UNAUTHORIZED_EMAIL_DOMAIN');
        return true;
      }
    );
  });

  it('should reject Google login when existing account has unauthorized domain', async () => {
    const repository = {
      findGoogleIdentityBySubject: async () => ({
        profile_id: 'old-profile',
        full_name: 'Old User',
        email: 'olduser@gmail.com',
        role: 'STUDENT',
      }),
    };

    const verifyGoogleToken = async () => ({
      sub: 'google-old-user',
      email: 'olduser@gmail.com',
      email_verified: true,
      name: 'Old User',
    });

    const authService = createAuthService(repository, verifyGoogleToken);

    await assert.rejects(
      () => authService.loginWithGoogle('fake-google-token'),
      (error) => {
        assert.equal(error.statusCode, 403);
        assert.equal(error.code, 'UNAUTHORIZED_EMAIL_DOMAIN');
        return true;
      }
    );
  });

  it('should reject Google login when email claim is missing', async () => {
    const repository = {};

    const verifyGoogleToken = async () => ({
      sub: 'google-no-email',
      email_verified: true,
    });

    const authService = createAuthService(repository, verifyGoogleToken);

    await assert.rejects(
      () => authService.loginWithGoogle('fake-google-token'),
      (error) => {
        assert.equal(error.statusCode, 401);
        assert.equal(error.code, 'GOOGLE_AUTH_FAILED');
        return true;
      }
    );
  });

  it('should reject Google login when a local account uses the same email', async () => {
    const repository = {
      findGoogleIdentityBySubject: async () => null,
      findIdentityByEmail: async () => ({ provider: 'local' }),
    };

    const verifyGoogleToken = async () => ({
      sub: 'google-789',
      email: 'student@rishihood.edu.in',
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
      email: 'student@rishihood.edu.in',
      email_verified: false,
    });

    const authService = createAuthService(repository, verifyGoogleToken);

    await assert.rejects(
      () => authService.loginWithGoogle('fake-google-token'),
      (error) => {
        assert.equal(error.statusCode, 401);
        assert.equal(error.code, 'GOOGLE_AUTH_FAILED');
        return true;
      }
    );
  });

  it('should reject when Google token verification throws an error', async () => {
    const repository = {};

    const verifyGoogleToken = async () => {
      throw new Error('Google token invalid');
    };

    const authService = createAuthService(repository, verifyGoogleToken);

    await assert.rejects(
      () => authService.loginWithGoogle('invalid-google-token'),
      (error) => {
        assert.equal(error.statusCode, 401);
        assert.equal(error.code, 'GOOGLE_AUTH_FAILED');
        return true;
      }
    );
  });
});
