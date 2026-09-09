import Assessment from '../models/Assessment.js';
import AssessmentAttempt from '../models/AssessmentAttempt.js';
import Course from '../models/Course.js';
import Enrollment from '../models/Enrollment.js';
import {
  buildReview,
  gradeAssessment,
  nextAttemptNumber,
  studentAssessmentPayload,
} from '../services/assessment.service.js';
import { getStudentAssessmentAccess } from '../services/studentAccess.service.js';
import { writeAuditLog } from '../services/audit.service.js';
import { HttpError } from '../utils/httpError.js';

export async function studentOverview(req, res) {
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
      select: 'title level academicYear doctorProfile',
      populate: { path: 'doctorProfile', select: 'displayName' },
    })
    .populate('group', 'name scheduleLabel')
    .lean();

  const activeCourses = enrollments.filter((e) => e.course);
  const courseIds = activeCourses.map((e) => e.course._id);

  const [assessmentCount, quizAssessments] = await Promise.all([
    Assessment.countDocuments({ course: { $in: courseIds }, status: 'published' }),
    Assessment.find({
      course: { $in: courseIds },
      type: 'quiz',
      status: 'published',
    }).select('_id').lean(),
  ]);

  const validQuizAttempts = await AssessmentAttempt.find({
    student: req.user._id,
    assessment: { $in: quizAssessments.map((assessment) => assessment._id) },
  })
    .select('percentage assessment')
    .lean();
  const quizAverage = validQuizAttempts.length
    ? Math.round((validQuizAttempts.reduce((sum, a) => sum + Number(a.percentage || 0), 0) / validQuizAttempts.length) * 100) / 100
    : null;

  return res.json({
    activeCourses,
    counts: {
      courses: activeCourses.length,
      availableAssessments: assessmentCount,
      completedQuizAttempts: validQuizAttempts.length,
    },
    quizAverage,
  });
}

export async function listStudentAssessments(req, res) {
  const now = new Date();
  const enrollments = await Enrollment.find({
    student: req.user._id,
    status: 'active',
    paymentStatus: 'paid',
    accessEndDate: { $gte: now },
  }).select('course').lean();

  const courseIds = enrollments.map((e) => e.course);
  const courses = await Course.find({ _id: { $in: courseIds }, status: 'published' })
    .populate('doctorProfile', 'displayName')
    .select('title level academicYear doctorProfile')
    .lean();
  const allowedIds = courses.map((c) => c._id);

  const assessments = await Assessment.find({
    course: { $in: allowedIds },
    status: 'published',
  })
    .select('course type title description questions createdAt')
    .sort({ createdAt: -1 })
    .lean();

  const attempts = await AssessmentAttempt.find({
    student: req.user._id,
    assessment: { $in: assessments.map((a) => a._id) },
  })
    .select('assessment attemptNumber percentage gradeBand submittedAt')
    .sort({ attemptNumber: -1 })
    .lean();

  const byAssessment = attempts.reduce((acc, attempt) => {
    const key = String(attempt.assessment);
    acc[key] ||= [];
    acc[key].push(attempt);
    return acc;
  }, {});
  const courseMap = new Map(courses.map((c) => [String(c._id), c]));

  return res.json({
    assessments: assessments.map((a) => {
      const previous = byAssessment[String(a._id)] || [];
      return {
        _id: a._id,
        type: a.type,
        title: a.title,
        description: a.description,
        questionCount: a.questions.length,
        course: courseMap.get(String(a.course)) || null,
        attemptCount: previous.length,
        maxAttempts: a.type === 'quiz' ? 1 : null,
        canAttempt: a.type === 'homework' || previous.length === 0,
        latestAttempt: previous[0] || null,
      };
    }),
  });
}

export async function getStudentAssessment(req, res) {
  const { assessment, course } = await getStudentAssessmentAccess(req.user._id, req.params.assessmentId);
  const attempts = await AssessmentAttempt.find({ assessment: assessment._id, student: req.user._id })
    .sort({ attemptNumber: -1 })
    .select('attemptNumber percentage gradeBand submittedAt answers scorePoints maxPoints')
    .lean();

  const lockedQuiz = assessment.type === 'quiz' && attempts.length > 0;

  return res.json({
    assessment: studentAssessmentPayload(assessment),
    course: { _id: course._id, title: course.title, level: course.level },
    maxAttempts: assessment.type === 'quiz' ? 1 : null,
    canAttempt: !lockedQuiz,
    attempts: attempts.map(({ answers, ...attempt }) => attempt),
    ...(lockedQuiz && { review: buildReview(assessment, attempts[0]) }),
  });
}

export async function submitStudentAssessment(req, res) {
  const { assessment, enrollment } = await getStudentAssessmentAccess(req.user._id, req.params.assessmentId);
  if (!assessment.questions.length) throw new HttpError(400, 'This assessment has no questions.');

  if (assessment.type === 'quiz') {
    const existing = await AssessmentAttempt.exists({ assessment: assessment._id, student: req.user._id });
    if (existing) throw new HttpError(409, 'This quiz allows one attempt and yours has already been submitted.');
  }

  const graded = gradeAssessment(assessment, req.validatedBody.answers);
  const attemptNumber = await nextAttemptNumber(assessment._id, req.user._id);

  let attempt;
  try {
    attempt = await AssessmentAttempt.create({
      assessment: assessment._id,
      student: req.user._id,
      enrollment: enrollment._id,
      attemptNumber,
      ...graded,
    });
  } catch (error) {
    if (error?.code === 11000) {
      throw new HttpError(409, 'This attempt was already submitted. Refresh to see the result.');
    }
    throw error;
  }

  await writeAuditLog({
    actor: req.user._id,
    action: 'assessment.submitted',
    targetType: 'AssessmentAttempt',
    targetId: attempt._id,
    metadata: {
      assessmentId: String(assessment._id),
      assessmentType: assessment.type,
      percentage: attempt.percentage,
      gradeBand: attempt.gradeBand,
      attemptNumber,
    },
    ip: req.ip,
  });

  return res.status(201).json({
    attempt: {
      _id: attempt._id,
      attemptNumber: attempt.attemptNumber,
      scorePoints: attempt.scorePoints,
      maxPoints: attempt.maxPoints,
      percentage: attempt.percentage,
      gradeBand: attempt.gradeBand,
      submittedAt: attempt.submittedAt,
    },
    review: buildReview(assessment, attempt),
    canAttemptAgain: assessment.type === 'homework',
  });
}
