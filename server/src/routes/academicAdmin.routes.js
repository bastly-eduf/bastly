import { Router } from 'express';

import {
  confirmEnrollmentPayment,
  createCourse,
  createDoctorProfile,
  createEnrollment,
  createGroup,
  listCourses,
  listDoctorProfiles,
  listEnrollments,
  listStudents,
  overview,
  unregisterEnrollment,
  updateCourse,
  updateDoctorProfile,
  updateGroup,
} from '../controllers/academicAdmin.controller.js';
import { authenticate } from '../middleware/authenticate.js';
import { authorize } from '../middleware/authorize.js';
import { validate } from '../middleware/validate.js';
import {
  confirmPaymentSchema,
  createCourseSchema,
  createDoctorProfileSchema,
  createEnrollmentSchema,
  createGroupSchema,
  unregisterEnrollmentSchema,
  updateCourseSchema,
  updateDoctorProfileSchema,
  updateGroupSchema,
} from '../validators/academic.validators.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const router = Router();

router.use(authenticate, authorize('admin'));

router.get('/overview', asyncHandler(overview));

router.get('/doctor-profiles', asyncHandler(listDoctorProfiles));
router.post(
  '/doctor-profiles',
  validate(createDoctorProfileSchema),
  asyncHandler(createDoctorProfile),
);
router.patch(
  '/doctor-profiles/:id',
  validate(updateDoctorProfileSchema),
  asyncHandler(updateDoctorProfile),
);

router.get('/courses', asyncHandler(listCourses));
router.post(
  '/courses',
  validate(createCourseSchema),
  asyncHandler(createCourse),
);
router.patch(
  '/courses/:id',
  validate(updateCourseSchema),
  asyncHandler(updateCourse),
);

router.post(
  '/groups',
  validate(createGroupSchema),
  asyncHandler(createGroup),
);
router.patch(
  '/groups/:id',
  validate(updateGroupSchema),
  asyncHandler(updateGroup),
);

router.get('/students', asyncHandler(listStudents));
router.get('/enrollments', asyncHandler(listEnrollments));
router.post(
  '/enrollments',
  validate(createEnrollmentSchema),
  asyncHandler(createEnrollment),
);
router.patch(
  '/enrollments/:id/confirm-payment',
  validate(confirmPaymentSchema),
  asyncHandler(confirmEnrollmentPayment),
);
router.patch(
  '/enrollments/:id/unregister',
  validate(unregisterEnrollmentSchema),
  asyncHandler(unregisterEnrollment),
);

export default router;
