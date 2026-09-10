import Course from '../models/Course.js';
import Enrollment from '../models/Enrollment.js';
import Lesson from '../models/Lesson.js';
import Module from '../models/Module.js';
import { HttpError } from '../utils/httpError.js';

export async function getStudentCourseAccess(studentId, courseId) {
  const now = new Date();

  const enrollment = await Enrollment.findOne({
    student: studentId,
    course: courseId,
    status: 'active',
    paymentStatus: 'paid',
    accessEndDate: { $gte: now },
  })
    .populate('group', 'name scheduleLabel meetingUrl active')
    .lean();

  if (!enrollment) {
    throw new HttpError(
      403,
      'You need active paid access to open this course.',
    );
  }

  const course = await Course.findOne({
    _id: courseId,
    status: 'published',
  })
    .populate(
      'doctorProfile',
      'displayName subject imageUrl slug',
    )
    .lean();

  if (!course) {
    throw new HttpError(
      404,
      'This course is not currently available.',
    );
  }

  return { enrollment, course };
}

export async function getStudentLessonAccess(studentId, lessonId) {
  const lesson = await Lesson.findOne({
    _id: lessonId,
    status: 'published',
  }).lean();

  if (!lesson) {
    throw new HttpError(404, 'Lesson not found.');
  }

  const module = await Module.findOne({
    _id: lesson.module,
    course: lesson.course,
    status: 'published',
  }).lean();

  if (!module) {
    throw new HttpError(
      404,
      'This lesson is not currently available.',
    );
  }

  const { enrollment, course } = await getStudentCourseAccess(
    studentId,
    lesson.course,
  );

  return {
    enrollment,
    course,
    module,
    lesson,
  };
}
