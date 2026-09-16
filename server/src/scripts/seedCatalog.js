import { connectDatabase } from '../config/database.js';
import { doctorSourceCatalog as initialDoctorCatalog } from '../data/doctorSourceCatalog.js';
import { doctorEditorialFields } from '../data/doctorProfileContent.js';
import Course from '../models/Course.js';
import DoctorProfile from '../models/DoctorProfile.js';
import { slugify } from '../utils/slugify.js';

function courseSlug(doctor, item) {
  return slugify(
    `${doctor.slug}-${item.title}-${item.curriculum}-${item.academicYear}`,
  );
}

async function seedDoctor(doctor) {
  let profile = await DoctorProfile.findOne({
    $or: [{ slug: doctor.slug }, { imageUrl: doctor.imageUrl }],
  });

  if (profile) {
    console.log(`Doctor exists: ${profile.displayName}`);
    return { profile, created: false };
  }

  const editorial = doctorEditorialFields(doctor);

  profile = await DoctorProfile.create({
    displayName: doctor.displayName,
    slug: doctor.slug,
    subject: doctor.subject,
    levels: doctor.levels,
    bio: editorial.bio,
    qualifications: editorial.qualifications,
    experience: editorial.experience,
    imageUrl: doctor.imageUrl,
    isFeatured: doctor.isFeatured,
    isPublished: doctor.isPublished,
    sortOrder: doctor.sortOrder,
  });

  console.log(`Created doctor: ${profile.displayName}`);
  return { profile, created: true };
}

async function seedCourse(profile, doctor, item) {
  const existing = await Course.findOne({
    doctorProfile: profile._id,
    title: item.title,
    level: item.level,
    curriculum: item.curriculum,
    academicYear: item.academicYear,
  });

  if (existing) {
    console.log(`  Course exists: ${existing.title} · ${existing.curriculum}`);
    return false;
  }

  await Course.create({
    doctorProfile: profile._id,
    title: item.title,
    slug: courseSlug(doctor, item),
    subject: item.subject,
    level: item.level,
    curriculum: item.curriculum,
    academicYear: item.academicYear,
    description:
      item.description ||
      `Study ${item.title} with ${doctor.displayName} at Bastly Academy.`,
    price: item.price,
    currency: 'EGP',
    priceConfirmed: item.priceConfirmed,
    accessEndDate: new Date(item.accessEndDate),
    status: item.status,
    featured: item.featured,
  });

  console.log(`  Created course: ${item.title} · ${item.curriculum}`);
  return true;
}

async function run() {
  await connectDatabase();

  const nullUserCleanup = await DoctorProfile.updateMany(
    { user: null },
    { $unset: { user: 1 } },
  );

  if (nullUserCleanup.modifiedCount) {
    console.log(
      `Cleaned ${nullUserCleanup.modifiedCount} unlinked doctor profile user field(s).`,
    );
  }

  let doctorsCreated = 0;
  let coursesCreated = 0;

  for (const doctor of initialDoctorCatalog) {
    const { profile, created } = await seedDoctor(doctor);

    if (created) doctorsCreated += 1;

    for (const item of doctor.courses) {
      if (await seedCourse(profile, doctor, item)) {
        coursesCreated += 1;
      }
    }
  }

  const doctorTotal = await DoctorProfile.countDocuments();
  const publishedDoctorTotal = await DoctorProfile.countDocuments({
    isPublished: true,
  });
  const courseTotal = await Course.countDocuments({
    status: { $ne: 'archived' },
  });
  const publishedCourseTotal = await Course.countDocuments({
    status: 'published',
  });

  console.log('');
  console.log('Bastly catalog seed complete.');
  console.log(
    `Created this run: ${doctorsCreated} doctors, ${coursesCreated} courses.`,
  );
  console.log(
    `Database totals: ${doctorTotal} doctors (${publishedDoctorTotal} published).`,
  );
  console.log(
    `Database totals: ${courseTotal} courses (${publishedCourseTotal} published).`,
  );
  console.log(
    'Doctor accounts were not created. Admin can send each doctor an invitation later.',
  );
  console.log(
    'Course prices remain unconfirmed and are not shown publicly.',
  );

  process.exit(0);
}

run().catch((error) => {
  console.error('Catalog seed failed:', error.message);
  process.exit(1);
});
