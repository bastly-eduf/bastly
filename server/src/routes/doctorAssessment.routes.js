import { Router } from 'express';
import {
  createAssessment,
  listCourseAssessments,
  updateAssessment,
} from '../controllers/doctorAssessment.controller.js';
import { authenticate } from '../middleware/authenticate.js';
import { authorize } from '../middleware/authorize.js';
import { validate } from '../middleware/validate.js';
import {
  createAssessmentSchema,
  updateAssessmentSchema,
} from '../validators/assessment.validators.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const router = Router();
router.use(authenticate, authorize('doctor'));
router.get('/courses/:courseId/assessments', asyncHandler(listCourseAssessments));
router.post('/courses/:courseId/assessments', validate(createAssessmentSchema), asyncHandler(createAssessment));
router.patch('/assessments/:assessmentId', validate(updateAssessmentSchema), asyncHandler(updateAssessment));
export default router;
