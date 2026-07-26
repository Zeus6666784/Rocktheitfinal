// All 9 endpoints mounted under /api. Order matters for path resolution.
import { Router } from 'express';
import { optionalAuth, requireAuth } from '../middleware/auth.js';
import { requireAdmin, adminLimiter, authLimiter } from '../middleware/adminAuth.js';
import { wrap } from '../middleware/validate.js';

import * as auth from '../controllers/authController.js';
import * as courses from '../controllers/courseController.js';
import * as lectures from '../controllers/lectureController.js';
import * as progress from '../controllers/progressController.js';
import * as certificate from '../controllers/certificateController.js';
import * as admin from '../controllers/adminController.js';

const router = Router();

// Auth (2)
router.post('/auth/register', authLimiter, wrap(auth.register));
router.post('/auth/login', authLimiter, wrap(auth.login));

// Courses (3)
router.get('/courses', optionalAuth, wrap(courses.list));
router.get('/courses/:id', optionalAuth, wrap(courses.detail));
router.post('/courses/:id/enroll', requireAuth, wrap(courses.enroll));

// Lectures (1)
router.get('/lectures/:id', requireAuth, wrap(lectures.detail));

// Progress (2)
router.post('/progress', requireAuth, wrap(progress.upsert));
router.get('/progress/:courseId', requireAuth, wrap(progress.detail));

// Certificate (1)
router.get('/certificate/:courseId', requireAuth, wrap(certificate.detail));

// Token-gated video stream. The SPA passes the X-Admin-Key header from
// the admin session; if missing/incorrect we 401. Kept under /api/ so
// the same-domain deployment (Vite + Express on Railway) avoids CORS.
router.get('/videos/:filename', requireAdmin, admin.streamVideo);

// Admin surface (3) - all require X-Admin-Key + rate limit.
router.post('/admin/videos', adminLimiter, requireAdmin, admin.uploadMiddleware, wrap(admin.uploadVideo));
router.get('/admin/videos', adminLimiter, requireAdmin, wrap(admin.listVideos));
router.patch('/admin/lectures/:id', adminLimiter, requireAdmin, wrap(admin.patchLectureVideo));

export default router;