import 'dotenv/config';

const errors = [];

function required(name) {
  const value = String(process.env[name] || '').trim();

  if (!value) {
    errors.push(`${name} is required.`);
  }

  return value;
}

const clientUrl = required('CLIENT_URL');
const mongoUri = required('MONGODB_URI');
const jwtSecret = required('JWT_SECRET');
const gmailUser = required('GMAIL_USER');
const gmailAppPassword = required('GMAIL_APP_PASSWORD');

if (clientUrl) {
  try {
    const url = new URL(clientUrl);

    if (url.protocol !== 'https:') {
      errors.push('CLIENT_URL must use https in production.');
    }

    if (url.pathname !== '/' || url.search || url.hash) {
      errors.push(
        'CLIENT_URL must be an origin only, without a path, query, or hash.',
      );
    }
  } catch {
    errors.push('CLIENT_URL must be a valid URL.');
  }
}

if (
  mongoUri &&
  !/^mongodb(?:\+srv)?:\/\//i.test(mongoUri)
) {
  errors.push(
    'MONGODB_URI must begin with mongodb:// or mongodb+srv://.',
  );
}

if (jwtSecret && jwtSecret.length < 32) {
  errors.push(
    'JWT_SECRET must contain at least 32 characters.',
  );
}

if (
  String(
    process.env.REQUIRE_EMAIL_VERIFICATION || '',
  ).toLowerCase() !== 'true'
) {
  errors.push(
    'REQUIRE_EMAIL_VERIFICATION must be true for production.',
  );
}

if (
  gmailUser &&
  !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(gmailUser)
) {
  errors.push('GMAIL_USER must look like an email address.');
}

if (
  gmailAppPassword &&
  gmailAppPassword.replace(/\s/g, '').length < 12
) {
  errors.push(
    'GMAIL_APP_PASSWORD does not look like an App Password.',
  );
}

if (errors.length) {
  console.error('\n[Bastly production configuration check failed]');
  for (const error of errors) {
    console.error(`- ${error}`);
  }
  console.error(
    '\nNo secret values were printed. Fix the environment variables and deploy again.\n',
  );
  process.exit(1);
}

console.log(
  '[Bastly] Production environment variables look ready.',
);
