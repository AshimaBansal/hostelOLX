import { pool, testConnection } from '../src/config/db.js';
import env from '../src/config/env.js';

async function main() {
  console.log('Testing PostgreSQL connection...');
  if (!env.databaseUrl) {
    console.error('❌ Error: DATABASE_URL is not set in backend/.env');
    process.exitCode = 1;
  }

  try {
    const info = await testConnection();
    console.log('✅ Connected successfully!');
    console.log(`   Database : ${info.db_name}`);
    console.log(`   DB Time  : ${info.current_time}`);

    const tablesRes = await pool.query(`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
      ORDER BY table_name;
    `);

    const tableNames = tablesRes.rows.map((r) => r.table_name);
    console.log(`\n📋 Found ${tableNames.length} tables in public schema:`);
    if (tableNames.length === 0) {
      console.log('   (No tables found yet. Run migration to create tables!)');
    } else {
      tableNames.forEach((t) => console.log(`   - ${t}`));
    }
  } catch (error) {
    console.error('❌ Failed to connect to database:');
    console.error(error.message);
    process.exitCode = 1;
  } finally {
    await pool.end();
  }
}

main();
