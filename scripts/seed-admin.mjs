import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { createClient } from '@supabase/supabase-js';

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

async function findUserByEmail(client, email) {
  const perPage = 200;
  let page = 1;

  while (true) {
    const { data, error } = await client.auth.admin.listUsers({ page, perPage });
    if (error) throw error;

    const match = data.users.find(
      (user) => user.email?.toLowerCase() === email.toLowerCase()
    );
    if (match) return match;
    if (data.users.length < perPage) return null;

    page += 1;
  }
}

async function main() {
  loadEnvFile();

  const url = process.env.SUPABASE_URL?.trim();
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
  const email = process.env.ADMIN_EMAIL?.trim();
  const password = process.env.ADMIN_PASSWORD;

  if (!url || !serviceRoleKey || !email || !password) {
    throw new Error(
      'Set SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, ADMIN_EMAIL, and ADMIN_PASSWORD in .env first.'
    );
  }

  if (password.length < 6) {
    console.warn(
      'Warning: Supabase projects usually require at least 6 characters. Lower the minimum password length in Authentication settings if you need a shorter password.'
    );
  }

  const client = createClient(url, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  let user = await findUserByEmail(client, email);

  if (user) {
    const { data, error } = await client.auth.admin.updateUserById(user.id, {
      password,
      email_confirm: true,
    });
    if (error) throw error;
    user = data.user;
    console.log(`Updated the existing auth user for ${email}.`);
  } else {
    const { data, error } = await client.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    });
    if (error) throw error;
    user = data.user;
    console.log(`Created a new auth user for ${email}.`);
  }

  const { error: adminError } = await client
    .from('admin_users')
    .upsert({ user_id: user.id }, { onConflict: 'user_id' });
  if (adminError) throw adminError;

  console.log(`${email} now has administrator access.`);
}

main().catch((error) => {
  console.error(`\nAdmin bootstrap failed: ${error.message || error}`);
  process.exit(1);
});
