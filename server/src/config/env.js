import 'dotenv/config';

const production =
  process.env.NODE_ENV === 'production';

const requiredInProduction = [
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
];

if (production) {
  const missing = requiredInProduction.filter(
    (key) => !process.env[key],
  );

  if (missing.length) {
    throw new Error(
      `Missing required environment variables: ${missing.join(', ')}`,
    );
  }
}

function normalizeOrigin(value, fallback) {
  const candidate = value || fallback;

  try {
    const url = new URL(candidate);

    if (!['http:', 'https:'].includes(url.protocol)) {
      throw new Error(
        'Only http/https origins are supported.',
      );
    }

    if (
      production &&
      url.protocol !== 'https:'
    ) {
      throw new Error(
        'CLIENT_URL must use https in production.',
      );
    }

    return url.origin;
  } catch (error) {
    throw new Error(
      `CLIENT_URL must be a valid http/https origin. Received: ${candidate}. ${error.message}`,
    );
  }
}

const clientOrigin = normalizeOrigin(
  process.env.CLIENT_URL,
  'http://localhost:5173',
);

function normalizeOptionalPublicUrl(value) {
  if (!value) return '';

  try {
    const url = new URL(value);

    if (!['http:', 'https:'].includes(url.protocol)) {
      throw new Error('Only http/https URLs are supported.');
    }

    if (production && url.protocol !== 'https:') {
      throw new Error(
        'CLOUDFLARE_R2_PUBLIC_BASE_URL must use https in production.',
      );
    }

    return url.toString().replace(/\/+$/, '');
  } catch (error) {
    throw new Error(
      `CLOUDFLARE_R2_PUBLIC_BASE_URL is invalid. ${error.message}`,
    );
  }
}

const r2PublicBaseUrl = normalizeOptionalPublicUrl(
  process.env.CLOUDFLARE_R2_PUBLIC_BASE_URL || '',
);


const jwtSecret =
  process.env.JWT_SECRET ||
  'development-only-secret-change-before-production-please';

if (production && jwtSecret.length < 32) {
  throw new Error(
    'JWT_SECRET must contain at least 32 characters in production.',
  );
}

if (
  production &&
  jwtSecret.includes(
    'development-only-secret',
  )
) {
  throw new Error(
    'JWT_SECRET is still using the development fallback.',
  );
}

const requireEmailVerification =
  String(
    process.env.REQUIRE_EMAIL_VERIFICATION,
  ).toLowerCase() === 'true';

if (
  production &&
  !requireEmailVerification
) {
  throw new Error(
    'REQUIRE_EMAIL_VERIFICATION must be true in production.',
  );
}

export const env = Object.freeze({
  nodeEnv:
    process.env.NODE_ENV || 'development',
  isProduction: production,
  port: Number(process.env.PORT || 5000),

  clientUrl: clientOrigin,
  clientOrigin,

  mongoUri:
    process.env.MONGODB_URI ||
    'mongodb://127.0.0.1:27017/bastly',

  jwtSecret,
  requireEmailVerification,

  gmailUser: process.env.GMAIL_USER || '',
  gmailAppPassword:
    process.env.GMAIL_APP_PASSWORD || '',
  emailFromName:
    process.env.EMAIL_FROM_NAME ||
    'Bastly Academy',


  r2AccountId:
    process.env.CLOUDFLARE_R2_ACCOUNT_ID || '',
  r2AccessKeyId:
    process.env.CLOUDFLARE_R2_ACCESS_KEY_ID || '',
  r2SecretAccessKey:
    process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY || '',
  r2Bucket:
    process.env.CLOUDFLARE_R2_BUCKET || '',
  r2PublicBaseUrl,

  adminName: process.env.ADMIN_NAME || '',
  adminEmail: process.env.ADMIN_EMAIL || '',
  adminPassword:
    process.env.ADMIN_PASSWORD || '',
  adminPhone: process.env.ADMIN_PHONE || '',
});
