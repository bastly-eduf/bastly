import Assessment from '../models/Assessment.js';
import AssessmentAttempt from '../models/AssessmentAttempt.js';
import AttendanceRecord from '../models/AttendanceRecord.js';
import AttendanceSession from '../models/AttendanceSession.js';
import Enrollment from '../models/Enrollment.js';
import Lesson from '../models/Lesson.js';
import LessonProgress from '../models/LessonProgress.js';
import Module from '../models/Module.js';
import ParentRelationship from '../models/ParentRelationship.js';
import StudentProfile from '../models/StudentProfile.js';
import User from '../models/User.js';
import {
  basePerformanceWeights,
  computeCourseWeekPerformance,
} from '../services/performance.service.js';
import { currentAccessFilter } from '../utils/accessWindow.js';
import { HttpError } from '../utils/httpError.js';
import {
  endOfWeekUtc,
  parseWeekStart,
} from '../utils/week.js';

function rounded(value) {
  if (value === null || value === undefined) return null;
  return Math.round(Number(value || 0) * 100) / 100;
}

function average(values) {
  if (!values.length) return null;
  return rounded(
    values.reduce((sum, value) => sum + Number(value || 0), 0) /
      values.length,
  );
}

async function assertLinkedParent(parentId, studentId) {
  const relationship = await ParentRelationship.findOne({
    parent: parentId,
    student: studentId,
    status: 'active',
  }).lean();

  if (!relationship) {
    throw new HttpError(
      403,
      'You are not linked to this student.',
    );
  }

  const student = await User.findById(studentId)
    .select('fullName email phone status')
    .lean();

  if (!student || student.status !== 'active') {
    throw new HttpError(404, 'Student not found.');
  }

  const studentProfile = await StudentProfile.findOne({
    user: studentId,
  }).lean();

  return {
    relationship,
    student,
    studentProfile,
  };
}

async function activeCourseEnrollments(studentId) {
  const enrollments = await Enrollment.find({
    student: studentId,
    status: 'active',
    paymentStatus: 'paid',
    ...currentAccessFilter(),
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
    .sort({ createdAt: 1 })
    .lean();

  return enrollments.filter((item) => item.course);
}

export async function parentChildSummary(req, res) {
  const weekStart = parseWeekStart(req.query.weekStart);

  const { student, studentProfile } = await assertLinkedParent(
    req.user._id,
    req.params.studentId,
  );

  const enrollments = await activeCourseEnrollments(student._id);
  const courseIds = enrollments.map((item) => item.course._id);

  const publishedModules = courseIds.length
    ? await Module.find({
        course: { $in: courseIds },
        status: 'published',
      })
        .select('_id course')
        .lean()
    : [];

  const moduleIds = publishedModules.map((item) => item._id);

  const publishedLessons = moduleIds.length
    ? await Lesson.find({
        course: { $in: courseIds },
        module: { $in: moduleIds },
        status: 'published',
      })
        .select('_id course')
        .lean()
    : [];

  const lessonProgress = publishedLessons.length
    ? await LessonProgress.find({
        student: student._id,
        lesson: {
          $in: publishedLessons.map((lesson) => lesson._id),
        },
        completed: true,
      })
        .select('course lesson')
        .lean()
    : [];

  const finalizedSessionIds = courseIds.length
    ? await AttendanceSession.distinct('_id', {
        course: { $in: courseIds },
        status: 'finalized',
      })
    : [];

  const attendance = finalizedSessionIds.length
    ? await AttendanceRecord.find({
        session: { $in: finalizedSessionIds },
        student: student._id,
        course: { $in: courseIds },
        status: { $in: ['present', 'absent'] },
      })
        .select('course status')
        .lean()
    : [];

  const assessments = courseIds.length
    ? await Assessment.find({
        course: { $in: courseIds },
        status: { $in: ['published', 'archived'] },
      })
        .select('_id course type')
        .lean()
    : [];

  const assessmentIds = assessments.map((item) => item._id);

  const attempts = assessmentIds.length
    ? await AssessmentAttempt.find({
        student: student._id,
        assessment: { $in: assessmentIds },
      })
        .select(
          'assessment attemptNumber percentage gradeBand submittedAt',
        )
        .sort({ submittedAt: 1 })
        .lean()
    : [];

  const assessmentsMap = new Map(
    assessments.map((item) => [String(item._id), item]),
  );

  const lessonsByCourse = new Map();
  for (const lesson of publishedLessons) {
    const key = String(lesson.course);
    if (!lessonsByCourse.has(key)) lessonsByCourse.set(key, []);
    lessonsByCourse.get(key).push(lesson);
  }

  const completedByCourse = new Map();
  for (const progress of lessonProgress) {
    const key = String(progress.course);
    completedByCourse.set(
      key,
      (completedByCourse.get(key) || 0) + 1,
    );
  }

  const attendanceByCourse = new Map();
  for (const record of attendance) {
    const key = String(record.course);
    if (!attendanceByCourse.has(key)) attendanceByCourse.set(key, []);
    attendanceByCourse.get(key).push(record);
  }

  const firstAttemptsByCourseType = new Map();
  const bestHomeworkByAssessment = new Map();

  for (const attempt of attempts) {
    const assessment = assessmentsMap.get(
      String(attempt.assessment),
    );
    if (!assessment) continue;

    const courseKey = String(assessment.course);
    const bucketKey = `${courseKey}:${assessment.type}`;

    if (attempt.attemptNumber === 1) {
      if (!firstAttemptsByCourseType.has(bucketKey)) {
        firstAttemptsByCourseType.set(bucketKey, []);
      }
      firstAttemptsByCourseType
        .get(bucketKey)
        .push(Number(attempt.percentage || 0));
    }

    if (assessment.type === 'homework') {
      const assessmentKey = String(assessment._id);
      const score = Number(attempt.percentage || 0);
      const currentBest =
        bestHomeworkByAssessment.get(assessmentKey);

      if (
        currentBest === undefined ||
        score > currentBest
      ) {
        bestHomeworkByAssessment.set(
          assessmentKey,
          score,
        );
      }
    }
  }

  const bestHomeworkByCourse = new Map();

  for (const assessment of assessments) {
    if (assessment.type !== 'homework') continue;

    const bestScore = bestHomeworkByAssessment.get(
      String(assessment._id),
    );

    if (bestScore === undefined) continue;

    const courseKey = String(assessment.course);

    if (!bestHomeworkByCourse.has(courseKey)) {
      bestHomeworkByCourse.set(courseKey, []);
    }

    bestHomeworkByCourse
      .get(courseKey)
      .push(bestScore);
  }

  const courses = [];

  for (const enrollment of enrollments) {
    const courseKey = String(enrollment.course._id);
    const courseLessons = lessonsByCourse.get(courseKey) || [];
    const completedLessons =
      completedByCourse.get(courseKey) || 0;
    const courseAttendance =
      attendanceByCourse.get(courseKey) || [];
    const presentCount = courseAttendance.filter(
      (item) => item.status === 'present',
    ).length;

    const [performance] = await computeCourseWeekPerformance({
      courseId: enrollment.course._id,
      studentIds: [student._id],
      weekStart,
    });

    courses.push({
      enrollmentId: enrollment._id,
      course: enrollment.course,
      group: enrollment.group,
      accessEndDate: enrollment.accessEndDate,
      learning: {
        totalLessons: courseLessons.length,
        completedLessons,
        percentage: courseLessons.length
          ? Math.round(
              (completedLessons / courseLessons.length) * 100,
            )
          : 0,
      },
      attendance: {
        sessions: courseAttendance.length,
        present: presentCount,
        absent: courseAttendance.length - presentCount,
        percentage: courseAttendance.length
          ? rounded(
              (presentCount / courseAttendance.length) * 100,
            )
          : null,
      },
      academics: {
        quizFirstAttemptAverage: average(
          firstAttemptsByCourseType.get(
            `${courseKey}:quiz`,
          ) || [],
        ),
        homeworkFirstAttemptAverage: average(
          firstAttemptsByCourseType.get(
            `${courseKey}:homework`,
          ) || [],
        ),
        homeworkBestAverage: average(
          bestHomeworkByCourse.get(courseKey) || [],
        ),
      },
      weeklyPerformance: performance || null,
    });
  }

  return res.json({
    student,
    studentProfile,
    weekStart,
    weekEnd: endOfWeekUtc(weekStart),
    baseWeights: basePerformanceWeights(),
    courses,
  });
}

export async function parentChildCourseDetail(req, res) {
  const weekStart = parseWeekStart(req.query.weekStart);
  const weekEnd = endOfWeekUtc(weekStart);

  const { student, studentProfile } = await assertLinkedParent(
    req.user._id,
    req.params.studentId,
  );

  const enrollment = await Enrollment.findOne({
    student: student._id,
    course: req.params.courseId,
    status: 'active',
    paymentStatus: 'paid',
    ...currentAccessFilter(),
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
    .lean();

  if (!enrollment || !enrollment.course) {
    throw new HttpError(
      404,
      'This active course was not found for your child.',
    );
  }

  const [performance] = await computeCourseWeekPerformance({
    courseId: enrollment.course._id,
    studentIds: [student._id],
    weekStart,
  });

  const assessments = await Assessment.find({
    course: enrollment.course._id,
    status: { $in: ['published', 'archived'] },
    publishedAt: { $ne: null },
    $or: [
      { performanceWeekStart: weekStart },
      {
        performanceWeekStart: null,
        publishedAt: { $gte: weekStart, $lt: weekEnd },
      },
    ],
  })
    .select('_id type title publishedAt performanceWeekStart')
    .sort({ type: 1, publishedAt: 1 })
    .lean();

  const attempts = assessments.length
    ? await AssessmentAttempt.find({
        student: student._id,
        assessment: {
          $in: assessments.map((item) => item._id),
        },
      })
        .select(
          'assessment attemptNumber percentage gradeBand submittedAt scorePoints maxPoints',
        )
        .sort({ submittedAt: 1 })
        .lean()
    : [];

  const attemptsByAssessment = new Map();

  for (const attempt of attempts) {
    const key = String(attempt.assessment);
    if (!attemptsByAssessment.has(key)) {
      attemptsByAssessment.set(key, []);
    }
    attemptsByAssessment.get(key).push(attempt);
  }

  const assessmentRows = assessments.map((assessment) => {
    const itemAttempts =
      attemptsByAssessment.get(String(assessment._id)) || [];

    const first =
      itemAttempts.find(
        (attempt) => attempt.attemptNumber === 1,
      ) || null;

    const latest =
      itemAttempts[itemAttempts.length - 1] || null;

    const best = itemAttempts.length
      ? itemAttempts.reduce((currentBest, attempt) =>
          Number(attempt.percentage || 0) >
          Number(currentBest.percentage || 0)
            ? attempt
            : currentBest,
        )
      : null;

    return {
      assessment,
      attemptCount: itemAttempts.length,
      firstAttempt: first,
      latestAttempt: latest,
      bestAttempt: best,
    };
  });

  const sessions = await AttendanceSession.find({
    course: enrollment.course._id,
    group: enrollment.group?._id,
    heldAt: { $gte: weekStart, $lt: weekEnd },
    status: 'finalized',
  })
    .select('_id title heldAt finalizedAt')
    .sort({ heldAt: 1 })
    .lean();

  const attendanceRecords = sessions.length
    ? await AttendanceRecord.find({
        session: { $in: sessions.map((item) => item._id) },
        student: student._id,
      })
        .select('session status markedAt')
        .lean()
    : [];

  const attendanceMap = new Map(
    attendanceRecords.map((item) => [
      String(item.session),
      item,
    ]),
  );

  const attendanceRows = sessions.map((session) => ({
    session,
    record:
      attendanceMap.get(String(session._id)) || null,
  }));

  const modules = await Module.find({
    course: enrollment.course._id,
    status: 'published',
  })
    .select('_id')
    .lean();

  const lessons = modules.length
    ? await Lesson.find({
        course: enrollment.course._id,
        module: { $in: modules.map((item) => item._id) },
        status: 'published',
      })
        .select('_id')
        .lean()
    : [];

  const completedLessons = lessons.length
    ? await LessonProgress.countDocuments({
        student: student._id,
        course: enrollment.course._id,
        lesson: { $in: lessons.map((item) => item._id) },
        completed: true,
      })
    : 0;

  return res.json({
    student,
    studentProfile,
    enrollment,
    weekStart,
    weekEnd,
    baseWeights: basePerformanceWeights(),
    performance: performance || null,
    assessments: assessmentRows,
    attendance: attendanceRows,
    learning: {
      totalLessons: lessons.length,
      completedLessons,
      percentage: lessons.length
        ? Math.round(
            (completedLessons / lessons.length) * 100,
          )
        : 0,
    },
  });
}
