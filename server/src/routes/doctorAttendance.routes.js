import { Router } from 'express';
import {
  attendanceWorkspace,
  createAttendanceSession,
  doctorWeeklyPerformance,
  finalizeAttendance,
  getAttendanceSession,
  markAttendance,
} from '../controllers/doctorAttendance.controller.js';
import { authenticate } from '../middleware/authenticate.js';
import { authorize } from '../middleware/authorize.js';
import { validate } from '../middleware/validate.js';
import {
  createAttendanceSessionSchema,
  markAttendanceSchema,
} from '../validators/attendance.validators.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const router = Router();
router.use(authenticate, authorize('doctor'));

router.get('/attendance', asyncHandler(attendanceWorkspace));
router.post(
  '/groups/:groupId/attendance-sessions',
  validate(createAttendanceSessionSchema),
  asyncHandler(createAttendanceSession),
);
router.get('/attendance-sessions/:sessionId', asyncHandler(getAttendanceSession));
router.patch(
  '/attendance-sessions/:sessionId/records',
  validate(markAttendanceSchema),
  asyncHandler(markAttendance),
);
router.post('/attendance-sessions/:sessionId/finalize', asyncHandler(finalizeAttendance));
router.get('/courses/:courseId/performance', asyncHandler(doctorWeeklyPerformance));

export default router;
