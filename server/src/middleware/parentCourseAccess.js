import Course from '../models/Course.js';
import Enrollment from '../models/Enrollment.js';
import ParentRelationship from '../models/ParentRelationship.js';
import User from '../models/User.js';
import { currentAccessFilter } from '../utils/accessWindow.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { HttpError } from '../utils/httpError.js';

export const requireParentCurrentCourseAccess = asyncHandler(async (req, res, next) => {
  const relationship = await ParentRelationship.findOne({
    parent: req.user._id,
    student: req.params.studentId,
    status: 'active',
  }).lean();

  if (!relationship) {
    throw new HttpError(403, 'You are not linked to this student.');
  }

  const student = await User.findOne({
    _id: req.params.studentId,
    role: 'student',
    status: 'active',
  })
    .select('_id')
    .lean();

  if (!student) {
    throw new HttpError(404, 'Student not found.');
  }

  const enrollment = await Enrollment.findOne({
    student: student._id,
    course: req.params.courseId,
    status: 'active',
    paymentStatus: 'paid',
    ...currentAccessFilter(),
  })
    .select('_id course')
    .lean();

  if (!enrollment) {
    throw new HttpError(404, 'This active course was not found for your child.');
  }

  const course = await Course.exists({
    _id: enrollment.course,
    status: 'published',
  });

  if (!course) {
    throw new HttpError(404, 'This active course was not found for your child.');
  }

  next();
});
