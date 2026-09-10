import { Router } from 'express';

import {
  getPublicCourse,
  getPublicDoctor,
  listPublicCourses,
  listPublicDoctors,
} from '../controllers/public.controller.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const router = Router();

router.get('/doctors', asyncHandler(listPublicDoctors));
router.get('/doctors/:slug', asyncHandler(getPublicDoctor));
router.get('/courses', asyncHandler(listPublicCourses));
router.get('/courses/:slug', asyncHandler(getPublicCourse));

export default router;
