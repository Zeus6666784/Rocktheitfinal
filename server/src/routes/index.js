// All 9 endpoints mounted under /api. Order matters for path resolution.
import { Router } from 'express';
import { optionalAuth, requireAuth, requireAdminJWT } from '../middleware/auth.js';
import { requireAdmin, adminLimiter, authLimiter } from '../middleware/adminAuth.js';
import { wrap } from '../middleware/validate.js';

import * as auth from '../controllers/authController.js';
import * as courses from '../controllers/courseController.js';
import * as lectures from '../controllers/lectureController.js';
import * as progress from '../controllers/progressController.js';
import * as certificate from '../controllers/certificateController.js';
import * as admin from '../controllers/adminController.js';
import * as adminManage from '../controllers/adminManageController.js';

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
router.get('/videos/:filename', requireAuth, requireAdminJWT, admin.streamVideo);

// ponytail: public demo video route. Serves the same files but with
// no admin check, so the SPA's <video src=...> can play them without
// sending X-Admin-Key. Demo-only - the filenames are not secret.
router.get('/videos-public/:filename', wrap(admin.streamVideoPublic));

// Admin surface - JWT role-based (no X-Admin-Key). Rate limited.
router.post('/admin/videos', adminLimiter, requireAuth, requireAdminJWT, admin.uploadMiddleware, wrap(admin.uploadVideo));
router.get('/admin/videos', adminLimiter, requireAuth, requireAdminJWT, wrap(admin.listVideos));
router.patch('/admin/lectures/:id', adminLimiter, requireAuth, requireAdminJWT, wrap(admin.patchLectureVideo));

// Admin management surface (JWT role-based)
router.get('/admin/stats', adminLimiter, requireAuth, requireAdminJWT, wrap(adminManage.stats));
router.get('/admin/courses', adminLimiter, requireAuth, requireAdminJWT, wrap(adminManage.listCourses));
router.post('/admin/courses', adminLimiter, requireAuth, requireAdminJWT, wrap(adminManage.createCourse));
router.patch('/admin/courses/:id', adminLimiter, requireAuth, requireAdminJWT, wrap(adminManage.updateCourse));
router.delete('/admin/courses/:id', adminLimiter, requireAuth, requireAdminJWT, wrap(adminManage.deleteCourse));
router.get('/admin/lectures', adminLimiter, requireAuth, requireAdminJWT, wrap(adminManage.listLectures));
router.post('/admin/lectures', adminLimiter, requireAuth, requireAdminJWT, wrap(adminManage.createLecture));
router.put('/admin/lectures/:id', adminLimiter, requireAuth, requireAdminJWT, wrap(adminManage.updateLecture));
router.delete('/admin/lectures/:id', adminLimiter, requireAuth, requireAdminJWT, wrap(adminManage.deleteLecture));
router.get('/admin/users', adminLimiter, requireAuth, requireAdminJWT, wrap(adminManage.listUsers));
router.patch('/admin/users/:id', adminLimiter, requireAuth, requireAdminJWT, wrap(adminManage.updateUser));
router.delete('/admin/users/:id', adminLimiter, requireAuth, requireAdminJWT, wrap(adminManage.deleteUser));
router.get('/admin/categories', adminLimiter, requireAuth, requireAdminJWT, wrap(adminManage.listCategories));
router.post('/admin/categories', adminLimiter, requireAuth, requireAdminJWT, wrap(adminManage.createCategory));
router.get('/admin/instructors', adminLimiter, requireAuth, requireAdminJWT, wrap(adminManage.listInstructors));
router.get('/admin/enrollments', adminLimiter, requireAuth, requireAdminJWT, wrap(adminManage.listEnrollments));
router.get('/admin/analytics', adminLimiter, requireAuth, requireAdminJWT, wrap(adminManage.analytics));
router.get('/admin/settings', adminLimiter, requireAuth, requireAdminJWT, wrap(adminManage.settings));

export default router;