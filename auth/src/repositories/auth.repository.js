import { randomUUID } from 'node:crypto';
import { pool } from '../config/database.js';

export async function findLocalIdentityByEmail(email) {
  const result = await pool.query(
    `SELECT
       ai.id AS identity_id,
       ai.email,
       ai.password_hash,
       ai.email_verified,
       p.id AS profile_id,
       p.full_name,
       p.phone,
       p.hostel_name,
       p.room_number
     FROM auth_identities ai
     JOIN profiles p ON p.id = ai.profile_id
     WHERE ai.provider = 'local'
       AND LOWER(ai.email) = LOWER($1)
     LIMIT 1`,
    [email.trim()]
  );

  return result.rows[0] ?? null;
}

export async function findGoogleIdentityBySubject(subject) {
  const result = await pool.query(
    `SELECT
       ai.id AS identity_id,
       ai.email,
       p.id AS profile_id,
       p.full_name
     FROM auth_identities ai
     JOIN profiles p ON p.id = ai.profile_id
     WHERE ai.provider = 'google'
       AND ai.provider_subject = $1
     LIMIT 1`,
    [subject]
  );

  return result.rows[0] ?? null;
}

export async function createLocalAccount({
  fullName,
  email,
  passwordHash,
}) {
  const client = await pool.connect();

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