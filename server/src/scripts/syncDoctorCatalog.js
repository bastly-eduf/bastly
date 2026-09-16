import { connectDatabase } from '../config/database.js';
import { doctorSourceCatalog } from '../data/doctorSourceCatalog.js';
import Course from '../models/Course.js';
import DoctorProfile from '../models/DoctorProfile.js';
import Enrollment from '../models/Enrollment.js';
import Group from '../models/Group.js';
import { slugify } from '../utils/slugify.js';

const APPLY = process.argv.includes('--apply');
const TARGET_YEAR = '2026/2027';

function stableArray(values = []) {
  return values.map((value) => String(value || '').trim()).filter(Boolean);
}

function sameArray(left = [], right = []) {
  return JSON.stringify(stableArray(left)) === JSON.stringify(stableArray(right));
}

function sameDate(left, right) {
  if (!left && !right) return true;
  if (!left || !right) return false;
  return new Date(left).getTime() === new Date(right).getTime();
}

function targetCourseSlug(doctor, item) {
  return slugify(
    `${doctor.slug}-${item.title}-${item.curriculum}-${item.academicYear}`,
  );
}

function courseKey(item) {
  return [
    String(item.title || '').trim().toLowerCase(),
    String(item.level || '').trim().toLowerCase(),
    String(item.curriculum || '').trim().toLowerCase(),
  ].join('|');
}

async function dependencyCounts(courseId) {
  const [groups, enrollments] = await Promise.all([
    Group.countDocuments({ course: courseId }),
    Enrollment.countDocuments({ course: courseId }),
  ]);

  return { groups, enrollments };
}

async function uniqueSlugForCourse(doctor, target, existingId = null) {
  const base = targetCourseSlug(doctor, target);
  let candidate = base;
  let suffix = 2;

  while (
    await Course.exists({
      slug: candidate,
      ...(existingId ? { _id: { $ne: existingId } } : {}),
    })
  ) {
    candidate = `${base}-${suffix}`;
    suffix += 1;
  }

  return candidate;
}

function profileChanges(profile, source) {
  const changes = {};

  if (profile.displayName !== source.displayName) {
    changes.displayName = source.displayName;
  }

  if (profile.subject !== source.subject) {
    changes.subject = source.subject;
  }

  if (!sameArray(profile.levels, source.levels)) {
    changes.levels = source.levels;
  }

  if (String(profile.bio || '').trim() !== source.bio) {
    changes.bio = source.bio;
  }

  if (!sameArray(profile.qualifications, source.qualifications)) {
    changes.qualifications = source.qualifications;
  }

  if (!sameArray(profile.experience, source.experience)) {
    changes.experience = source.experience;
  }

  return changes;
}

function courseChanges(existing, target) {
  const changes = {};

  if (existing.title !== target.title) changes.title = target.title;
  if (existing.subject !== target.subject) changes.subject = target.subject;
  if (existing.level !== target.level) changes.level = target.level;
  if (existing.curriculum !== target.curriculum) {
    changes.curriculum = target.curriculum;
  }
  if (existing.academicYear !== target.academicYear) {
    changes.academicYear = target.academicYear;
  }
  if (!sameDate(existing.accessEndDate, target.accessEndDate)) {
    changes.accessEndDate = new Date(target.accessEndDate);
  }

  return changes;
}

async function syncDoctor(source, totals) {
  const profile = await DoctorProfile.findOne({ slug: source.slug });

  if (!profile) {
    totals.missingDoctors += 1;
    console.log(`\nMISSING PROFILE: ${source.displayName}`);
    return;
  }

  console.log(`\n${source.displayName}`);

  const pChanges = profileChanges(profile, source);
  const pFields = Object.keys(pChanges);

  if (pFields.length) {
    totals.profileUpdates += 1;
    console.log(`  PROFILE: update ${pFields.join(', ')}`);
    if (APPLY) {
      Object.assign(profile, pChanges);
      await profile.save();
    }
  } else {
    console.log('  PROFILE: already matches source cards');
  }

  const existingCourses = await Course.find({
    doctorProfile: profile._id,
    academicYear: TARGET_YEAR,
  }).sort({ createdAt: 1 });

  const unused = new Set(existingCourses.map((item) => String(item._id)));
  const matched = [];

  for (const target of source.courses) {
    let existing = existingCourses.find(
      (candidate) =>
        unused.has(String(candidate._id)) &&
        courseKey(candidate) === courseKey(target),
    );

    if (!existing) {
      existing = existingCourses.find(
        (candidate) =>
          unused.has(String(candidate._id)) &&
          candidate.title === target.title,
      );
    }

    if (!existing) {
      totals.courseCreates += 1;
      console.log(
        `  COURSE: create ${target.title} · ${target.level} · ${target.curriculum}`,
      );

      if (APPLY) {
        await Course.create({
          doctorProfile: profile._id,
          title: target.title,
          slug: await uniqueSlugForCourse(source, target),
          subject: target.subject,
          level: target.level,
          curriculum: target.curriculum,
          academicYear: target.academicYear,
          description:
            target.description ||
            `Study ${target.title} with ${source.displayName} at Bastly Academy.`,
          price: target.price,
          currency: 'EGP',
          priceConfirmed: target.priceConfirmed,
          accessEndDate: new Date(target.accessEndDate),
          status: target.status,
          featured: target.featured,
        });
      }
      continue;
    }

    unused.delete(String(existing._id));
    matched.push(existing._id);

    const changes = courseChanges(existing, target);
    const fields = Object.keys(changes);

    if (!fields.length) {
      console.log(
        `  COURSE: keep ${existing.title} · ${existing.level} · ${existing.curriculum}`,
      );
      continue;
    }

    totals.courseUpdates += 1;
    const deps = await dependencyCounts(existing._id);
    console.log(
      `  COURSE: update ${existing.title} → ${target.title} [${fields.join(', ')}]` +
        (deps.groups || deps.enrollments
          ? ` (preserving ID used by ${deps.groups} group(s), ${deps.enrollments} enrollment(s))`
          : ''),
    );

    if (APPLY) {
      Object.assign(existing, changes);

      if (!deps.groups && !deps.enrollments) {
        existing.slug = await uniqueSlugForCourse(
          source,
          target,
          existing._id,
        );
      }

      await existing.save();
    }
  }

  for (const existing of existingCourses) {
    if (!unused.has(String(existing._id))) continue;

    if (existing.status === 'archived') {
      console.log(
        `  COURSE: already archived ${existing.title} · ${existing.level} · ${existing.curriculum}`,
      );
      continue;
    }

    const deps = await dependencyCounts(existing._id);

    if (deps.groups || deps.enrollments) {
      totals.courseWarnings += 1;
      console.log(
        `  WARNING: obsolete mapping NOT archived: ${existing.title} · ${existing.level} · ${existing.curriculum} ` +
          `(${deps.groups} group(s), ${deps.enrollments} enrollment(s)). Review manually.`,
      );
      continue;
    }

    totals.courseArchives += 1;
    console.log(
      `  COURSE: archive obsolete mapping ${existing.title} · ${existing.level} · ${existing.curriculum}`,
    );

    if (APPLY) {
      existing.status = 'archived';
      await existing.save();
    }
  }
}

async function run() {
  await connectDatabase();

  const totals = {
    profileUpdates: 0,
    courseCreates: 0,
    courseUpdates: 0,
    courseArchives: 0,
    courseWarnings: 0,
    missingDoctors: 0,
  };

  console.log(
    APPLY
      ? '[Bastly] APPLYING doctor source-card catalog correction.'
      : '[Bastly] DRY RUN only. No database records will be changed.',
  );
  console.log(
    '[Bastly] Source of truth: the 18 supplied June 2027 Bastly instructor cards.',
  );

  for (const doctor of doctorSourceCatalog) {
    await syncDoctor(doctor, totals);
  }

  console.log('\nDoctor catalog correction summary');
  console.log(`  Profile updates: ${totals.profileUpdates}`);
  console.log(`  Course creates: ${totals.courseCreates}`);
  console.log(`  Course updates: ${totals.courseUpdates}`);
  console.log(`  Course archives: ${totals.courseArchives}`);
  console.log(`  Dependency warnings: ${totals.courseWarnings}`);
  console.log(`  Missing doctor profiles: ${totals.missingDoctors}`);

  if (!APPLY) {
    console.log('\nNothing was changed. Run the apply command only after reviewing this output.');
  } else if (totals.courseWarnings || totals.missingDoctors) {
    console.log(
      '\nApplied safe changes, but warnings remain. Do not treat the catalog as fully reconciled until they are reviewed.',
    );
  } else {
    console.log(
      '\nApplied successfully. Images, doctor accounts, prices, enrollment history, and existing course publication/featured state were not overwritten.',
    );
  }

  process.exit(0);
}

run().catch((error) => {
  console.error('Doctor catalog correction failed:', error);
  process.exit(1);
});
