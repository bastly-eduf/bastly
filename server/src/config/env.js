import 'dotenv/config';

import { assertProductionEnvironment } from './productionEnv.js';

const production =
  process.env.NODE_ENV === 'production';

if (production) {
  assertProductionEnvironment(process.env);
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
  String(
    process.env.JWT_SECRET ||
      'development-only-secret-change-before-production-please',
  ).trim();

const requireEmailVerification =
  String(
    process.env.REQUIRE_EMAIL_VERIFICATION,
  ).toLowerCase() === 'true';

export const env = Object.freeze({
  nodeEnv:
    process.env.NODE_ENV || 'development',
  isProduction: production,
  port: Number(process.env.PORT || 5000),

  clientUrl: clientOrigin,
  clientOrigin,

  mongoUri:
    String(process.env.MONGODB_URI || '').trim() ||
    'mongodb://127.0.0.1:27017/bastly',

  jwtSecret,
  requireEmailVerification,

  gmailUser: String(process.env.GMAIL_USER || '').trim(),
  gmailAppPassword:
    String(process.env.GMAIL_APP_PASSWORD || '').replace(/\s/g, ''),
  emailFromName:
    String(process.env.EMAIL_FROM_NAME || 'Bastly Academy').trim(),


  r2AccountId:
    String(process.env.CLOUDFLARE_R2_ACCOUNT_ID || '').trim(),
  r2AccessKeyId:
    String(process.env.CLOUDFLARE_R2_ACCESS_KEY_ID || '').trim(),
  r2SecretAccessKey:
    String(process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY || '').trim(),
  r2Bucket:
    String(process.env.CLOUDFLARE_R2_BUCKET || '').trim(),
  r2PublicBaseUrl,

  adminName: String(process.env.ADMIN_NAME || '').trim(),
  adminEmail: String(process.env.ADMIN_EMAIL || '').trim().toLowerCase(),
  adminPassword:
    String(process.env.ADMIN_PASSWORD || ''),
  adminPhone: String(process.env.ADMIN_PHONE || '').trim(),
});
