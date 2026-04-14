#!/usr/bin/env node
/**
 * Runs supabase/migrations/0001_init.sql against the project.
 *
 * Requires SUPABASE_SERVICE_ROLE_KEY in .env.local (the anon key cannot run DDL).
 * If the REST endpoint is unavailable, prints instructions to run the SQL
 * manually in the Supabase SQL Editor.
 */
import { config as dotenvConfig } from 'dotenv';
dotenvConfig({ path: '.env.local' });

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL');
  process.exit(1);
}

const migrationPath = path.join(__dirname, '..', 'supabase', 'migrations', '0001_init.sql');
const sql = fs.readFileSync(migrationPath, 'utf8');

function manualInstructions() {
  console.log('\n→ Run the migration manually in the Supabase dashboard:');
  console.log('  1. Open https://supabase.com/dashboard/project/khvwtlmfvcipmaiiwgie/sql/new');
  console.log(`  2. Paste the contents of ${path.relative(process.cwd(), migrationPath)}`);
  console.log('  3. Click "Run"');
  console.log('  4. Then run: node scripts/migrate-data.mjs');
}

async function main() {
  if (!SERVICE_KEY) {
    console.log('SUPABASE_SERVICE_ROLE_KEY is not set in .env.local.');
    console.log('DDL cannot be executed with only the anon key.');
    manualInstructions();
    return;
  }

  const endpoints = [
    `${SUPABASE_URL}/pg/query`,
    `${SUPABASE_URL}/rest/v1/rpc/exec_sql`,
  ];

  for (const url of endpoints) {
    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          apikey: SERVICE_KEY,
          Authorization: `Bearer ${SERVICE_KEY}`,
        },
        body: JSON.stringify({ query: sql }),
      });
      if (res.ok) {
        console.log(`✓ Migration executed via ${url}`);
        return;
      }
      console.log(`  ${url} → HTTP ${res.status}`);
    } catch (e) {
      console.log(`  ${url} → ${e.message}`);
    }
  }

  console.log('\nCould not execute SQL via API automatically.');
  manualInstructions();
}

main();
