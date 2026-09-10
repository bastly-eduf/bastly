import mongoose from 'mongoose';

import Course from '../models/Course.js';
import DoctorProfile from '../models/DoctorProfile.js';
import Enrollment from '../models/Enrollment.js';
import Group from '../models/Group.js';
import StudentProfile from '../models/StudentProfile.js';
import User from '../models/User.js';
import {
  academicYearLabel,
  upcomingJune30,
} from '../utils/academicYear.js';
import { HttpError } from '../utils/httpError.js';
import { slugify } from '../utils/slugify.js';
import { writeAuditLog } from '../services/audit.service.js';
import { doctorMediaPresentation } from '../services/media.service.js';
import {
  activateEnrollment,
  createOrResetPendingEnrollment,
  unregisterEnrollment as unregisterEnrollmentService,
} from '../services/enrollment.service.js';

async function uniqueSlug(Model, seed, ignoreId = null) {
  const base = slugify(seed) || 'item';
  let candidate = base;
  let suffix = 2;

  while (
    await Model.exists({
      slug: candidate,
      ...(ignoreId && { _id: { $ne: ignoreId } }),
    })
  ) {
    candidate = `${base}-${suffix}`;
    suffix += 1;
  }

  return candidate;
}

function decorateDoctorProfile(profile) {
  if (!profile) return profile;

  const plain =
    typeof profile.toObject === 'function'
      ? profile.toObject()
      : profile;
  const media = doctorMediaPresentation(plain);

  return {
    ...plain,
    legacyImageUrl: plain.imageUrl || '',
    ...media,
  };
}

function decorateCourse(course) {
  if (!course?.doctorProfile) return course;

  return {
    ...course,
    doctorProfile: decorateDoctorProfile(
      course.doctorProfile,
    ),
  };
}

export async function overview(req, res) {
  const [
    doctorProfiles,
    courses,
    groups,
    activeStudents,
    pendingEnrollments,
    activeEnrollments,
  ] = await Promise.all([
    DoctorProfile.countDocuments({ isPublished: true }),
    Course.countDocuments({ status: { $ne: 'archived' } }),
    Group.countDocuments({ active: true }),
    User.countDocuments({ role: 'student', status: 'active' }),
    Enrollment.countDocuments({ status: 'pending' }),
    Enrollment.countDocuments({ status: 'active' }),
  ]);

  return res.json({
    counts: {
      doctorProfiles,
      courses,
      groups,
      activeStudents,
      pendingEnrollments,
      activeEnrollments,
    },
  });
}

export async function listDoctorProfiles(req, res) {
  const profiles = await DoctorProfile.find()
    .populate('user', 'fullName email phone role status lastLoginAt')
    .sort({ sortOrder: 1, displayName: 1 })
    .lean();

  return res.json({
    doctorProfiles: profiles.map(decorateDoctorProfile),
  });
}

export async function createDoctorProfile(req, res) {
  const data = req.validatedBody;
  const slug = await uniqueSlug(DoctorProfile, data.displayName);

  const profile = await DoctorProfile.create({
    ...data,
    slug,
  });

  await writeAuditLog({
    actor: req.user._id,
    action: 'doctor.profile.created',
    targetType: 'DoctorProfile',
    targetId: profile._id,
    ip: req.ip,
  });

  return res.status(201).json({
    doctorProfile: decorateDoctorProfile(profile),
  });
}

export async function updateDoctorProfile(req, res) {
  const profile = await DoctorProfile.findById(req.params.id);

  if (!profile) {
    throw new HttpError(404, 'Doctor profile not found.');
  }

  const data = req.validatedBody;

  if (data.displayName && data.displayName !== profile.displayName) {
    profile.slug = await uniqueSlug(
      DoctorProfile,
      data.displayName,
      profile._id,
    );
  }

  Object.assign(profile, data);
  await profile.save();

  await writeAuditLog({
    actor: req.user._id,
    action: 'doctor.profile.updated',
    targetType: 'DoctorProfile',
    targetId: profile._id,
    ip: req.ip,
  });

  return res.json({
    doctorProfile: decorateDoctorProfile(profile),
  });
}

export async function listCourses(req, res) {
  const courses = await Course.find()
    .populate('doctorProfile', 'displayName subject imageUrl imageMedia slug user')
    .sort({ createdAt: -1 })
    .lean();

  const courseIds = courses.map((course) => course._id);

  const groups = await Group.find({
    course: { $in: courseIds },
  })
    .sort({ name: 1 })
    .lean();

  const groupsByCourse = groups.reduce((accumulator, group) => {
    const key = String(group.course);
    accumulator[key] ||= [];
    accumulator[key].push(group);
    return accumulator;
  }, {});

  return res.json({
    courses: courses.map((course) =>
      decorateCourse({
        ...course,
        groups:
          groupsByCourse[String(course._id)] || [],
      }),
    ),
  });
}

export async function createCourse(req, res) {
  const data = req.validatedBody;

  const doctorProfile = await DoctorProfile.findById(data.doctorProfileId);

  if (!doctorProfile || !doctorProfile.isPublished) {
    throw new HttpError(400, 'Choose an available doctor profile.');
  }

  const accessEndDate = data.accessEndDate || upcomingJune30();
  const slug = await uniqueSlug(
    Course,
    `${data.title}-${data.academicYear || academicYearLabel(accessEndDate)}`,
  );

  const course = await Course.create({
    doctorProfile: doctorProfile._id,
    title: data.title,
    slug,
    subject: data.subject,
    level: data.level,
    curriculum: data.curriculum,
    academicYear:
      data.academicYear || academicYearLabel(accessEndDate),
    description: data.description,
    price: data.price,
    currency: 'EGP',
    priceConfirmed: data.priceConfirmed,
    accessEndDate,
    status: data.status,
    featured: data.featured,
  });

  await writeAuditLog({
    actor: req.user._id,
    action: 'course.created',
    targetType: 'Course',
    targetId: course._id,
    ip: req.ip,
  });

  const populated = await course.populate(
    'doctorProfile',
    'displayName subject imageUrl imageMedia slug user',
  );

  return res.status(201).json({
    course: decorateCourse(populated.toObject()),
  });
}

export async function updateCourse(req, res) {
  const course = await Course.findById(req.params.id);

  if (!course) {
    throw new HttpError(404, 'Course not found.');
  }

  const data = req.validatedBody;

  if (data.doctorProfileId) {
    const profile = await DoctorProfile.findById(data.doctorProfileId);

    if (!profile) {
      throw new HttpError(400, 'Doctor profile not found.');
    }

    course.doctorProfile = profile._id;
  }

  const editable = [
    'title',
    'subject',
    'level',
    'curriculum',
    'academicYear',
    'description',
    'price',
    'priceConfirmed',
    'accessEndDate',
    'status',
    'featured',
  ];

  for (const field of editable) {
    if (data[field] !== undefined) {
      course[field] = data[field];
    }
  }

  await course.save();

  await writeAuditLog({
    actor: req.user._id,
    action: 'course.updated',
    targetType: 'Course',
    targetId: course._id,
    ip: req.ip,
  });

  const populated = await course.populate(
    'doctorProfile',
    'displayName subject imageUrl imageMedia slug user',
  );

  return res.json({
    course: decorateCourse(populated.toObject()),
  });
}

export async function createGroup(req, res) {
  const { courseId, name, scheduleLabel, meetingUrl } = req.validatedBody;

  const course = await Course.findById(courseId).lean();

  if (!course) {
    throw new HttpError(404, 'Course not found.');
  }

  const existing = await Group.findOne({ course: courseId, name }).lean();

  if (existing) {
    throw new HttpError(409, 'A group with that name already exists for this course.');
  }

  const group = await Group.create({
    course: courseId,
    name,
    scheduleLabel,
    meetingUrl,
  });

  await writeAuditLog({
    actor: req.user._id,
    action: 'group.created',
    targetType: 'Group',
    targetId: group._id,
    ip: req.ip,
  });

  return res.status(201).json({ group });
}

export async function updateGroup(req, res) {
  const group = await Group.findById(req.params.id);

  if (!group) {
    throw new HttpError(404, 'Group not found.');
  }

  Object.assign(group, req.validatedBody);
  await group.save();

  await writeAuditLog({
    actor: req.user._id,
    action: 'group.updated',
    targetType: 'Group',
    targetId: group._id,
    ip: req.ip,
  });

  return res.json({ group });
}

export async function listStudents(req, res) {
  const users = await User.find({
    role: 'student',
    status: 'active',
  })
    .select('fullName email phone createdAt')
    .sort({ fullName: 1 })
    .lean();

  const ids = users.map((user) => user._id);
  const profiles = await StudentProfile.find({
    user: { $in: ids },
  }).lean();

  const profileMap = new Map(
    profiles.map((profile) => [String(profile.user), profile]),
  );

  return res.json({
    students: users.map((user) => ({
      ...user,
      profile: profileMap.get(String(user._id)) || null,
    })),
  });
}

export async function listEnrollments(req, res) {
  const query = {};

  if (req.query.status) query.status = req.query.status;
  if (req.query.paymentStatus) query.paymentStatus = req.query.paymentStatus;
  if (req.query.courseId && mongoose.isValidObjectId(req.query.courseId)) {
    query.course = req.query.courseId;
  }
  if (req.query.studentId && mongoose.isValidObjectId(req.query.studentId)) {
    query.student = req.query.studentId;
  }

  const enrollments = await Enrollment.find(query)
    .populate('student', 'fullName email phone status')
    .populate({
      path: 'course',
      select: 'title level academicYear price accessEndDate doctorProfile',
      populate: {
        path: 'doctorProfile',
        select: 'displayName',
      },
    })
    .populate('group', 'name scheduleLabel active')
    .sort({ createdAt: -1 })
    .lean();

  return res.json({ enrollments });
}

export async function createEnrollment(req, res) {
  const enrollment = await createOrResetPendingEnrollment({
    ...req.validatedBody,
    actorId: req.user._id,
  });

  await writeAuditLog({
    actor: req.user._id,
    action: 'enrollment.created',
    targetType: 'Enrollment',
    targetId: enrollment._id,
    ip: req.ip,
  });

  return res.status(201).json({ enrollment });
}

export async function confirmEnrollmentPayment(req, res) {
  const enrollment = await Enrollment.findById(req.params.id);

  if (!enrollment) {
    throw new HttpError(404, 'Enrollment not found.');
  }

  if (enrollment.status === 'active' && enrollment.paymentStatus === 'paid') {
    throw new HttpError(409, 'This enrollment is already active and paid.');
  }

  const updated = await activateEnrollment({
    enrollment,
    actorId: req.user._id,
    ...req.validatedBody,
  });

  await writeAuditLog({
    actor: req.user._id,
    action: 'enrollment.payment.confirmed',
    targetType: 'Enrollment',
    targetId: updated._id,
    ip: req.ip,
  });

  return res.json({ enrollment: updated });
}

export async function unregisterEnrollment(req, res) {
  const enrollment = await Enrollment.findById(req.params.id);

  if (!enrollment) {
    throw new HttpError(404, 'Enrollment not found.');
  }

  const updated = await unregisterEnrollmentService({
    enrollment,
    actorId: req.user._id,
    note: req.validatedBody.note,
  });

  await writeAuditLog({
    actor: req.user._id,
    action: 'enrollment.unregistered',
    targetType: 'Enrollment',
    targetId: updated._id,
    metadata: {
      note: req.validatedBody.note,
    },
    ip: req.ip,
  });

  return res.json({ enrollment: updated });
}
