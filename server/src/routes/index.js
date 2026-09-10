import { Router } from 'express';
import academicAdminRoutes from './academicAdmin.routes.js';
import adminRoutes from './admin.routes.js';
import authRoutes from './auth.routes.js';
import doctorAssessmentRoutes from './doctorAssessment.routes.js';
import doctorRoutes from './doctor.routes.js';
import doctorAttendanceRoutes from './doctorAttendance.routes.js';
import healthRoutes from './health.routes.js';
import invitationRoutes from './invitation.routes.js';
import recoveryRoutes from './recovery.routes.js';
import rewardAdminRoutes from './rewardAdmin.routes.js';
import studentRoutes from './student.routes.js';
import studentRewardRoutes from './studentReward.routes.js';
import {
  parentRouter,
  studentPerformanceRouter,
} from './performance.routes.js';

const router = Router();

router.use('/health', healthRoutes);
router.use('/auth', authRoutes);
router.use('/invitations', invitationRoutes);

router.use('/admin', adminRoutes);
router.use('/admin/academic', academicAdminRoutes);
router.use('/admin/rewards', rewardAdminRoutes);

router.use('/doctor', doctorRoutes);
router.use('/doctor', doctorAttendanceRoutes);
router.use('/doctor', doctorAssessmentRoutes);

router.use('/student', studentRoutes);
router.use('/student', studentPerformanceRouter);
router.use('/student/rewards', studentRewardRoutes);

router.use('/parent', parentRouter);
router.use('/account', recoveryRoutes);

export default router;
