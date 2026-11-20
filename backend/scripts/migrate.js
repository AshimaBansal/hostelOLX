import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { pool, testConnection } from '../src/config/db.js';
import env from '../src/config/env.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '../..');
const migrationsDir = path.join(rootDir, 'database/migrations');

async function ensureMigrationTable() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      version VARCHAR(100) PRIMARY KEY,
      applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);
}

async function getAppliedMigrations() {
  const result = await pool.query('SELECT version FROM schema_migrations');
  return new Set(result.rows.map((row) => row.version));
}

async function runSqlFile(filePath, label) {
  const sql = fs.readFileSync(filePath, 'utf8');
  await pool.query(sql);
}

async function main() {
  console.log('🚀 Running database migrations and seeds...\n');

  if (!env.databaseUrl) {
    console.error('❌ Error: DATABASE_URL is not set in backend/.env');
    process.exit(1);
  }

  try {
    const info = await testConnection();
    console.log(`✅ Connected to database: ${info.db_name}`);

    await ensureMigrationTable();
    const appliedVersions = await getAppliedMigrations();

    if (!fs.existsSync(migrationsDir)) {
      console.warn(`⚠️ Migrations directory not found at: ${migrationsDir}`);
      return;
    }

    const migrationFiles = fs
      .readdirSync(migrationsDir)
      .filter((file) => file.endsWith('.sql'))
      .sort((a, b) => a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' }));

    console.log(`📂 Found ${migrationFiles.length} migration file(s) in database/migrations/\n`);

    let appliedCount = 0;

    for (const file of migrationFiles) {
      const version = path.basename(file, '.sql');
      const filePath = path.join(migrationsDir, file);

      if (appliedVersions.has(version)) {
        console.log(`  ⏭️  Skipping ${file} (already applied)`);
      } else {
        console.log(`  ▶️  Applying ${file}...`);
        await runSqlFile(filePath, file);

        // Ensure record exists in schema_migrations even if migration SQL didn't insert it
        await pool.query(
          `INSERT INTO schema_migrations (version) VALUES ($1) ON CONFLICT (version) DO NOTHING`,
          [version]
        );

        appliedCount += 1;
        console.log(`  ✅ Successfully applied ${file}`);
      }
    }

    console.log(`\n📊 Migrations summary: ${appliedCount} newly applied, ${migrationFiles.length - appliedCount} previously applied.`);

    // Run seed data
    const seedFile = path.join(rootDir, 'database/seed.sql');
    if (fs.existsSync(seedFile)) {
      console.log('\n🌱 Running seed.sql...');
      await runSqlFile(seedFile, 'seed.sql');
      console.log('✅ Finished seeding.');
    }

    console.log('\n🎉 Database setup and migrations completed successfully!');
  } catch (error) {
    console.error('\n❌ Migration failed:');
    console.error(error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

main();
