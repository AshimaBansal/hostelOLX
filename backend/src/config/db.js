import pg from 'pg';
import env from './env.js';

const { Pool } = pg;

const isSslRequired =
  env.databaseUrl.includes('neon.tech') ||
  env.databaseUrl.includes('sslmode=require') ||
  env.isProduction;

export const pool = new Pool({
  connectionString: env.databaseUrl,
  ssl: isSslRequired ? { rejectUnauthorized: false } : false,
});

pool.on('error', (err) => {
  console.error('Unexpected error on idle PostgreSQL client:', err);
});

export const query = (text, params) => pool.query(text, params);

export const getClient = () => pool.connect();

export async function testConnection() {
  if (!env.databaseUrl) {
    throw new Error('DATABASE_URL is not configured in .env');
  }
  const client = await pool.connect();
  try {
    const res = await client.query('SELECT NOW() as current_time, current_database() as db_name');
    return res.rows[0];
  } finally {
    client.release();
  }
}

export default {
  pool,
  query,
  getClient,
  testConnection,
};
