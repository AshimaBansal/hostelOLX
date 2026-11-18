import pg from 'pg';
import env from './env.js';

const { Pool } = pg;

if (!env.DATABASE_URL) {
  throw new Error('DATABASE_URL is missing from the environment.');
}

export const pool = new Pool({
  connectionString: env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: true,
  },
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
});

pool.on('error', (error) => {
  console.error('Unexpected PostgreSQL pool error:', error.message);
});

export async function checkDatabase() {
  const result = await pool.query(`
    SELECT
      current_database() AS database,
      current_user AS username,
      NOW() AS connected_at
  `);

  return result.rows[0];
}