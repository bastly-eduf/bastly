import { connectDatabase } from '../config/database.js';
import { doctorSourceCatalog } from '../data/doctorSourceCatalog.js';
import DoctorProfile from '../models/DoctorProfile.js';

function stableArray(values = []) {
  return values.map((value) => String(value || '').trim()).filter(Boolean);
}

function sameArray(left = [], right = []) {
  return JSON.stringify(stableArray(left)) === JSON.stringify(stableArray(right));
}

async function run() {
  await connectDatabase();

  let updated = 0;
  let skipped = 0;
  let missing = 0;

  for (const source of doctorSourceCatalog) {
    const profile = await DoctorProfile.findOne({ slug: source.slug });

    if (!profile) {
      missing += 1;
      console.log(`Missing doctor profile: ${source.displayName}`);
      continue;
    }

    let changed = false;

    if (profile.displayName !== source.displayName) {
      profile.displayName = source.displayName;
      changed = true;
    }

    if (profile.subject !== source.subject) {
      profile.subject = source.subject;
      changed = true;
    }

    if (!sameArray(profile.levels, source.levels)) {
      profile.levels = source.levels;
      changed = true;
    }

    if (String(profile.bio || '').trim() !== source.bio) {
      profile.bio = source.bio;
      changed = true;
    }

    if (!sameArray(profile.qualifications, source.qualifications)) {
      profile.qualifications = source.qualifications;
      changed = true;
    }

    if (!sameArray(profile.experience, source.experience)) {
      profile.experience = source.experience;
      changed = true;
    }

    if (!changed) {
      skipped += 1;
      console.log(`Profile already matches source cards: ${source.displayName}`);
      continue;
    }

    await profile.save();
    updated += 1;
    console.log(`Updated profile from source cards: ${source.displayName}`);
  }

  console.log('');
  console.log('Doctor profile source-card sync complete.');
  console.log(`Updated: ${updated}`);
  console.log(`Already current: ${skipped}`);
  console.log(`Missing profiles: ${missing}`);
  console.log(
    'Images, accounts, courses, publication state, featured state, and prices were not changed.',
  );

  process.exit(0);
}

run().catch((error) => {
  console.error('Doctor profile sync failed:', error);
  process.exit(1);
});
