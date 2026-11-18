
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { createAuthRepository } from '../../src/repositories/auth.repository.js';

describe('Auth repository', () => {
  it('should find a local identity by email', async () => {
    const expectedUser = {
      identity_id: 1,
      email: 'student@example.com',
      profile_id: 'profile-123',
      full_name: 'Test Student',
    };

    const database = {
      query: async (sql, params) => {
        assert.match(sql, /provider = 'local'/);
        assert.deepEqual(params, ['STUDENT@example.com']);
        return { rows: [expectedUser] };
      },
    };

    const repository = createAuthRepository(database);
    const result = await repository.findLocalIdentityByEmail(
      'STUDENT@example.com'
    );

    assert.deepEqual(result, expectedUser);
  });

  it('should return null when a local identity is not found', async () => {
    const database = {
      query: async () => ({ rows: [] }),
    };

    const repository = createAuthRepository(database);
    const result = await repository.findLocalIdentityByEmail(
      'unknown@example.com'
    );

    assert.equal(result, null);
  });

  it('should find a Google identity using its subject', async () => {
    const expectedUser = {
      identity_id: 2,
      email: 'google@example.com',
      profile_id: 'profile-456',
      full_name: 'Google Student',
    };

    const database = {
      query: async (sql, params) => {
        assert.match(sql, /provider = 'google'/);
        assert.deepEqual(params, ['google-subject-123']);
        return { rows: [expectedUser] };
      },
    };

    const repository = createAuthRepository(database);
    const result = await repository.findGoogleIdentityBySubject(
      'google-subject-123'
    );

    assert.deepEqual(result, expectedUser);
  });

  it('should create a local account and assign STUDENT role', async () => {
    const queries = [];

    const client = {
      query: async (sql, params = []) => {
        queries.push({ sql, params });

        if (sql.includes('INSERT INTO profiles')) {
          return {
            rows: [{
              id: params[0],
              full_name: params[1],
            }],
          };
        }

        return { rows: [] };
      },
      release: () => {},
    };

    const database = {
      connect: async () => client,
    };

    const repository = createAuthRepository(database);

    const result = await repository.createLocalAccount({
      fullName: 'Test Student',
      email: 'STUDENT@EXAMPLE.COM',
      passwordHash: 'hashed-password',
    });

    assert.equal(result.full_name, 'Test Student');
    assert.equal(result.email, 'student@example.com');
    assert.equal(result.role, 'STUDENT');

    assert.equal(queries[0].sql, 'BEGIN');
    assert.match(queries[1].sql, /INSERT INTO profiles/);
    assert.match(queries[2].sql, /INSERT INTO auth_identities/);
    assert.match(queries[3].sql, /INSERT INTO profile_roles/);
    assert.equal(queries[4].sql, 'COMMIT');
  });

  it('should roll back if account creation fails', async () => {
    const queries = [];
    let released = false;

    const client = {
      query: async (sql) => {
        queries.push(sql);

        if (sql.includes('INSERT INTO auth_identities')) {
          throw new Error('Database insert failed');
        }

        return { rows: [] };
      },
      release: () => {
        released = true;
      },
    };

    const database = {
      connect: async () => client,
    };

    const repository = createAuthRepository(database);

    await assert.rejects(
      repository.createLocalAccount({
        fullName: 'Test Student',
        email: 'student@example.com',
        passwordHash: 'hashed-password',
      }),
      { message: 'Database insert failed' }
    );

    assert.ok(queries.includes('ROLLBACK'));
    assert.equal(released, true);
  });
});
