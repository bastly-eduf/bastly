import Course from '../models/Course.js';
import Enrollment from '../models/Enrollment.js';
import ParentRelationship from '../models/ParentRelationship.js';
import User from '../models/User.js';
import { basePerformanceWeights, computeCourseWeekPerformance } from '../services/performance.service.js';
import { HttpError } from '../utils/httpError.js';
import { endOfWeekUtc, parseWeekStart } from '../utils/week.js';

async function studentCourseRows(studentId, weekStart) {
  const enrollments = await Enrollment.find({
    student: studentId,
    status: 'active',
    paymentStatus: 'paid',
    accessEndDate: { $gte: weekStart },
  })
    .populate({
      path: 'course',
      match: { status: { $ne: 'archived' } },
      select: 'title level academicYear doctorProfile',
      populate: { path: 'doctorProfile', select: 'displayName' },
    })
    .populate('group', 'name scheduleLabel')
    .lean();

  const active = enrollments.filter((item) => item.course);
  const rows = [];

  for (const enrollment of active) {
    const [performance] = await computeCourseWeekPerformance({
      courseId: enrollment.course._id,
      studentIds: [studentId],
      weekStart,
    });

    rows.push({
      enrollmentId: enrollment._id,
      course: enrollment.course,
      group: enrollment.group,
      performance,
    });
  }

  return rows;
}

export async function studentPerformance(req, res) {
  const weekStart = parseWeekStart(req.query.weekStart);
  const rows = await studentCourseRows(req.user._id, weekStart);

  return res.json({
    weekStart,
    weekEnd: endOfWeekUtc(weekStart),
    baseWeights: basePerformanceWeights(),
    rows,
  });
}

export async function parentOverview(req, res) {
  const weekStart = parseWeekStart(req.query.weekStart);

  const relationships = await ParentRelationship.find({
    parent: req.user._id,
    status: 'active',
  })
    .populate('student', 'fullName email phone status')
    .sort({ linkedAt: 1 })
    .lean();

  const children = [];

  for (const relationship of relationships) {
    if (!relationship.student || relationship.student.status !== 'active') continue;

    const rows = await studentCourseRows(relationship.student._id, weekStart);
    children.push({
      relationshipId: relationship._id,
      student: relationship.student,
      courses: rows,
    });
  }

  return res.json({
    weekStart,
    weekEnd: endOfWeekUtc(weekStart),
    baseWeights: basePerformanceWeights(),
    children,
  });
}

export async function parentChildPerformance(req, res) {
  const relationship = await ParentRelationship.findOne({
    parent: req.user._id,
    student: req.params.studentId,
    status: 'active',
  }).lean();

  if (!relationship) {
    throw new HttpError(403, 'You are not linked to this student.');
  }

  const student = await User.findById(req.params.studentId)
    .select('fullName email phone status')
    .lean();

  if (!student || student.status !== 'active') {
    throw new HttpError(404, 'Student not found.');
  }

  const weekStart = parseWeekStart(req.query.weekStart);
  const rows = await studentCourseRows(student._id, weekStart);

  return res.json({
    student,
    weekStart,
    weekEnd: endOfWeekUtc(weekStart),
    baseWeights: basePerformanceWeights(),
    rows,
  });
}
