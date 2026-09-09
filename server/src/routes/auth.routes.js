import { Router } from 'express';

import {
  login,
  logout,
  me,
  registerStudent,
} from '../controllers/auth.controller.js';
import { authenticate } from '../middleware/authenticate.js';
import { authLimiter } from '../middleware/rateLimiters.js';
import { validate } from '../middleware/validate.js';
import {
  loginSchema,
  studentRegistrationSchema,
} from '../validators/auth.validators.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const router = Router();

router.post(
  '/register/student',
  authLimiter,
  validate(studentRegistrationSchema),
  asyncHandler(registerStudent),
);

router.post(
  '/login',
  authLimiter,
  validate(loginSchema),
  asyncHandler(login),
);

router.post('/logout', authenticate, asyncHandler(logout));
router.get('/me', authenticate, asyncHandler(me));

export default router;
