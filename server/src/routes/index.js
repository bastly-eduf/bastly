import { Router } from 'express';
import academicAdminRoutes from './academicAdmin.routes.js';
import adminRoutes from './admin.routes.js';
import authRoutes from './auth.routes.js';
import healthRoutes from './health.routes.js';
import invitationRoutes from './invitation.routes.js';
import recoveryRoutes from './recovery.routes.js';

const router = Router();

router.use('/health', healthRoutes);
router.use('/auth', authRoutes);
router.use('/invitations', invitationRoutes);
router.use('/admin', adminRoutes);
router.use('/admin/academic', academicAdminRoutes);
router.use('/account', recoveryRoutes);

export default router;
