import AttendanceRecord from '../models/AttendanceRecord.js';
import AttendanceSession from '../models/AttendanceSession.js';
import Course from '../models/Course.js';
import Enrollment from '../models/Enrollment.js';
import Group from '../models/Group.js';
import { writeAuditLog } from '../services/audit.service.js';
import {
  createNotification,
  notifyParentsOfStudent,
} from '../services/notification.service.js';
import { getDoctorProfileForUser, getOwnedCourse } from '../services/doctorAccess.service.js';
import { accessWindowFilter } from '../utils/accessWindow.js';
import { HttpError } from '../utils/httpError.js';
import { endOfWeekUtc, parseWeekStart } from '../utils/week.js';

async function ownedGroup(userId, groupId) {
  const group = await Group.findById(groupId);
  if (!group || !group.active) throw new HttpError(404, 'Active group not found.');
  const { profile, course } = await getOwnedCourse(userId, group.course);
  return { profile, course, group };
}

async function ownedSession(userId, sessionId) {
  const session = await AttendanceSession.findById(sessionId);
  if (!session) throw new HttpError(404, 'Attendance session not found.');

  const group = await Group.findOne({
    _id: session.group,
    course: session.course,
  }).select('_id');

  if (!group) {
    throw new HttpError(404, 'Attendance session hierarchy is not available.');
  }

  const { profile, course } = await getOwnedCourse(userId, session.course);
  return { profile, course, session };
}

export async function attendanceWorkspace(req, res) {
  const profile = await getDoctorProfileForUser(req.user._id);
  const courses = await Course.find({
    doctorProfile: profile._id,
    status: { $ne: 'archived' },
  })
    .select('title level academicYear')
    .sort({ title: 1 })
    .lean();

  const courseIds = courses.map((course) => course._id);
  const groups = await Group.find({
    course: { $in: courseIds },
    active: true,
  })
    .select('course name scheduleLabel')
    .sort({ name: 1 })
    .lean();

  const query = { course: { $in: courseIds } };
  if (req.query.courseId) {
    const allowed = courseIds.some((id) => String(id) === String(req.query.courseId));
    if (!allowed) throw new HttpError(403, 'You cannot access that course.');
    query.course = req.query.courseId;
  }
  if (req.query.groupId) query.group = req.query.groupId;

  const sessions = await AttendanceSession.find(query)
    .populate('course', 'title level')
    .populate('group', 'name scheduleLabel')
    .sort({ heldAt: -1 })
    .limit(80)
    .lean();

  return res.json({ profile, courses, groups, sessions });
}

export async function createAttendanceSession(req, res) {
  const { course, group } = await ownedGroup(req.user._id, req.params.groupId);
  const heldAt = new Date(req.validatedBody.heldAt);

  const enrollments = await Enrollment.find({
    course: course._id,
    group: group._id,
    status: 'active',
    paymentStatus: 'paid',
    accessEndDate: { $gte: heldAt },
    $or: [
      { accessStartDate: null },
      { accessStartDate: { $exists: false } },
      { accessStartDate: { $lte: heldAt } },
    ],
  })
    .select('student')
    .lean();

  if (!enrollments.length) {
    throw new HttpError(400, 'This group has no active students for that session date.');
  }

  const session = await AttendanceSession.create({
    course: course._id,
    group: group._id,
    title: req.validatedBody.title || '',
    heldAt,
    status: 'draft',
    createdBy: req.user._id,
  });

  await AttendanceRecord.insertMany(
    enrollments.map((enrollment) => ({
      session: session._id,
      course: course._id,
      group: group._id,
      student: enrollment.student,
      heldAt,
      status: 'unmarked',
    })),
  );

  await writeAuditLog({
    actor: req.user._id,
    action: 'attendance.session.created',
    targetType: 'AttendanceSession',
    targetId: session._id,
    metadata: { studentCount: enrollments.length },
    ip: req.ip,
  });

  return res.status(201).json({ session, studentCount: enrollments.length });
}

export async function getAttendanceSession(req, res) {
  const { session } = await ownedSession(req.user._id, req.params.sessionId);

  const records = await AttendanceRecord.find({ session: session._id })
    .populate('student', 'fullName email phone')
    .sort({ 'student.fullName': 1 })
    .lean();

  return res.json({ session, records });
}

export async function markAttendance(req, res) {
  const { session } = await ownedSession(req.user._id, req.params.sessionId);

  const records = await AttendanceRecord.find({ session: session._id })
    .select('_id student status')
    .lean();
  const allowedStudents = new Set(records.map((record) => String(record.student)));

  for (const item of req.validatedBody.records) {
    if (!allowedStudents.has(String(item.studentId))) {
      throw new HttpError(400, 'One or more students are not part of this attendance session.');
    }
  }

  const now = new Date();
  await AttendanceRecord.bulkWrite(
    req.validatedBody.records.map((item) => ({
      updateOne: {
        filter: { session: session._id, student: item.studentId },
        update: {
          $set: {
            status: item.status,
            markedBy: req.user._id,
            markedAt: now,
          },
        },
      },
    })),
  );

  // Finalized sessions remain editable for legitimate corrections. Updating one
  // refreshes finalizedAt so downstream views have an accurate correction time.
  if (session.status === 'finalized') {
    session.finalizedAt = now;
    await session.save();
  }

  return res.json({ message: 'Attendance saved.' });
}

export async function finalizeAttendance(req, res) {
  const { session } = await ownedSession(req.user._id, req.params.sessionId);
  const unmarked = await AttendanceRecord.countDocuments({
    session: session._id,
    status: 'unmarked',
  });

  if (unmarked > 0) {
    throw new HttpError(400, `Mark all students before finalizing. ${unmarked} still unmarked.`);
  }

  session.status = 'finalized';
  session.finalizedAt = new Date();
  await session.save();

  const absentRecords = await AttendanceRecord.find({
    session: session._id,
    status: 'absent',
  })
    .populate('student', 'fullName')
    .lean();

  const course = await Course.findById(session.course)
    .select('title')
    .lean();

  for (const record of absentRecords) {
    if (!record.student) continue;

    const heldDate = new Date(session.heldAt).toLocaleDateString('en-GB');

    Promise.allSettled([
      createNotification({
        recipient: record.student._id,
        category: 'attendance',
        type: 'attendance_absence',
        title: 'Attendance marked absent',
        message: `You were marked absent from ${course?.title || 'your course'} on ${heldDate}.`,
        href: '/student/performance',
        metadata: {
          sessionId: String(session._id),
          courseId: String(session.course),
        },
        dedupeKey: `absence:${session._id}:${record.student._id}`,
      }),
      notifyParentsOfStudent(record.student._id, {
        category: 'attendance',
        type: 'child_attendance_absence',
        title: 'Attendance update',
        message: `${record.student.fullName} was marked absent from ${course?.title || 'a Bastly course'} on ${heldDate}.`,
        href: `/parent/children/${record.student._id}/courses/${session.course}`,
        metadata: {
          studentId: String(record.student._id),
          sessionId: String(session._id),
          courseId: String(session.course),
        },
        dedupeKey: `parent-absence:${session._id}:${record.student._id}`,
      }),
    ]).catch(() => {});
  }

  await writeAuditLog({
    actor: req.user._id,
    action: 'attendance.session.finalized',
    targetType: 'AttendanceSession',
    targetId: session._id,
    ip: req.ip,
  });

  return res.json({ session });
}

export async function doctorWeeklyPerformance(req, res) {
  const { profile, course } = await getOwnedCourse(req.user._id, req.params.courseId);
  const weekStart = parseWeekStart(req.query.weekStart);
  const weekEnd = endOfWeekUtc(weekStart);

  const enrollments = await Enrollment.find({
    course: course._id,
    status: 'active',
    paymentStatus: 'paid',
    ...accessWindowFilter(weekStart, weekEnd),
  })
    .populate('student', 'fullName email phone status')
    .populate('group', 'name scheduleLabel')
    .sort({ createdAt: 1 })
    .lean();

  const studentIds = enrollments
    .filter((item) => item.student?.status === 'active')
    .map((item) => item.student._id);

  const { computeCourseWeekPerformance, basePerformanceWeights } = await import('../services/performance.service.js');
  const performance = await computeCourseWeekPerformance({
    courseId: course._id,
    studentIds,
    weekStart,
  });
  const byStudent = new Map(performance.map((item) => [String(item.student), item]));

  return res.json({
    profile,
    course,
    weekStart,
    weekEnd,
    baseWeights: basePerformanceWeights(),
    rows: enrollments
      .filter((item) => item.student?.status === 'active')
      .map((item) => ({
        enrollmentId: item._id,
        student: item.student,
        group: item.group,
        performance: byStudent.get(String(item.student._id)) || null,
      })),
  });
}
