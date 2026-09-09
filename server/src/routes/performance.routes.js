import { Router } from 'express';
import {
  parentChildPerformance,
  parentOverview,
  studentPerformance,
} from '../controllers/performanceView.controller.js';
import { authenticate } from '../middleware/authenticate.js';
import { authorize } from '../middleware/authorize.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const studentPerformanceRouter = Router();
studentPerformanceRouter.use(authenticate, authorize('student'));
studentPerformanceRouter.get('/performance', asyncHandler(studentPerformance));

export const parentRouter = Router();
parentRouter.use(authenticate, authorize('parent'));
parentRouter.get('/overview', asyncHandler(parentOverview));
parentRouter.get('/children/:studentId/performance', asyncHandler(parentChildPerformance));
