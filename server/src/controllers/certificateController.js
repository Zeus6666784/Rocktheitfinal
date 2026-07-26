import { ok } from '../utils/response.js';
import * as certificateService from '../services/certificateService.js';

export async function detail(req, res) {
  const data = await certificateService.getCertificate({
    userId: req.user.id,
    courseId: req.params.courseId,
  });
  return ok(res, data);
}