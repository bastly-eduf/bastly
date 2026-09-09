import { Router } from 'express';

import {
  createLesson,
  createModule,
  doctorOverview,
  getDoctorCourseWorkspace,
  listDoctorCourses,
  listDoctorStudents,
  updateLesson,
  updateModule,
} from '../controllers/doctor.controller.js';
import { authenticate } from '../middleware/authenticate.js';
import { authorize } from '../middleware/authorize.js';
import { validate } from '../middleware/validate.js';
import {
  createLessonSchema,
  createModuleSchema,
  updateLessonSchema,
  updateModuleSchema,
} from '../validators/content.validators.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const router = Router();

router.use(authenticate, authorize('doctor'));

router.get('/overview', asyncHandler(doctorOverview));
router.get('/courses', asyncHandler(listDoctorCourses));
router.get('/courses/:courseId', asyncHandler(getDoctorCourseWorkspace));
router.get('/students', asyncHandler(listDoctorStudents));

router.post(
  '/courses/:courseId/modules',
  validate(createModuleSchema),
  asyncHandler(createModule),
);

router.patch(
  '/modules/:moduleId',
  validate(updateModuleSchema),
  asyncHandler(updateModule),
);

router.post(
  '/modules/:moduleId/lessons',
  validate(createLessonSchema),
  asyncHandler(createLesson),
);

router.patch(
  '/lessons/:lessonId',
  validate(updateLessonSchema),
  asyncHandler(updateLesson),
);

export default router;
