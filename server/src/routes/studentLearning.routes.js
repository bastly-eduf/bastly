import { Router } from 'express';

import {
  getStudentCourseWorkspace,
  getStudentLesson,
  listStudentCourses,
  setLessonCompletion,
} from '../controllers/studentLearning.controller.js';
import { authenticate } from '../middleware/authenticate.js';
import { authorize } from '../middleware/authorize.js';
import { validate } from '../middleware/validate.js';
import { lessonCompletionSchema } from '../validators/learning.validators.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const router = Router();

router.use(authenticate, authorize('student'));

router.get('/courses', asyncHandler(listStudentCourses));
router.get(
  '/courses/:courseId',
  asyncHandler(getStudentCourseWorkspace),
);
router.get(
  '/lessons/:lessonId',
  asyncHandler(getStudentLesson),
);
router.patch(
  '/lessons/:lessonId/completion',
  validate(lessonCompletionSchema),
  asyncHandler(setLessonCompletion),
);

export default router;
