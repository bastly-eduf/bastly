import Course from '../models/Course.js';
import Enrollment from '../models/Enrollment.js';
import Group from '../models/Group.js';
import Lesson from '../models/Lesson.js';
import Module from '../models/Module.js';
import { writeAuditLog } from '../services/audit.service.js';
import {
  getDoctorProfileForUser,
  getOwnedCourse,
  getOwnedLesson,
  getOwnedModule,
} from '../services/doctorAccess.service.js';
import { currentAccessFilter } from '../utils/accessWindow.js';
import { HttpError } from '../utils/httpError.js';
import {
  extractYouTubeVideoId,
  youtubeEmbedUrl,
} from '../utils/youtube.js';

function withEmbed(lesson) {
  const plain =
    typeof lesson?.toObject === 'function' ? lesson.toObject() : lesson;

  return {
    ...plain,
    embedUrl: youtubeEmbedUrl(plain.youtubeVideoId),
  };
}

export async function doctorOverview(req, res) {
  const profile = await getDoctorProfileForUser(req.user._id);

  const courses = await Course.find({
    doctorProfile: profile._id,
    status: { $ne: 'archived' },
  })
    .sort({ createdAt: -1 })
    .lean();

  const courseIds = courses.map((course) => course._id);
  const currentAccess = currentAccessFilter();

  const [
    activeGroups,
    activeEnrollments,
    activeStudentIds,
    moduleCount,
    publishedLessonCount,
  ] = await Promise.all([
    Group.countDocuments({
      course: { $in: courseIds },
      active: true,
    }),
    Enrollment.countDocuments({
      course: { $in: courseIds },
      status: 'active',
      paymentStatus: 'paid',
      ...currentAccess,
    }),
    Enrollment.distinct('student', {
      course: { $in: courseIds },
      status: 'active',
      paymentStatus: 'paid',
      ...currentAccess,
    }),
    Module.countDocuments({
      course: { $in: courseIds },
      status: { $ne: 'archived' },
    }),
    Lesson.countDocuments({
      course: { $in: courseIds },
      status: 'published',
    }),
  ]);

  return res.json({
    profile,
    counts: {
      courses: courses.length,
      activeGroups,
      activeEnrollments,
      activeStudents: activeStudentIds.length,
      modules: moduleCount,
      publishedLessons: publishedLessonCount,
    },
    recentCourses: courses.slice(0, 4),
  });
}

export async function listDoctorCourses(req, res) {
  const profile = await getDoctorProfileForUser(req.user._id);

  const courses = await Course.find({
    doctorProfile: profile._id,
    status: { $ne: 'archived' },
  })
    .sort({ createdAt: -1 })
    .lean();

  const courseIds = courses.map((course) => course._id);

  const [groups, modules, lessons, enrollments] = await Promise.all([
    Group.find({ course: { $in: courseIds }, active: true }).lean(),
    Module.find({
      course: { $in: courseIds },
      status: { $ne: 'archived' },
    }).lean(),
    Lesson.find({
      course: { $in: courseIds },
      status: { $ne: 'archived' },
    }).lean(),
    Enrollment.find({
      course: { $in: courseIds },
      status: 'active',
      paymentStatus: 'paid',
      ...currentAccessFilter(),
    })
      .select('course student')
      .lean(),
  ]);

  const countByCourse = (items) =>
    items.reduce((accumulator, item) => {
      const key = String(item.course);
      accumulator[key] = (accumulator[key] || 0) + 1;
      return accumulator;
    }, {});

  const groupCounts = countByCourse(groups);
  const moduleCounts = countByCourse(modules);
  const lessonCounts = countByCourse(lessons);
  const enrollmentCounts = countByCourse(enrollments);

  return res.json({
    profile,
    courses: courses.map((course) => ({
      ...course,
      counts: {
        groups: groupCounts[String(course._id)] || 0,
        modules: moduleCounts[String(course._id)] || 0,
        lessons: lessonCounts[String(course._id)] || 0,
        students: enrollmentCounts[String(course._id)] || 0,
      },
    })),
  });
}

export async function getDoctorCourseWorkspace(req, res) {
  const { profile, course } = await getOwnedCourse(
    req.user._id,
    req.params.courseId,
  );

  const [groups, modules, lessons, activeStudentCount] = await Promise.all([
    Group.find({
      course: course._id,
      active: true,
    })
      .sort({ name: 1 })
      .lean(),
    Module.find({
      course: course._id,
      status: { $ne: 'archived' },
    })
      .sort({ sortOrder: 1, createdAt: 1 })
      .lean(),
    Lesson.find({
      course: course._id,
      status: { $ne: 'archived' },
    })
      .sort({ sortOrder: 1, createdAt: 1 })
      .lean(),
    Enrollment.countDocuments({
      course: course._id,
      status: 'active',
      paymentStatus: 'paid',
      ...currentAccessFilter(),
    }),
  ]);

  const lessonsByModule = lessons.reduce((accumulator, lesson) => {
    const key = String(lesson.module);
    accumulator[key] ||= [];
    accumulator[key].push(withEmbed(lesson));
    return accumulator;
  }, {});

  return res.json({
    profile,
    course,
    groups,
    activeStudentCount,
    modules: modules.map((module) => ({
      ...module,
      lessons: lessonsByModule[String(module._id)] || [],
    })),
  });
}

export async function createModule(req, res) {
  const { course } = await getOwnedCourse(req.user._id, req.params.courseId);

  const maxSort = await Module.findOne({ course: course._id })
    .sort({ sortOrder: -1 })
    .select('sortOrder')
    .lean();

  const module = await Module.create({
    course: course._id,
    title: req.validatedBody.title,
    description: req.validatedBody.description,
    sortOrder: (maxSort?.sortOrder ?? -1) + 1,
    status: req.validatedBody.status,
    publishedAt:
      req.validatedBody.status === 'published' ? new Date() : null,
  });

  await writeAuditLog({
    actor: req.user._id,
    action: 'module.created',
    targetType: 'Module',
    targetId: module._id,
    metadata: { courseId: String(course._id) },
    ip: req.ip,
  });

  return res.status(201).json({ module });
}

export async function updateModule(req, res) {
  const { module } = await getOwnedModule(req.user._id, req.params.moduleId);
  const data = req.validatedBody;

  if (
    data.status === 'published' &&
    module.status !== 'published'
  ) {
    module.publishedAt = new Date();
  }

  if (data.status === 'draft') {
    module.publishedAt = null;
  }

  Object.assign(module, data);
  await module.save();

  if (module.status === 'archived') {
    await Lesson.updateMany(
      { module: module._id, status: { $ne: 'archived' } },
      { status: 'archived' },
    );
  }

  await writeAuditLog({
    actor: req.user._id,
    action: 'module.updated',
    targetType: 'Module',
    targetId: module._id,
    metadata: { status: module.status },
    ip: req.ip,
  });

  return res.json({ module });
}

export async function createLesson(req, res) {
  const { course, module } = await getOwnedModule(
    req.user._id,
    req.params.moduleId,
  );

  if (module.status === 'archived') {
    throw new HttpError(400, 'You cannot add lessons to an archived module.');
  }

  const videoId = extractYouTubeVideoId(req.validatedBody.youtube);

  if (!videoId) {
    throw new HttpError(
      400,
      'Enter a valid YouTube video URL or YouTube video ID.',
      { youtube: 'Invalid YouTube video.' },
    );
  }

  const maxSort = await Lesson.findOne({ module: module._id })
    .sort({ sortOrder: -1 })
    .select('sortOrder')
    .lean();

  const lesson = await Lesson.create({
    course: course._id,
    module: module._id,
    title: req.validatedBody.title,
    description: req.validatedBody.description,
    videoProvider: 'youtube',
    youtubeVideoId: videoId,
    durationMinutes: req.validatedBody.durationMinutes ?? null,
    resources: req.validatedBody.resources,
    sortOrder: (maxSort?.sortOrder ?? -1) + 1,
    status: req.validatedBody.status,
    publishedAt:
      req.validatedBody.status === 'published' ? new Date() : null,
  });

  await writeAuditLog({
    actor: req.user._id,
    action: 'lesson.created',
    targetType: 'Lesson',
    targetId: lesson._id,
    metadata: {
      courseId: String(course._id),
      moduleId: String(module._id),
    },
    ip: req.ip,
  });

  return res.status(201).json({ lesson: withEmbed(lesson) });
}

export async function updateLesson(req, res) {
  const { lesson } = await getOwnedLesson(req.user._id, req.params.lessonId);
  const data = { ...req.validatedBody };

  if (data.youtube !== undefined) {
    const videoId = extractYouTubeVideoId(data.youtube);

    if (!videoId) {
      throw new HttpError(
        400,
        'Enter a valid YouTube video URL or YouTube video ID.',
        { youtube: 'Invalid YouTube video.' },
      );
    }

    lesson.youtubeVideoId = videoId;
    delete data.youtube;
  }

  if (
    data.status === 'published' &&
    lesson.status !== 'published'
  ) {
    lesson.publishedAt = new Date();
  }

  if (data.status === 'draft') {
    lesson.publishedAt = null;
  }

  Object.assign(lesson, data);
  await lesson.save();

  await writeAuditLog({
    actor: req.user._id,
    action: 'lesson.updated',
    targetType: 'Lesson',
    targetId: lesson._id,
    metadata: { status: lesson.status },
    ip: req.ip,
  });

  return res.json({ lesson: withEmbed(lesson) });
}

export async function listDoctorStudents(req, res) {
  const profile = await getDoctorProfileForUser(req.user._id);

  const courses = await Course.find({
    doctorProfile: profile._id,
    status: { $ne: 'archived' },
  })
    .select('title level academicYear')
    .lean();

  const courseIds = courses.map((course) => course._id);

  const query = {
    course: { $in: courseIds },
    status: 'active',
    paymentStatus: 'paid',
    ...currentAccessFilter(),
  };

  if (req.query.courseId) {
    const allowed = courseIds.some(
      (courseId) => String(courseId) === String(req.query.courseId),
    );

    if (!allowed) {
      throw new HttpError(403, 'You cannot access students from that course.');
    }

    query.course = req.query.courseId;
  }

  const enrollments = await Enrollment.find(query)
    .populate('student', 'fullName email phone status')
    .populate('course', 'title level academicYear')
    .populate('group', 'name scheduleLabel')
    .sort({ createdAt: -1 })
    .lean();

  return res.json({
    profile,
    courses,
    enrollments,
  });
}
