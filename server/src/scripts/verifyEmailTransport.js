import 'dotenv/config';
import nodemailer from 'nodemailer';

const user = String(process.env.GMAIL_USER || '').trim();
const pass = String(
  process.env.GMAIL_APP_PASSWORD || '',
).trim();

if (!user || !pass) {
  console.error(
    '[Bastly] GMAIL_USER and GMAIL_APP_PASSWORD are required.',
  );
  process.exit(1);
}

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user,
    pass,
  },
});

try {
  await transporter.verify();
  console.log(
    '[Bastly] Gmail transport verified successfully.',
  );
} catch (error) {
  console.error(
    `[Bastly] Gmail transport verification failed: ${error.message}`,
  );
  process.exit(1);
}
