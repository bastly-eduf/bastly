import Lesson from '../models/Lesson.js';
import LessonProgress from '../models/LessonProgress.js';
import Module from '../models/Module.js';
import Enrollment from '../models/Enrollment.js';
import Course from '../models/Course.js';
import {
  getStudentCourseAccess,
  getStudentLessonAccess,
} from '../services/studentLearningAccess.service.js';
import { writeAuditLog } from '../services/audit.service.js';
import { youtubeEmbedUrl } from '../utils/youtube.js';

function progressPercent(completed, total) {
  if (!total) return 0;
  return Math.round((completed / total) * 100);
}

export async function listStudentCourses(req, res) {
  const now = new Date();

  const enrollments = await Enrollment.find({
    student: req.user._id,
    status: 'active',
    paymentStatus: 'paid',
    accessEndDate: { $gte: now },
  })
    .populate({
      path: 'course',
      match: { status: 'published' },
      select:
        'title level curriculum academicYear accessEndDate doctorProfile',
      populate: {
        path: 'doctorProfile',
        select: 'displayName subject imageUrl slug',
      },
    })
    .populate('group', 'name scheduleLabel')
    .sort({ createdAt: -1 })
    .lean();

  const validEnrollments = enrollments.filter(
    (enrollment) => enrollment.course,
  );

  const courseIds = validEnrollments.map(
    (enrollment) => enrollment.course._id,
  );

  const modules = await Module.find({
    course: { $in: courseIds },
    status: 'published',
  })
    .select('_id course')
    .lean();

  const moduleIds = modules.map((module) => module._id);

  const lessons = await Lesson.find({
    course: { $in: courseIds },
    module: { $in: moduleIds },
    status: 'published',
  })
    .select('_id course module sortOrder createdAt')
    .sort({ sortOrder: 1, createdAt: 1 })
    .lean();

  const progress = await LessonProgress.find({
    student: req.user._id,
    lesson: { $in: lessons.map((lesson) => lesson._id) },
    completed: true,
  })
    .select('lesson course')
    .lean();

  const completedSet = new Set(
    progress.map((item) => String(item.lesson)),
  );

  const lessonsByCourse = lessons.reduce((accumulator, lesson) => {
    const key = String(lesson.course);
    accumulator[key] ||= [];
    accumulator[key].push(lesson);
    return accumulator;
  }, {});

  return res.json({
    courses: validEnrollments.map((enrollment) => {
      const courseLessons =
        lessonsByCourse[String(enrollment.course._id)] || [];

      const completedLessons = courseLessons.filter((lesson) =>
        completedSet.has(String(lesson._id)),
      ).length;

      const nextLesson =
        courseLessons.find(
          (lesson) => !completedSet.has(String(lesson._id)),
        ) || courseLessons[0] || null;

      return {
        enrollmentId: enrollment._id,
        course: enrollment.course,
        group: enrollment.group,
        accessEndDate: enrollment.accessEndDate,
        progress: {
          totalLessons: courseLessons.length,
          completedLessons,
          percentage: progressPercent(
            completedLessons,
            courseLessons.length,
          ),
        },
        nextLessonId: nextLesson?._id || null,
      };
    }),
  });
}

export async function getStudentCourseWorkspace(req, res) {
  const { enrollment, course } = await getStudentCourseAccess(
    req.user._id,
    req.params.courseId,
  );

  const modules = await Module.find({
    course: course._id,
    status: 'published',
  })
    .sort({ sortOrder: 1, createdAt: 1 })
    .lean();

  const moduleIds = modules.map((module) => module._id);

  const lessons = await Lesson.find({
    course: course._id,
    module: { $in: moduleIds },
    status: 'published',
  })
    .select(
      '_id course module title description durationMinutes resources sortOrder createdAt',
    )
    .sort({ sortOrder: 1, createdAt: 1 })
    .lean();

  const progress = await LessonProgress.find({
    student: req.user._id,
    course: course._id,
    lesson: { $in: lessons.map((lesson) => lesson._id) },
  })
    .select('lesson completed completedAt')
    .lean();

  const progressMap = new Map(
    progress.map((item) => [String(item.lesson), item]),
  );

  const lessonsByModule = lessons.reduce((accumulator, lesson) => {
    const key = String(lesson.module);
    accumulator[key] ||= [];

    const itemProgress =
      progressMap.get(String(lesson._id)) || null;

    accumulator[key].push({
      ...lesson,
      completed: Boolean(itemProgress?.completed),
      completedAt: itemProgress?.completedAt || null,
    });

    return accumulator;
  }, {});

  const decoratedModules = modules.map((module) => ({
    ...module,
    lessons: lessonsByModule[String(module._id)] || [],
  }));

  const flatLessons = decoratedModules.flatMap(
    (module) => module.lessons,
  );

  const completedLessons = flatLessons.filter(
    (lesson) => lesson.completed,
  ).length;

  const nextLesson =
    flatLessons.find((lesson) => !lesson.completed) ||
    flatLessons[0] ||
    null;

  return res.json({
    enrollment,
    course,
    progress: {
      totalLessons: flatLessons.length,
      completedLessons,
      percentage: progressPercent(
        completedLessons,
        flatLessons.length,
      ),
    },
    nextLessonId: nextLesson?._id || null,
    modules: decoratedModules,
  });
}

export async function getStudentLesson(req, res) {
  const { enrollment, course, module, lesson } =
    await getStudentLessonAccess(
      req.user._id,
      req.params.lessonId,
    );

  const progress = await LessonProgress.findOne({
    student: req.user._id,
    lesson: lesson._id,
  })
    .select('completed completedAt')
    .lean();

  return res.json({
    enrollment: {
      _id: enrollment._id,
      accessEndDate: enrollment.accessEndDate,
    },
    course: {
      _id: course._id,
      title: course.title,
      level: course.level,
      curriculum: course.curriculum,
    },
    module: {
      _id: module._id,
      title: module.title,
    },
    lesson: {
      _id: lesson._id,
      title: lesson.title,
      description: lesson.description,
      durationMinutes: lesson.durationMinutes,
      resources: lesson.resources || [],
      embedUrl: youtubeEmbedUrl(lesson.youtubeVideoId),
      completed: Boolean(progress?.completed),
      completedAt: progress?.completedAt || null,
    },
  });
}

export async function setLessonCompletion(req, res) {
  const { course, lesson } = await getStudentLessonAccess(
    req.user._id,
    req.params.lessonId,
  );

  const completed = req.validatedBody.completed;

  const progress = await LessonProgress.findOneAndUpdate(
    {
      student: req.user._id,
      lesson: lesson._id,
    },
    {
      $set: {
        course: course._id,
        completed,
        completedAt: completed ? new Date() : null,
      },
      $setOnInsert: {
        student: req.user._id,
        lesson: lesson._id,
      },
    },
    {
      new: true,
      upsert: true,
      setDefaultsOnInsert: true,
    },
  );

  await writeAuditLog({
    actor: req.user._id,
    action: completed
      ? 'lesson.completed'
      : 'lesson.completion.removed',
    targetType: 'Lesson',
    targetId: lesson._id,
    metadata: {
      courseId: String(course._id),
    },
    ip: req.ip,
  });

  return res.json({
    progress: {
      lessonId: lesson._id,
      completed: progress.completed,
      completedAt: progress.completedAt,
    },
  });
}
