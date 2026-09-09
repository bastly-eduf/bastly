import Assessment from '../models/Assessment.js';
import AssessmentAttempt from '../models/AssessmentAttempt.js';
import AttendanceRecord from '../models/AttendanceRecord.js';
import AttendanceSession from '../models/AttendanceSession.js';
import WeeklyPerformance from '../models/WeeklyPerformance.js';
import { gradeBandFromPercentage } from '../utils/gradeBand.js';
import { endOfWeekUtc, startOfWeekUtc } from '../utils/week.js';

const BASE_WEIGHTS = Object.freeze({
  quiz: 50,
  attendance: 30,
  homework: 20,
});

function rounded(value) {
  return Math.round(Number(value || 0) * 100) / 100;
}

function normalizedWeights(availability) {
  const active = Object.entries(BASE_WEIGHTS).filter(
    ([key]) => availability[key],
  );

  const total = active.reduce((sum, [, weight]) => sum + weight, 0);
  const weights = { quiz: 0, attendance: 0, homework: 0 };

  if (!total) return weights;

  for (const [key, weight] of active) {
    weights[key] = rounded((weight / total) * 100);
  }

  return weights;
}

function averageOrZero(values) {
  if (!values.length) return 0;
  return rounded(values.reduce((sum, value) => sum + Number(value || 0), 0) / values.length);
}

export async function computeCourseWeekPerformance({
  courseId,
  studentIds,
  weekStart: requestedWeekStart,
  persist = true,
}) {
  const weekStart = startOfWeekUtc(requestedWeekStart || new Date());
  const weekEnd = endOfWeekUtc(weekStart);
  const uniqueStudentIds = [...new Set(studentIds.map(String))];

  if (!uniqueStudentIds.length) return [];

  const assessments = await Assessment.find({
    course: courseId,
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
    .select('_id type title')
    .lean();

  const assessmentIds = assessments.map((item) => item._id);

  const firstAttempts = assessmentIds.length
    ? await AssessmentAttempt.find({
        student: { $in: uniqueStudentIds },
        assessment: { $in: assessmentIds },
        attemptNumber: 1,
      })
        .select('assessment student percentage gradeBand submittedAt')
        .lean()
    : [];

  const finalizedSessionIds = await AttendanceSession.distinct('_id', {
    course: courseId,
    heldAt: { $gte: weekStart, $lt: weekEnd },
    status: 'finalized',
  });

  const attendanceRecords = finalizedSessionIds.length
    ? await AttendanceRecord.find({
        session: { $in: finalizedSessionIds },
        student: { $in: uniqueStudentIds },
        course: courseId,
        status: { $in: ['present', 'absent'] },
      })
        .select('student status heldAt session')
        .lean()
    : [];

  const attemptsByStudent = new Map();
  for (const attempt of firstAttempts) {
    const studentKey = String(attempt.student);
    if (!attemptsByStudent.has(studentKey)) attemptsByStudent.set(studentKey, new Map());
    attemptsByStudent.get(studentKey).set(String(attempt.assessment), attempt);
  }

  const attendanceByStudent = new Map();
  for (const record of attendanceRecords) {
    const key = String(record.student);
    if (!attendanceByStudent.has(key)) attendanceByStudent.set(key, []);
    attendanceByStudent.get(key).push(record);
  }

  const quizzes = assessments.filter((item) => item.type === 'quiz');
  const homework = assessments.filter((item) => item.type === 'homework');

  const results = uniqueStudentIds.map((studentId) => {
    const attemptMap = attemptsByStudent.get(studentId) || new Map();
    const attendance = attendanceByStudent.get(studentId) || [];

    const quizScores = quizzes.map((assessment) => {
      const attempt = attemptMap.get(String(assessment._id));
      return attempt ? Number(attempt.percentage || 0) : 0;
    });

    const homeworkScores = homework.map((assessment) => {
      const attempt = attemptMap.get(String(assessment._id));
      return attempt ? Number(attempt.percentage || 0) : 0;
    });

    const presentCount = attendance.filter((record) => record.status === 'present').length;

    const availability = {
      quiz: quizzes.length > 0,
      attendance: attendance.length > 0,
      homework: homework.length > 0,
    };

    const weights = normalizedWeights(availability);
    const quizScore = availability.quiz ? averageOrZero(quizScores) : null;
    const attendanceScore = availability.attendance
      ? rounded((presentCount / attendance.length) * 100)
      : null;
    const homeworkScore = availability.homework
      ? averageOrZero(homeworkScores)
      : null;

    const overallParts = [
      ['quiz', quizScore],
      ['attendance', attendanceScore],
      ['homework', homeworkScore],
    ];

    const overallPercentage = Object.values(availability).some(Boolean)
      ? rounded(
          overallParts.reduce((sum, [key, score]) => {
            if (score === null) return sum;
            return sum + score * (weights[key] / 100);
          }, 0),
        )
      : null;

    const allQuizzesStar =
      quizzes.length > 0 &&
      quizzes.every((assessment) => {
        const attempt = attemptMap.get(String(assessment._id));
        return attempt && Number(attempt.percentage || 0) >= 90;
      });

    let spinReason = '';
    if (quizzes.length === 0) {
      spinReason = 'No required quiz was assigned this week.';
    } else if (!allQuizzesStar) {
      spinReason = 'Every required quiz must be completed with a Star score (90%+).';
    } else {
      spinReason = 'All required quizzes earned Star this week.';
    }

    return {
      student: studentId,
      course: String(courseId),
      weekStart,
      weekEnd,
      quiz: {
        available: availability.quiz,
        assigned: quizzes.length,
        completed: quizzes.filter((assessment) => attemptMap.has(String(assessment._id))).length,
        score: quizScore,
        weightUsed: weights.quiz,
      },
      attendance: {
        available: availability.attendance,
        assigned: attendance.length,
        completed: attendance.length,
        score: attendanceScore,
        weightUsed: weights.attendance,
      },
      homework: {
        available: availability.homework,
        assigned: homework.length,
        completed: homework.filter((assessment) => attemptMap.has(String(assessment._id))).length,
        score: homeworkScore,
        weightUsed: weights.homework,
      },
      overallPercentage,
      gradeBand:
        overallPercentage === null
          ? null
          : gradeBandFromPercentage(overallPercentage),
      spinEligible: allQuizzesStar,
      spinReason,
      computedAt: new Date(),
    };
  });

  if (persist && results.length) {
    await WeeklyPerformance.bulkWrite(
      results.map((result) => ({
        updateOne: {
          filter: {
            student: result.student,
            course: result.course,
            weekStart: result.weekStart,
          },
          update: { $set: result },
          upsert: true,
        },
      })),
    );
  }

  return results;
}

export function basePerformanceWeights() {
  return { ...BASE_WEIGHTS };
}
