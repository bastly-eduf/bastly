import Assessment from '../models/Assessment.js';
import AssessmentAttempt from '../models/AssessmentAttempt.js';
import { normalizeQuestions } from '../services/assessment.service.js';
import { getOwnedCourse } from '../services/doctorAccess.service.js';
import { writeAuditLog } from '../services/audit.service.js';
import { HttpError } from '../utils/httpError.js';

async function ownedAssessment(userId, assessmentId) {
  const assessment = await Assessment.findById(assessmentId);
  if (!assessment) throw new HttpError(404, 'Assessment not found.');
  const { course } = await getOwnedCourse(userId, assessment.course);
  return { assessment, course };
}

export async function listCourseAssessments(req, res) {
  const { course } = await getOwnedCourse(req.user._id, req.params.courseId);
  const assessments = await Assessment.find({
    course: course._id,
    status: { $ne: 'archived' },
  })
    .sort({ createdAt: -1 })
    .lean();

  const ids = assessments.map((a) => a._id);
  const stats = ids.length
    ? await AssessmentAttempt.aggregate([
        { $match: { assessment: { $in: ids } } },
        {
          $group: {
            _id: '$assessment',
            attempts: { $sum: 1 },
            students: { $addToSet: '$student' },
            averagePercentage: { $avg: '$percentage' },
          },
        },
      ])
    : [];

  const statsMap = new Map(
    stats.map((item) => [String(item._id), {
      attempts: item.attempts,
      students: item.students.length,
      averagePercentage: Math.round((item.averagePercentage || 0) * 100) / 100,
    }]),
  );

  return res.json({
    course,
    assessments: assessments.map((a) => ({
      ...a,
      questionCount: a.questions.length,
      maxAttempts: a.type === 'quiz' ? 1 : null,
      stats: statsMap.get(String(a._id)) || { attempts: 0, students: 0, averagePercentage: 0 },
    })),
  });
}

export async function createAssessment(req, res) {
  const { course } = await getOwnedCourse(req.user._id, req.params.courseId);
  const data = req.validatedBody;

  const assessment = await Assessment.create({
    course: course._id,
    type: data.type,
    title: data.title,
    description: data.description,
    instructions: data.instructions,
    questions: normalizeQuestions(data.questions),
    status: data.status,
    publishedAt: data.status === 'published' ? new Date() : null,
  });

  await writeAuditLog({
    actor: req.user._id,
    action: 'assessment.created',
    targetType: 'Assessment',
    targetId: assessment._id,
    metadata: { courseId: String(course._id), type: assessment.type },
    ip: req.ip,
  });

  return res.status(201).json({ assessment });
}

export async function updateAssessment(req, res) {
  const { assessment } = await ownedAssessment(req.user._id, req.params.assessmentId);
  const data = { ...req.validatedBody };

  if (data.questions) data.questions = normalizeQuestions(data.questions);
  if (data.status === 'published' && assessment.status !== 'published') assessment.publishedAt = new Date();
  if (data.status === 'draft') assessment.publishedAt = null;

  Object.assign(assessment, data);
  await assessment.save();

  await writeAuditLog({
    actor: req.user._id,
    action: 'assessment.updated',
    targetType: 'Assessment',
    targetId: assessment._id,
    metadata: { status: assessment.status },
    ip: req.ip,
  });

  return res.json({ assessment });
}
