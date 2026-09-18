import fs from 'node:fs/promises';
import path from 'node:path';

function parseEnv(text) {
  const values = {};

  for (const rawLine of text.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith('#')) continue;

    const match = line.match(/^([A-Za-z_][A-Za-z0-9_]*)=(.*)$/);
    if (!match) continue;

    let value = match[2].trim();
    if (
      (value.startsWith('\"') && value.endsWith('\"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    values[match[1]] = value;
  }

  return values;
}

async function loadBuildEnv() {
  const cwd = process.cwd();
  const loaded = {};
  const filenames = [
    '.env',
    '.env.local',
    '.env.production',
    '.env.production.local',
  ];

  for (const filename of filenames) {
    try {
      Object.assign(
        loaded,
        parseEnv(await fs.readFile(path.join(cwd, filename), 'utf8')),
      );
    } catch {
      // Optional env file.
    }
  }

  return { ...loaded, ...process.env };
}

const env = await loadBuildEnv();
const forceProduction = process.argv.includes('--production');
const production = forceProduction;
const errors = [];
const warnings = [];

function clean(name) {
  return String(env[name] || '').trim();
}

function looksPlaceholder(value) {
  const lower = value.toLowerCase();
  return (
    lower.includes('replace-with') ||
    lower.includes('change-me') ||
    lower.includes('changeme') ||
    lower.includes('your_') ||
    lower.includes('your-') ||
    lower.includes('<your') ||
    lower.includes('example.com')
  );
}

function validateHttpsOrigin(name, value, required = false) {
  if (!value) {
    if (required) errors.push(`${name} is required for a production build.`);
    return '';
  }

  if (looksPlaceholder(value)) {
    errors.push(`${name} still looks like a placeholder value.`);
    return '';
  }

  try {
    const url = new URL(value);

    if (url.protocol !== 'https:') {
      errors.push(`${name} must use https in production.`);
    }

    if (url.pathname !== '/' || url.search || url.hash) {
      errors.push(`${name} must be an origin only, without a path, query, or hash.`);
    }

    if (['localhost', '127.0.0.1', '::1'].includes(url.hostname.toLowerCase())) {
      errors.push(`${name} cannot point to localhost in production.`);
    }

    return url.origin;
  } catch {
    errors.push(`${name} must be a valid URL.`);
    return '';
  }
}

function validatePublicBusinessConfig() {
  const whatsapp = clean('VITE_BASTLY_WHATSAPP_NUMBER').replace(/\D/g, '');
  const phoneDisplay = clean('VITE_BASTLY_PHONE_DISPLAY');
  const instagramUrl = clean('VITE_BASTLY_INSTAGRAM_URL');

  if (!whatsapp || whatsapp.length < 10 || whatsapp.length > 15) {
    errors.push(
      'VITE_BASTLY_WHATSAPP_NUMBER must be the international WhatsApp number using digits only.',
    );
  }

  if (!phoneDisplay) {
    errors.push('VITE_BASTLY_PHONE_DISPLAY is required for a production build.');
  }

  if (!instagramUrl) {
    errors.push('VITE_BASTLY_INSTAGRAM_URL is required for a production build.');
  } else {
    try {
      const url = new URL(instagramUrl);
      if (url.protocol !== 'https:' || !/(^|\.)instagram\.com$/i.test(url.hostname)) {
        errors.push('VITE_BASTLY_INSTAGRAM_URL must be an https://instagram.com URL.');
      }
    } catch {
      errors.push('VITE_BASTLY_INSTAGRAM_URL must be a valid URL.');
    }
  }
}

const forbiddenClientSecrets = [
  'VITE_JWT_SECRET',
  'VITE_MONGODB_URI',
  'VITE_GMAIL_APP_PASSWORD',
  'VITE_CLOUDFLARE_R2_ACCESS_KEY_ID',
  'VITE_CLOUDFLARE_R2_SECRET_ACCESS_KEY',
];

for (const name of forbiddenClientSecrets) {
  if (clean(name)) {
    errors.push(`${name} must never be exposed through Vite/client environment variables.`);
  }
}

const apiUrl = clean('VITE_API_URL');
if (production && apiUrl && apiUrl !== '/api') {
  errors.push('VITE_API_URL must be /api in production so auth stays same-origin.');
}

if (production) {
  validateHttpsOrigin('BACKEND_URL', clean('BACKEND_URL'), true);

  const explicitSiteUrl = clean('VITE_SITE_URL');
  if (explicitSiteUrl) {
    validateHttpsOrigin('VITE_SITE_URL', explicitSiteUrl, true);
  } else {
    errors.push(
      'VITE_SITE_URL is required for a production build so SEO canonicals use the final Bastly frontend origin.',
    );
  }

  validatePublicBusinessConfig();
}

if (warnings.length) {
  console.warn('\n[Bastly client environment warnings]');
  for (const warning of warnings) console.warn(`- ${warning}`);
}

if (errors.length) {
  console.error('\n[Bastly client environment check failed]');
  for (const error of errors) console.error(`- ${error}`);
  console.error('\nNo environment values were printed.\n');
  process.exit(1);
}

console.log(
  production
    ? '[Bastly] Production client/build environment looks ready.'
    : '[Bastly] Client environment check passed (development mode).',
);
