import { ok } from '../utils/response.js';
import * as lectureService from '../services/lectureService.js';
import * as courseService from '../services/courseService.js';
import { fail } from '../utils/response.js';
import { sendVideoFile } from './adminController.js';

export async function detail(req, res) {
  const { id: lectureId } = req.params;
  const userId = req.user.id;

  // Fetch the lecture first to know its courseId, then check enrollment.
  // (lectureService.getLectureForUser uses courseService.getLectureLockState which needs userId.)
  const data = await lectureService.getLectureForUser({ userId, lectureId });

  // ponytail: enrollment gate at the trust boundary; locked is a separate signal.
  const enrolled = await courseService.userIsEnrolled({ userId, courseId: data.courseId });
  if (req.user.role !== 'admin' && !enrolled) return fail(res, 403, 'FORBIDDEN', 'Enroll in the course to access lectures');
  if (req.user.role !== 'admin' && data.locked) return fail(res, 403, 'FORBIDDEN', 'Previous lecture not completed');
  return ok(res, data);
}

export async function stream(req, res) {
  const data = await lectureService.getLectureForUser({ userId: req.user.id, lectureId: req.params.id });
  const enrolled = await courseService.userIsEnrolled({ userId: req.user.id, courseId: data.courseId });
  if (req.user.role !== 'admin' && !enrolled) return fail(res, 403, 'FORBIDDEN', 'Enroll in the course to access lectures');
  if (req.user.role !== 'admin' && data.locked) return fail(res, 403, 'FORBIDDEN', 'Previous lecture not completed');
  const match = String(data.videoUrl || '').match(/^\/api\/videos\/([A-Za-z0-9._-]{1,120})$/);
  if (!match) return fail(res, 404, 'NOT_FOUND', 'This lecture does not use a managed video');
  return sendVideoFile(res, match[1]);
}
