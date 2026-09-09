import { Router } from 'express';
import {
  getStudentAssessment,
  listStudentAssessments,
  studentOverview,
  submitStudentAssessment,
} from '../controllers/student.controller.js';
import { authenticate } from '../middleware/authenticate.js';
import { authorize } from '../middleware/authorize.js';
import { validate } from '../middleware/validate.js';
import { submitAssessmentSchema } from '../validators/assessment.validators.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const router = Router();
router.use(authenticate, authorize('student'));
router.get('/overview', asyncHandler(studentOverview));
router.get('/assessments', asyncHandler(listStudentAssessments));
router.get('/assessments/:assessmentId', asyncHandler(getStudentAssessment));
router.post('/assessments/:assessmentId/submit', validate(submitAssessmentSchema), asyncHandler(submitStudentAssessment));
export default router;
