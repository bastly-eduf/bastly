import bcrypt from 'bcryptjs';

import { connectDatabase } from '../config/database.js';
import { env } from '../config/env.js';
import User from '../models/User.js';

async function run() {
  if (!env.adminName || !env.adminEmail || !env.adminPassword) {
    throw new Error(
      'Set ADMIN_NAME, ADMIN_EMAIL, and ADMIN_PASSWORD in server/.env before running seed:admin.',
    );
  }

  if (env.adminPassword.length < 10) {
    throw new Error('ADMIN_PASSWORD should be at least 10 characters.');
  }

  await connectDatabase();

  const email = env.adminEmail.trim().toLowerCase();
  const existing = await User.findOne({ email });

  if (existing) {
    if (existing.role !== 'admin') {
      throw new Error('That email already belongs to a non-admin Bastly account.');
    }

    console.log(`Admin already exists: ${email}`);
    process.exit(0);
  }

  const passwordHash = await bcrypt.hash(env.adminPassword, 12);

  await User.create({
    fullName: env.adminName.trim(),
    email,
    phone: env.adminPhone.trim(),
    passwordHash,
    role: 'admin',
    status: 'active',
    emailVerifiedAt: new Date(),
  });

  console.log(`Created Bastly admin: ${email}`);
  process.exit(0);
}

run().catch((error) => {
  console.error('Admin seed failed:', error.message);
  process.exit(1);
});
