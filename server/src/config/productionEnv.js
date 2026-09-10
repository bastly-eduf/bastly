export const PRODUCTION_REQUIRED_ENV = Object.freeze([
  'CLIENT_URL',
  'MONGODB_URI',
  'JWT_SECRET',
  'GMAIL_USER',
  'GMAIL_APP_PASSWORD',
  'CLOUDFLARE_R2_ACCOUNT_ID',
  'CLOUDFLARE_R2_ACCESS_KEY_ID',
  'CLOUDFLARE_R2_SECRET_ACCESS_KEY',
  'CLOUDFLARE_R2_BUCKET',
  'CLOUDFLARE_R2_PUBLIC_BASE_URL',
]);

function valueOf(source, name) {
  return String(source[name] || '').trim();
}

function looksLikePlaceholder(name, value) {
  const lower = value.toLowerCase();

  if (
    lower.includes('replace-with') ||
    lower.includes('change-me') ||
    lower.includes('changeme') ||
    lower.includes('your_') ||
    lower.includes('your-') ||
    lower.includes('<your') ||
    lower.includes('example.com')
  ) {
    return true;
  }

  if (
    name === 'JWT_SECRET' &&
    (lower.includes('development-only') || lower.includes('secret-change'))
  ) {
    return true;
  }

  if (
    name === 'MONGODB_URI' &&
    (lower.includes('localhost') || lower.includes('127.0.0.1'))
  ) {
    return true;
  }

  return false;
}

function validateHttpsOrigin(name, value, errors) {
  try {
    const url = new URL(value);

    if (url.protocol !== 'https:') {
      errors.push(`${name} must use https in production.`);
    }

    if (url.pathname !== '/' || url.search || url.hash) {
      errors.push(`${name} must be an origin only, without a path, query, or hash.`);
    }

    if (
      ['localhost', '127.0.0.1', '::1'].includes(url.hostname.toLowerCase())
    ) {
      errors.push(`${name} cannot point to localhost in production.`);
    }
  } catch {
    errors.push(`${name} must be a valid URL.`);
  }
}

export function validateProductionEnvironment(source = process.env) {
  const errors = [];
  const warnings = [];

  for (const name of PRODUCTION_REQUIRED_ENV) {
    const value = valueOf(source, name);

    if (!value) {
      errors.push(`${name} is required.`);
      continue;
    }

    if (looksLikePlaceholder(name, value)) {
      errors.push(`${name} still looks like a placeholder or development value.`);
    }
  }

  const clientUrl = valueOf(source, 'CLIENT_URL');
  const mongoUri = valueOf(source, 'MONGODB_URI');
  const jwtSecret = valueOf(source, 'JWT_SECRET');
  const gmailUser = valueOf(source, 'GMAIL_USER');
  const gmailAppPassword = valueOf(source, 'GMAIL_APP_PASSWORD');
  const r2AccountId = valueOf(source, 'CLOUDFLARE_R2_ACCOUNT_ID');
  const r2AccessKeyId = valueOf(source, 'CLOUDFLARE_R2_ACCESS_KEY_ID');
  const r2SecretAccessKey = valueOf(source, 'CLOUDFLARE_R2_SECRET_ACCESS_KEY');
  const r2Bucket = valueOf(source, 'CLOUDFLARE_R2_BUCKET');
  const r2PublicBaseUrl = valueOf(source, 'CLOUDFLARE_R2_PUBLIC_BASE_URL');

  if (clientUrl) {
    validateHttpsOrigin('CLIENT_URL', clientUrl, errors);
  }

  if (mongoUri && !/^mongodb(?:\+srv)?:\/\//i.test(mongoUri)) {
    errors.push('MONGODB_URI must begin with mongodb:// or mongodb+srv://.');
  }

  if (jwtSecret && jwtSecret.length < 32) {
    errors.push('JWT_SECRET must contain at least 32 characters.');
  }

  if (
    String(source.REQUIRE_EMAIL_VERIFICATION || '').trim().toLowerCase() !==
    'true'
  ) {
    errors.push('REQUIRE_EMAIL_VERIFICATION must be true for production.');
  }

  if (gmailUser && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(gmailUser)) {
    errors.push('GMAIL_USER must look like an email address.');
  }

  if (gmailAppPassword && gmailAppPassword.replace(/\s/g, '').length < 12) {
    errors.push('GMAIL_APP_PASSWORD does not look like an App Password.');
  }

  if (r2PublicBaseUrl) {
    validateHttpsOrigin(
      'CLOUDFLARE_R2_PUBLIC_BASE_URL',
      r2PublicBaseUrl,
      errors,
    );
  }

  if (r2AccountId && !/^[A-Za-z0-9]{32}$/.test(r2AccountId)) {
    warnings.push(
      'CLOUDFLARE_R2_ACCOUNT_ID does not look like the usual 32-character account ID. Verify it before launch.',
    );
  }

  if (r2AccessKeyId && r2AccessKeyId.length < 10) {
    errors.push('CLOUDFLARE_R2_ACCESS_KEY_ID looks too short.');
  }

  if (r2SecretAccessKey && r2SecretAccessKey.length < 20) {
    errors.push('CLOUDFLARE_R2_SECRET_ACCESS_KEY looks too short.');
  }

  if (r2Bucket && !/^[a-z0-9](?:[a-z0-9-]{1,61})[a-z0-9]$/.test(r2Bucket)) {
    errors.push(
      'CLOUDFLARE_R2_BUCKET must be 3-63 lowercase letters/numbers/hyphens and cannot start or end with a hyphen.',
    );
  }

  return { errors, warnings };
}

export function assertProductionEnvironment(source = process.env) {
  const { errors } = validateProductionEnvironment(source);

  if (errors.length) {
    throw new Error(
      `Invalid production environment configuration:\n- ${errors.join('\n- ')}`,
    );
  }
}
