import { ok } from '../utils/response.js';
import * as lectureService from '../services/lectureService.js';
import * as courseService from '../services/courseService.js';
import { fail } from '../utils/response.js';

export async function detail(req, res) {
  const { id: lectureId } = req.params;
  const userId = req.user.id;

  // Fetch the lecture first to know its courseId, then check enrollment.
  // (lectureService.getLectureForUser uses courseService.getLectureLockState which needs userId.)
  const data = await lectureService.getLectureForUser({ userId, lectureId });

  // ponytail: enrollment gate at the trust boundary; locked is a separate signal.
  const enrolled = await courseService.userIsEnrolled({ userId, courseId: data.courseId });
  if (!enrolled) return fail(res, 403, 'FORBIDDEN', 'Enroll in the course to access lectures');
  if (data.locked) return fail(res, 403, 'FORBIDDEN', 'Previous lecture not completed');
  return ok(res, data);
}