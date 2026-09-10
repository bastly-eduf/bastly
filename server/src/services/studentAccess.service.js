import Assessment from '../models/Assessment.js';
import Course from '../models/Course.js';
import Enrollment from '../models/Enrollment.js';
import { currentAccessFilter } from '../utils/accessWindow.js';
import { HttpError } from '../utils/httpError.js';

export async function getStudentAssessmentAccess(studentId, assessmentId) {
  const assessment = await Assessment.findOne({ _id: assessmentId, status: 'published' });
  if (!assessment) throw new HttpError(404, 'Assessment not found.');

  const course = await Course.findOne({ _id: assessment.course, status: 'published' }).lean();
  if (!course) throw new HttpError(403, 'This course is not currently available.');

  const enrollment = await Enrollment.findOne({
    student: studentId,
    course: assessment.course,
    status: 'active',
    paymentStatus: 'paid',
    ...currentAccessFilter(),
  });

  if (!enrollment) {
    throw new HttpError(403, 'You need active course access to open this assessment.');
  }

  return { assessment, enrollment, course };
}
