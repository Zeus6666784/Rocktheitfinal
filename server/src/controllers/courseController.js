import { ok, fail } from '../utils/response.js';
import * as courseService from '../services/courseService.js';
import { requireAuth } from '../middleware/auth.js';

export async function list(req, res) {
  const userId = req.user?.id;
  const data = await courseService.listCourses({ ...req.query, userId });
  return ok(res, data);
}

export async function detail(req, res) {
  const data = await courseService.getCourse(req.params.id, { userId: req.user?.id });
  return ok(res, data);
}

export async function enroll(req, res) {
  // req.user is set by requireAuth middleware mounted at the route level.
  const result = await courseService.enroll(req.params.id, req.user.id);
  return ok(res, result);
}

// Re-export so route files only need one import path.
export const middleware = { requireAuth };