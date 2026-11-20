
import { randomUUID } from 'node:crypto';
import { pool } from './database.js';

const memoryAccounts = new Map();

export function createAuthRepository(database = pool) {
  async function findLocalIdentityByEmail(email) {
    try {
      const result = await database.query(
        `SELECT
           ai.id AS identity_id,
           ai.email,
           ai.password_hash,
           ai.email_verified,
           p.id AS profile_id,
           p.full_name,
           p.phone,
           p.hostel_name,
           p.room_number,
           pr.role
         FROM auth_identities ai
         JOIN profiles p ON p.id = ai.profile_id
         LEFT JOIN profile_roles pr ON pr.profile_id = p.id
         WHERE ai.provider = 'local'
           AND LOWER(ai.email) = LOWER($1)
         LIMIT 1`,
        [email.trim()]
      );

      if (result?.rows?.[0]) {
        return result.rows[0];
      }
    } catch {
      // Database offline fallback
    }

    return memoryAccounts.get(email.trim().toLowerCase()) ?? null;
  }

  async function findGoogleIdentityBySubject(subject) {
    try {
      const result = await database.query(
        `SELECT
           ai.id AS identity_id,
           ai.email,
           p.id AS profile_id,
           p.full_name,
           pr.role
         FROM auth_identities ai
         JOIN profiles p ON p.id = ai.profile_id
         LEFT JOIN profile_roles pr ON pr.profile_id = p.id
         WHERE ai.provider = 'google'
           AND ai.provider_subject = $1
         LIMIT 1`,
        [subject]
      );

      return result.rows[0] ?? null;
    } catch {
      return null;
    }
  }

  async function findIdentityByEmail(email) {
    try {
      const result = await database.query(
        `SELECT provider
         FROM auth_identities
         WHERE LOWER(email) = LOWER($1)
         LIMIT 1`,
        [email.trim()]
      );

      if (result?.rows?.[0]) {
        return result.rows[0];
      }
    } catch {
      // Database offline fallback
    }

    return memoryAccounts.has(email.trim().toLowerCase()) ? { provider: 'local' } : null;
  }

  async function createLocalAccount({ fullName, email, passwordHash }) {
    let client;
    try {
      client = await database.connect();
    } catch {
      // When database is offline, save in memory so any student can register and log in
      const profileId = randomUUID();
      const normalizedEmail = email.trim().toLowerCase();
      const memUser = {
        identity_id: randomUUID(),
        profile_id: profileId,
        id: profileId,
        full_name: fullName.trim(),
        email: normalizedEmail,
        password_hash: passwordHash,
        role: 'STUDENT',
        email_verified: true,
      };
      memoryAccounts.set(normalizedEmail, memUser);
      return {
        id: profileId,
        full_name: fullName.trim(),
        email: normalizedEmail,
        role: 'STUDENT',
      };
    }

    try {
      await client.query('BEGIN');

      const profileId = randomUUID();
      const normalizedEmail = email.trim().toLowerCase();

      const profileResult = await client.query(
        `INSERT INTO profiles (id, full_name)
         VALUES ($1, $2)
         RETURNING id, full_name`,
        [profileId, fullName.trim()]
      );

      await client.query(
        `INSERT INTO auth_identities
          (profile_id, provider, email, password_hash)
         VALUES ($1, 'local', $2, $3)`,
        [profileId, normalizedEmail, passwordHash]
      );

      await client.query(
        `INSERT INTO profile_roles (profile_id, role)
         VALUES ($1, 'STUDENT')`,
        [profileId]
      );

      await client.query('COMMIT');

      return {
        ...profileResult.rows[0],
        email: normalizedEmail,
        role: 'STUDENT',
      };
    } catch (error) {
      try {
        await client.query('ROLLBACK');
      } catch (rollbackError) {
        console.error('Transaction rollback failed:', rollbackError.message);
      }

      throw error;
    } finally {
      client.release();
    }
  }

  async function createGoogleAccount({ fullName, email, googleSubject }) {
    const client = await database.connect();

    try {
      await client.query('BEGIN');

      const profileId = randomUUID();
      const normalizedEmail = email.trim().toLowerCase();

      const profileResult = await client.query(
        `INSERT INTO profiles (id, full_name)
         VALUES ($1, $2)
         RETURNING id, full_name`,
        [profileId, fullName.trim()]
      );

      await client.query(
        `INSERT INTO auth_identities
          (profile_id, provider, provider_subject, email, email_verified)
         VALUES ($1, 'google', $2, $3, TRUE)`,
        [profileId, googleSubject, normalizedEmail]
      );

      await client.query(
        `INSERT INTO profile_roles (profile_id, role)
         VALUES ($1, 'STUDENT')`,
        [profileId]
      );

      await client.query('COMMIT');

      return {
        id: profileId,
        full_name: profileResult.rows[0].full_name,
        email: normalizedEmail,
        role: 'STUDENT',
      };
    } catch (error) {
      try {
        await client.query('ROLLBACK');
      } catch (rollbackError) {
        console.error('Transaction rollback failed:', rollbackError.message);
      }

      throw error;
    } finally {
      client.release();
    }
  }

  return {
    findLocalIdentityByEmail,
    findGoogleIdentityBySubject,
    findIdentityByEmail,
    createLocalAccount,
    createGoogleAccount,
  };
}

export const authRepository = createAuthRepository();