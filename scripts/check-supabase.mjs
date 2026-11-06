import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';

function loadEnvFile() {
  const envPath = resolve(process.cwd(), '.env');
  if (!existsSync(envPath)) return;

  const contents = readFileSync(envPath, 'utf8');
  contents.split(/\r?\n/).forEach((line) => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) return;

    const separator = trimmed.indexOf('=');
    if (separator === -1) return;

    const key = trimmed.slice(0, separator).trim();
    let value = trimmed.slice(separator + 1).trim();

    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }

    if (!process.env[key]) process.env[key] = value;
  });
}

function label(value, fallback = 'missing') {
  return value ? 'set' : fallback;
}

async function main() {
  loadEnvFile();

  const url = (process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || '')
    .trim()
    .replace(/\/+$/, '');
  const anonKey = process.env.VITE_SUPABASE_ANON_KEY?.trim();
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
  const adminEmail = process.env.ADMIN_EMAIL?.trim();
  const adminPassword = process.env.ADMIN_PASSWORD?.trim();

  console.log('Supabase connection');
  console.log(`  URL: ${url || 'missing'}`);
  console.log(`  Anon key: ${label(anonKey)}`);
  console.log(`  Service role key: ${label(serviceKey)}`);

  if (!url || !anonKey) {
    console.log('\nAdd VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to .env first.');
    process.exitCode = 1;
    return;
  }

  console.log('\nDatabase schema');
  const response = await fetch(`${url}/rest/v1/site_profile?select=id&limit=1`, {
    headers: {
      apikey: anonKey,
      Authorization: `Bearer ${anonKey}`,
    },
  });
  const body = await response.text();

  if (response.ok) {
    console.log('  Installed — public tables are reachable.');
  } else if (
    response.status === 404 &&
    (body.includes('PGRST205') || body.includes('Could not find the table'))
  ) {
    console.log('  Missing — run supabase/schema.sql in the Supabase SQL editor.');
    process.exitCode = 1;
  } else {
    console.log(`  Check failed: HTTP ${response.status} ${body.slice(0, 240)}`);
    process.exitCode = 1;
  }

  console.log('\nAdmin bootstrap');
  console.log(`  Email: ${adminEmail || 'missing'}`);
  console.log(`  Password: ${adminPassword ? 'set' : 'missing'}`);
  console.log(`  Service role key: ${label(serviceKey)}`);

  if (!adminEmail || !adminPassword || !serviceKey) {
    console.log('\nAdd ADMIN_EMAIL, ADMIN_PASSWORD, and SUPABASE_SERVICE_ROLE_KEY to .env, then run npm run seed:admin.');
  }
}

main().catch((error) => {
  console.error(`\nSupabase check failed: ${error.message || error}`);
  process.exitCode = 1;
});
