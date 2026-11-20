import pg from 'pg';
import env from './env.js';

const { Pool } = pg;

const isSslRequired =
  Boolean(env.DATABASE_URL) &&
  (env.DATABASE_URL.includes('neon.tech') ||
   env.DATABASE_URL.includes('sslmode=require') ||
   env.DATABASE_URL.includes('supabase.co') ||
   env.DATABASE_URL.includes('render.com') ||
   env.DATABASE_URL.includes('amazonaws.com') ||
   env.NODE_ENV === 'production');

export const pool = new Pool({
  connectionString: env.DATABASE_URL || 'postgresql://localhost:5432/hostelolx',
  ssl: isSslRequired ? { rejectUnauthorized: false } : false,
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
});

pool.on('error', (error) => {
  console.error('Unexpected PostgreSQL pool error:', error.message);
});

export async function checkDatabase() {
  if (!env.DATABASE_URL) {
    throw new Error('DATABASE_URL is missing from the environment.');
  }
  const result = await pool.query(`
    SELECT
      current_database() AS database,
      current_user AS username,
      NOW() AS connected_at
  `);

  return result.rows[0];
}