import 'dotenv/config';

const requiredInProduction = ['CLIENT_URL', 'MONGODB_URI', 'JWT_SECRET'];

if (process.env.NODE_ENV === 'production') {
  const missing = requiredInProduction.filter((key) => !process.env[key]);

  if (missing.length) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }
}

export const env = Object.freeze({
  nodeEnv: process.env.NODE_ENV || 'development',
  port: Number(process.env.PORT || 5000),
  clientUrl: process.env.CLIENT_URL || 'http://localhost:5173',
  mongoUri: process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/bastly',
  jwtSecret:
    process.env.JWT_SECRET ||
    'development-only-secret-change-before-production-please',
  requireEmailVerification:
    String(process.env.REQUIRE_EMAIL_VERIFICATION).toLowerCase() === 'true',

  gmailUser: process.env.GMAIL_USER || '',
  gmailAppPassword: process.env.GMAIL_APP_PASSWORD || '',
  emailFromName: process.env.EMAIL_FROM_NAME || 'Bastly Academy',

  adminName: process.env.ADMIN_NAME || '',
  adminEmail: process.env.ADMIN_EMAIL || '',
  adminPassword: process.env.ADMIN_PASSWORD || '',
  adminPhone: process.env.ADMIN_PHONE || '',
});
