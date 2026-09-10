import 'dotenv/config';

const production =
  process.env.NODE_ENV === 'production';

const requiredInProduction = [
  'CLIENT_URL',
  'MONGODB_URI',
  'JWT_SECRET',
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
      throw new Error('Only http/https origins are supported.');
    }

    return url.origin;
  } catch {
    throw new Error(
      `CLIENT_URL must be a valid http/https origin. Received: ${candidate}`,
    );
  }
}

const clientOrigin = normalizeOrigin(
  process.env.CLIENT_URL,
  'http://localhost:5173',
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
  jwtSecret.includes('development-only-secret')
) {
  throw new Error(
    'JWT_SECRET is still using the development fallback.',
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

  requireEmailVerification:
    String(
      process.env.REQUIRE_EMAIL_VERIFICATION,
    ).toLowerCase() === 'true',

  gmailUser: process.env.GMAIL_USER || '',
  gmailAppPassword:
    process.env.GMAIL_APP_PASSWORD || '',
  emailFromName:
    process.env.EMAIL_FROM_NAME ||
    'Bastly Academy',

  adminName: process.env.ADMIN_NAME || '',
  adminEmail: process.env.ADMIN_EMAIL || '',
  adminPassword:
    process.env.ADMIN_PASSWORD || '',
  adminPhone: process.env.ADMIN_PHONE || '',
});
