import Course from '../models/Course.js';
import DoctorProfile from '../models/DoctorProfile.js';
import Lesson from '../models/Lesson.js';
import Module from '../models/Module.js';
import { HttpError } from '../utils/httpError.js';

export async function getDoctorProfileForUser(userId) {
  const profile = await DoctorProfile.findOne({
    user: userId,
    isPublished: true,
  });

  if (!profile) {
    throw new HttpError(
      403,
      'Your doctor account is not linked to an active Bastly instructor profile.',
    );
  }

  return profile;
}

export async function getOwnedCourse(userId, courseId) {
  const profile = await getDoctorProfileForUser(userId);

  const course = await Course.findOne({
    _id: courseId,
    doctorProfile: profile._id,
    status: { $ne: 'archived' },
  });

  if (!course) {
    throw new HttpError(404, 'Course not found or not assigned to your account.');
  }

  return { profile, course };
}

export async function getOwnedModule(userId, moduleId) {
  const module = await Module.findById(moduleId);

  if (!module) {
    throw new HttpError(404, 'Module not found.');
  }

  const { profile, course } = await getOwnedCourse(userId, module.course);

  return { profile, course, module };
}

export async function getOwnedLesson(userId, lessonId) {
  const lesson = await Lesson.findById(lessonId);

  if (!lesson) {
    throw new HttpError(404, 'Lesson not found.');
  }

  const { profile, course } = await getOwnedCourse(userId, lesson.course);

  return { profile, course, lesson };
}
