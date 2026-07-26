// All 9 endpoints mounted under /api. Order matters for path resolution.
import { Router } from 'express';
import { optionalAuth, requireAuth } from '../middleware/auth.js';
import { wrap } from '../middleware/validate.js';

import * as auth from '../controllers/authController.js';
import * as courses from '../controllers/courseController.js';
import * as lectures from '../controllers/lectureController.js';
import * as progress from '../controllers/progressController.js';
import * as certificate from '../controllers/certificateController.js';

const router = Router();

// Auth (2)
router.post('/auth/register', wrap(auth.register));
router.post('/auth/login', wrap(auth.login));

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

export default router;