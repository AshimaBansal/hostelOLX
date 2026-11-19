import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { pool, testConnection } from '../src/config/db.js';
import env from '../src/config/env.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '../..');

async function runSqlFile(filePath, label) {
  console.log(`\n📄 Running ${label} (${path.relative(rootDir, filePath)})...`);
  if (!fs.existsSync(filePath)) {
    console.warn(`⚠️ File not found: ${filePath}`);
    return;
  }

  const sql = fs.readFileSync(filePath, 'utf8');
  await pool.query(sql);
  console.log(`✅ Finished ${label}.`);
}

async function main() {
  console.log('🚀 Running database migrations and seeds...');
  if (!env.databaseUrl) {
    console.error('❌ Error: DATABASE_URL is not set in backend/.env');
    process.exit(1);
  }

  try {
    const info = await testConnection();
    console.log(`✅ Connected to database: ${info.db_name}`);

    // 1. Initial schema migration
    const migrationFile = path.join(rootDir, 'database/migrations/001_initial_schema.sql');
    await runSqlFile(migrationFile, '001_initial_schema.sql');

    // 2. Seed data
    const seedFile = path.join(rootDir, 'database/seed.sql');
    await runSqlFile(seedFile, 'seed.sql');

    console.log('\n🎉 Database setup and migrations completed successfully!');
  } catch (error) {
    console.error('❌ Migration failed:');
    console.error(error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

main();
