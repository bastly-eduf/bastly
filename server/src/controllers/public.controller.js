import Course from '../models/Course.js';
import DoctorProfile from '../models/DoctorProfile.js';
import Group from '../models/Group.js';
import { HttpError } from '../utils/httpError.js';
import { doctorMediaPresentation } from '../services/media.service.js';

function setPublicCache(res) {
  res.set(
    'Cache-Control',
    'public, max-age=60, stale-while-revalidate=300',
  );
}

function publicDoctor(profile, courseCount = 0) {
  const media = doctorMediaPresentation(profile);

  return {
    _id: profile._id,
    displayName: profile.displayName,
    slug: profile.slug,
    subject: profile.subject,
    levels: profile.levels || [],
    bio: profile.bio || '',
    qualifications: profile.qualifications || [],
    experience: profile.experience || [],
    imageUrl: media.imageUrl,
    imageVariants: media.imageVariants,
    isFeatured: Boolean(profile.isFeatured),
    courseCount,
  };
}

function publicCourse(course) {
  return {
    _id: course._id,
    title: course.title,
    slug: course.slug,
    subject: course.subject,
    level: course.level,
    curriculum: course.curriculum || '',
    academicYear: course.academicYear,
    description: course.description || '',
    priceConfirmed: Boolean(course.priceConfirmed),
    price: course.priceConfirmed ? Number(course.price) : null,
    currency: course.currency || 'EGP',
    accessEndDate: course.accessEndDate,
    featured: Boolean(course.featured),
    doctorProfile: course.doctorProfile
      ? publicDoctor(course.doctorProfile)
      : null,
  };
}

export async function listPublicDoctors(req, res) {
  setPublicCache(res);

  const parsedLimit = Number.parseInt(req.query.limit, 10);
  const limit = Number.isFinite(parsedLimit)
    ? Math.max(1, Math.min(parsedLimit, 100))
    : 100;

  const doctors = await DoctorProfile.find({
    isPublished: true,
  })
    .select(
      'displayName slug subject levels bio qualifications experience imageUrl imageMedia isFeatured sortOrder',
    )
    .sort({
      isFeatured: -1,
      sortOrder: 1,
      displayName: 1,
    })
    .limit(limit)
    .lean();

  const courseCounts = await Course.aggregate([
    {
      $match: {
        doctorProfile: {
          $in: doctors.map((doctor) => doctor._id),
        },
        status: 'published',
      },
    },
    {
      $group: {
        _id: '$doctorProfile',
        count: { $sum: 1 },
      },
    },
  ]);

  const courseCountMap = new Map(
    courseCounts.map((item) => [
      String(item._id),
      item.count,
    ]),
  );

  const subjects = [
    ...new Set(
      doctors
        .map((doctor) => doctor.subject)
        .filter(Boolean),
    ),
  ].sort((a, b) => a.localeCompare(b));

  const levels = [
    ...new Set(
      doctors.flatMap((doctor) => doctor.levels || []),
    ),
  ].sort((a, b) => a.localeCompare(b));

  return res.json({
    doctors: doctors.map((doctor) =>
      publicDoctor(
        doctor,
        courseCountMap.get(String(doctor._id)) || 0,
      ),
    ),
    filters: {
      subjects,
      levels,
    },
  });
}

export async function getPublicDoctor(req, res) {
  setPublicCache(res);

  const doctor = await DoctorProfile.findOne({
    slug: String(req.params.slug || '').toLowerCase(),
    isPublished: true,
  })
    .select(
      'displayName slug subject levels bio qualifications experience imageUrl imageMedia isFeatured sortOrder',
    )
    .lean();

  if (!doctor) {
    throw new HttpError(404, 'Instructor not found.');
  }

  const courses = await Course.find({
    doctorProfile: doctor._id,
    status: 'published',
  })
    .select(
      'doctorProfile title slug subject level curriculum academicYear description price priceConfirmed currency accessEndDate featured',
    )
    .sort({
      featured: -1,
      createdAt: -1,
    })
    .lean();

  return res.json({
    doctor: publicDoctor(doctor, courses.length),
    courses: courses.map((course) =>
      publicCourse({
        ...course,
        doctorProfile: doctor,
      }),
    ),
  });
}

export async function listPublicCourses(req, res) {
  setPublicCache(res);

  const parsedLimit = Number.parseInt(req.query.limit, 10);
  const limit = Number.isFinite(parsedLimit)
    ? Math.max(1, Math.min(parsedLimit, 100))
    : 100;

  const courses = await Course.find({
    status: 'published',
  })
    .select(
      'doctorProfile title slug subject level curriculum academicYear description price priceConfirmed currency accessEndDate featured createdAt',
    )
    .populate({
      path: 'doctorProfile',
      match: {
        isPublished: true,
      },
      select:
        'displayName slug subject levels bio qualifications experience imageUrl imageMedia isFeatured',
    })
    .sort({
      featured: -1,
      createdAt: -1,
    })
    .limit(limit)
    .lean();

  const visibleCourses = courses.filter(
    (course) => course.doctorProfile,
  );

  const filters = {
    subjects: [
      ...new Set(
        visibleCourses
          .map((course) => course.subject)
          .filter(Boolean),
      ),
    ].sort((a, b) => a.localeCompare(b)),
    levels: [
      ...new Set(
        visibleCourses
          .map((course) => course.level)
          .filter(Boolean),
      ),
    ].sort((a, b) => a.localeCompare(b)),
    curricula: [
      ...new Set(
        visibleCourses
          .map((course) => course.curriculum)
          .filter(Boolean),
      ),
    ].sort((a, b) => a.localeCompare(b)),
  };

  return res.json({
    courses: visibleCourses.map(publicCourse),
    filters,
  });
}

export async function getPublicCourse(req, res) {
  setPublicCache(res);

  const course = await Course.findOne({
    slug: String(req.params.slug || '').toLowerCase(),
    status: 'published',
  })
    .select(
      'doctorProfile title slug subject level curriculum academicYear description price priceConfirmed currency accessEndDate featured',
    )
    .populate({
      path: 'doctorProfile',
      match: {
        isPublished: true,
      },
      select:
        'displayName slug subject levels bio qualifications experience imageUrl imageMedia isFeatured',
    })
    .lean();

  if (!course || !course.doctorProfile) {
    throw new HttpError(404, 'Course not found.');
  }

  const groups = await Group.find({
    course: course._id,
    active: true,
  })
    .select('name scheduleLabel')
    .sort({ name: 1 })
    .lean();

  return res.json({
    course: publicCourse(course),
    groups: groups.map((group) => ({
      _id: group._id,
      name: group.name,
      scheduleLabel: group.scheduleLabel || '',
    })),
  });
}
