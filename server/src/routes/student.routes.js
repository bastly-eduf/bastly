import { Router } from 'express';
import {
  getStudentAssessment,
  listStudentAssessments,
  studentOverview,
  submitStudentAssessment,
} from '../controllers/student.controller.js';
import {
  createParentShareInvitation,
  getParentAccess,
} from '../controllers/studentParentAccess.controller.js';
import { authenticate } from '../middleware/authenticate.js';
import { authorize } from '../middleware/authorize.js';
import {
  assessmentSubmissionLimiter,
  invitationLimiter,
} from '../middleware/rateLimiters.js';
import { validate } from '../middleware/validate.js';
import { submitAssessmentSchema } from '../validators/assessment.validators.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const router = Router();
router.use(authenticate, authorize('student'));
router.get('/overview', asyncHandler(studentOverview));
router.get('/parent-access', asyncHandler(getParentAccess));
router.post(
  '/parent-invitations',
  invitationLimiter,
  asyncHandler(createParentShareInvitation),
);
router.get('/assessments', asyncHandler(listStudentAssessments));
router.get('/assessments/:assessmentId', asyncHandler(getStudentAssessment));
router.post(
  '/assessments/:assessmentId/submit',
  assessmentSubmissionLimiter,
  validate(submitAssessmentSchema),
  asyncHandler(submitStudentAssessment),
);
export default router;
