import Course from '../models/Course.js';
import Enrollment from '../models/Enrollment.js';
import DoctorProfile from '../models/DoctorProfile.js';
import Group from '../models/Group.js';
import User from '../models/User.js';
import { HttpError } from '../utils/httpError.js';
import {
  createNotification,
  notifyParentsOfStudent,
} from './notification.service.js';

export async function validateEnrollmentReferences({
  studentId,
  courseId,
  groupId,
}) {
  const [student, course, group] = await Promise.all([
    User.findById(studentId).lean(),
    Course.findById(courseId).lean(),
    Group.findById(groupId).lean(),
  ]);

  if (!student || student.role !== 'student' || student.status !== 'active') {
    throw new HttpError(400, 'Choose an active student account.');
  }

  if (!course || course.status === 'archived') {
    throw new HttpError(400, 'Choose an available course.');
  }

  if (!group || !group.active || String(group.course) !== String(course._id)) {
    throw new HttpError(400, 'The selected group does not belong to this course.');
  }

  return { student, course, group };
}

export async function createOrResetPendingEnrollment({
  studentId,
  courseId,
  groupId,
  adminNote,
  actorId,
}) {
  const { course } = await validateEnrollmentReferences({
    studentId,
    courseId,
    groupId,
  });

  let enrollment = await Enrollment.findOne({
    student: studentId,
    course: courseId,
    group: groupId,
  });

  if (enrollment && ['pending', 'active'].includes(enrollment.status)) {
    throw new HttpError(
      409,
      enrollment.status === 'active'
        ? 'This student is already enrolled in that group.'
        : 'A pending enrollment already exists for this student.',
    );
  }

  if (!enrollment) {
    enrollment = new Enrollment({
      student: studentId,
      course: courseId,
      group: groupId,
    });
  }

  enrollment.status = 'pending';
  enrollment.paymentStatus = 'pending';
  enrollment.pricePaid = null;
  enrollment.paidAt = null;
  enrollment.accessStartDate = null;
  enrollment.accessEndDate = null;
  enrollment.unregisteredAt = null;
  enrollment.unregisteredBy = null;
  enrollment.adminNote = adminNote || '';
  enrollment.statusHistory.push({
    status: 'pending',
    by: actorId,
    note: 'Enrollment created / reopened.',
  });

  await enrollment.save();

  return enrollment.populate([
    { path: 'student', select: 'fullName email phone role status' },
    { path: 'course', select: 'title level academicYear price accessEndDate' },
    { path: 'group', select: 'name scheduleLabel active' },
  ]);
}

export async function activateEnrollment({
  enrollment,
  actorId,
  pricePaid,
  paidAt,
  adminNote,
}) {
  const course = await Course.findById(enrollment.course).lean();

  if (!course) {
    throw new HttpError(400, 'The course for this enrollment no longer exists.');
  }

  enrollment.status = 'active';
  enrollment.paymentStatus = 'paid';
  enrollment.pricePaid =
    pricePaid === undefined || pricePaid === null ? course.price : pricePaid;
  enrollment.paidAt = paidAt || new Date();
  enrollment.accessStartDate = new Date();
  enrollment.accessEndDate = course.accessEndDate;
  enrollment.unregisteredAt = null;
  enrollment.unregisteredBy = null;

  if (adminNote !== undefined) {
    enrollment.adminNote = adminNote;
  }

  enrollment.statusHistory.push({
    status: 'active',
    by: actorId,
    note: 'Payment confirmed and course access activated.',
  });

  await enrollment.save();

  const doctorProfile = course.doctorProfile
    ? await DoctorProfile.findById(course.doctorProfile)
        .select('user displayName')
        .lean()
    : null;

  const notificationTasks = [
    createNotification({
      recipient: enrollment.student,
      category: 'access',
      type: 'course_access_activated',
      title: 'Course access unlocked',
      message: `Your access to ${course.title} is now active.`,
      href: `/student/courses/${course._id}`,
      metadata: {
        courseId: String(course._id),
        enrollmentId: String(enrollment._id),
      },
      dedupeKey: `course-access:${enrollment._id}:${enrollment.paidAt?.toISOString() || 'paid'}`,
    }),
    notifyParentsOfStudent(enrollment.student, {
      category: 'access',
      type: 'child_course_access_activated',
      title: 'Course access confirmed',
      message: `A course payment was confirmed and access to ${course.title} is now active.`,
      href: `/parent/children/${enrollment.student}/courses/${course._id}`,
      metadata: {
        studentId: String(enrollment.student),
        courseId: String(course._id),
      },
      dedupeKey: `parent-course-access:${enrollment._id}:${enrollment.paidAt?.toISOString() || 'paid'}`,
    }),
  ];

  if (doctorProfile?.user) {
    notificationTasks.push(
      createNotification({
        recipient: doctorProfile.user,
        category: 'access',
        type: 'student_enrolled',
        title: 'Student joined your course',
        message: `A student now has active access to ${course.title}.`,
        href: '/doctor/students',
        metadata: {
          studentId: String(enrollment.student),
          courseId: String(course._id),
        },
        dedupeKey: `doctor-enrollment:${enrollment._id}:${enrollment.paidAt?.toISOString() || 'paid'}`,
      }),
    );
  }

  Promise.allSettled(notificationTasks).catch(() => {});

  return enrollment.populate([
    { path: 'student', select: 'fullName email phone role status' },
    { path: 'course', select: 'title level academicYear price accessEndDate' },
    { path: 'group', select: 'name scheduleLabel active' },
  ]);
}

export async function unregisterEnrollment({
  enrollment,
  actorId,
  note,
}) {
  if (enrollment.status === 'unregistered') {
    throw new HttpError(409, 'This enrollment is already unregistered.');
  }

  enrollment.status = 'unregistered';
  enrollment.unregisteredAt = new Date();
  enrollment.unregisteredBy = actorId;
  enrollment.statusHistory.push({
    status: 'unregistered',
    by: actorId,
    note: note || 'Unregistered by admin.',
  });

  await enrollment.save();

  return enrollment.populate([
    { path: 'student', select: 'fullName email phone role status' },
    { path: 'course', select: 'title level academicYear price accessEndDate' },
    { path: 'group', select: 'name scheduleLabel active' },
  ]);
}
