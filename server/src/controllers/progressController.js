import { ok, fail } from '../utils/response.js';
import * as progressService from '../services/progressService.js';
import { intInRange, requireFields } from '../middleware/validate.js';

export async function upsert(req, res) {
  requireFields(req.body || {}, ['courseId', 'lectureId', 'watchPercentage']);
  const { courseId, lectureId, completed } = req.body;
  const watchPercentage = intInRange(req.body.watchPercentage, 0, 100, 'watchPercentage');
  if (completed === true && watchPercentage < 90) {
    return fail(res, 400, 'BAD_REQUEST', 'completed is only allowed when watchPercentage >= 90');
  }
  const data = await progressService.upsertProgress({
    userId: req.user.id,
    courseId,
    lectureId,
    watchPercentage,
    completed,
  });
  return ok(res, data);
}

export async function detail(req, res) {
  const data = await progressService.getProgress({
    userId: req.user.id,
    courseId: req.params.courseId,
  });
  return ok(res, data);
}