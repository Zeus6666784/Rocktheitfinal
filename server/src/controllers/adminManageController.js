import { ok, fail } from '../utils/response.js';
import Course from '../models/Course.js';
import Lecture from '../models/Lecture.js';
import User from '../models/User.js';
import Progress from '../models/Progress.js';
import { requireFields } from '../middleware/validate.js';

export async function listCourses(_req, res) {
  const items = await Course.find().populate('instructor', 'name email').sort({ createdAt: -1 });
  return ok(res, items.map(c => ({ id: String(c._id), title: c.title, slug: c.slug, category: c.category, published: c.published, students: c.students, instructor: c.instructor ? { id: String(c.instructor._id), name: c.instructor.name } : null, lectures: (c.lectures||[]).length })));
}
export async function createCourse(req, res) {
  requireFields(req.body || {}, ['title', 'slug', 'description', 'thumbnail', 'category', 'duration']);
  const { title, slug, description, thumbnail, category, duration, level, price, published, instructorId } = req.body;
  const instructor = instructorId || req.user.id;
  const c = await Course.create({ title, slug: String(slug).toLowerCase().trim(), description, thumbnail, category, duration: Number(duration), level, price: Number(price||0), published: Boolean(published), instructor });
  return ok(res, { id: String(c._id) }, 201);
}
export async function updateCourse(req, res) {
  const c = await Course.findByIdAndUpdate(req.params.id, { $set: req.body }, { new: true });
  if (!c) return fail(res, 404, 'NOT_FOUND', 'Course not found');
  return ok(res, { id: String(c._id) });
}
export async function deleteCourse(req, res) {
  const c = await Course.findByIdAndDelete(req.params.id);
  if (!c) return fail(res, 404, 'NOT_FOUND', 'Course not found');
  await Lecture.deleteMany({ courseId: c._id });
  return ok(res, { deleted: true });
}
export async function listLectures(req, res) {
  const filter = req.query.courseId ? { courseId: req.query.courseId } : {};
  const items = await Lecture.find(filter).sort({ order: 1 });
  return ok(res, items.map(l => ({ id: String(l._id), courseId: String(l.courseId), title: l.title, duration: l.duration, order: l.order, videoUrl: l.videoUrl, locked: l.locked })));
}
export async function createLecture(req, res) {
  requireFields(req.body || {}, ['courseId', 'title', 'videoUrl', 'duration', 'order']);
  const { courseId, title, videoUrl, duration, order, locked } = req.body;
  const l = await Lecture.create({ courseId, title, videoUrl, duration: Number(duration), order: Number(order), locked: Boolean(locked) });
  await Course.findByIdAndUpdate(courseId, { $addToSet: { lectures: l._id } });
  return ok(res, { id: String(l._id) }, 201);
}
export async function updateLecture(req, res) {
  const l = await Lecture.findByIdAndUpdate(req.params.id, { $set: req.body }, { new: true });
  if (!l) return fail(res, 404, 'NOT_FOUND', 'Lecture not found');
  return ok(res, { id: String(l._id) });
}
export async function deleteLecture(req, res) {
  const l = await Lecture.findByIdAndDelete(req.params.id);
  if (!l) return fail(res, 404, 'NOT_FOUND', 'Lecture not found');
  await Course.findByIdAndUpdate(l.courseId, { $pull: { lectures: l._id } });
  return ok(res, { deleted: true });
}
export async function listUsers(_req, res) {
  const items = await User.find().select('-password').sort({ createdAt: -1 });
  return ok(res, items.map(u => ({ id: String(u._id), name: u.name, email: u.email, role: u.role, disabled: u.disabled, enrolled: (u.enrolledCourses||[]).length, createdAt: u.createdAt })));
}
export async function updateUser(req, res) {
  const { role, disabled } = req.body || {};
  const update = {};
  if (role) update.role = role;
  if (typeof disabled === 'boolean') update.disabled = disabled;
  const u = await User.findByIdAndUpdate(req.params.id, { $set: update }, { new: true }).select('-password');
  if (!u) return fail(res, 404, 'NOT_FOUND', 'User not found');
  return ok(res, { id: String(u._id), role: u.role, disabled: u.disabled });
}
export async function deleteUser(req, res) {
  if (req.params.id === req.user.id) return fail(res, 400, 'BAD_REQUEST', 'Cannot delete self');
  const u = await User.findByIdAndDelete(req.params.id);
  if (!u) return fail(res, 404, 'NOT_FOUND', 'User not found');
  await Progress.deleteMany({ userId: u._id });
  return ok(res, { deleted: true });
}
export async function stats(_req, res) {
  const [users, courses, lectures, progress, students, instructors, admins] = await Promise.all([
    User.countDocuments(),
    Course.countDocuments(),
    Lecture.countDocuments(),
    Progress.countDocuments(),
    User.countDocuments({ role: 'student' }),
    User.countDocuments({ role: 'instructor' }),
    User.countDocuments({ role: 'admin' }),
  ]);
  const publishedCourses = await Course.countDocuments({ published: true });
  const enrollments = await User.aggregate([{ $project: { n: { $size: '$enrolledCourses' } } }, { $group: { _id: null, total: { $sum: '$n' } } }]);
  return ok(res, { users, courses, lectures, progress, students, instructors, admins, publishedCourses, enrollments: enrollments[0]?.total || 0 });
}

export async function listCategories(_req, res) {
  const agg = await Course.aggregate([{ $group: { _id: '$category', count: { $sum: 1 } } }, { $sort: { _id: 1 } }]);
  return ok(res, agg.map(a => ({ name: a._id, courses: a.count })));
}

export async function createCategory(req, res) {
  // categories are derived from courses; "create" just validates name presence
  const { name } = req.body || {};
  if (!name) return fail(res, 400, 'BAD_REQUEST', 'name required');
  return ok(res, { name, created: true });
}

export async function listInstructors(_req, res) {
  const items = await User.find({ role: 'instructor' }).select('-password').sort({ createdAt: -1 });
  return ok(res, items.map(u => ({ id: String(u._id), name: u.name, email: u.email, disabled: u.disabled, createdAt: u.createdAt })));
}

export async function listEnrollments(_req, res) {
  const users = await User.find().select('name email enrolledCourses').populate('enrolledCourses', 'title');
  const out = [];
  for (const u of users) {
    for (const c of u.enrolledCourses || []) {
      out.push({ userId: String(u._id), userName: u.name, userEmail: u.email, courseId: String(c._id), courseTitle: c.title });
    }
  }
  return ok(res, out);
}

export async function analytics(_req, res) {
  const topCourses = await Course.find().sort({ students: -1 }).limit(5).select('title students rating');
  const progressAgg = await Progress.aggregate([{ $group: { _id: null, avgWatch: { $avg: '$watchPercentage' }, completed: { $sum: { $cond: ['$completed', 1, 0] } } } }]);
  const certEligible = await Progress.countDocuments({ watchPercentage: { $gte: 90 } });
  return ok(res, {
    topCourses: topCourses.map(c => ({ title: c.title, students: c.students, rating: c.rating })),
    avgWatchPercentage: Math.round(progressAgg[0]?.avgWatch || 0),
    completedProgressRows: progressAgg[0]?.completed || 0,
    certificateEligible: certEligible,
  });
}

export async function settings(_req, res) {
  return ok(res, {
    nodeEnv: process.env.NODE_ENV || 'development',
    corsOrigins: process.env.CORS_ORIGINS || '',
    jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
    maxFileSizeMB: 500,
  });
}