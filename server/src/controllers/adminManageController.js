import { ok, fail } from '../utils/response.js';
import Course from '../models/Course.js';
import Lecture from '../models/Lecture.js';
import User from '../models/User.js';
import Progress from '../models/Progress.js';
import Category from '../models/Category.js';
import { requireFields } from '../middleware/validate.js';

export async function listCourses(_req, res) {
  const items = await Course.find().populate('instructor', 'name email').sort({ createdAt: -1 });
  return ok(res, items.map(c => ({ id: String(c._id), title: c.title, slug: c.slug, description: c.description, thumbnail: c.thumbnail, category: c.category, duration: c.duration, published: c.published, students: c.students, instructor: c.instructor ? { id: String(c.instructor._id), name: c.instructor.name } : null, lectures: (c.lectures||[]).length })));
}
export async function createCourse(req, res) {
  requireFields(req.body || {}, ['title', 'slug', 'description', 'thumbnail', 'category', 'duration', 'instructorId']);
  const { title, slug, description, thumbnail, category, duration, level, price, published, instructorId } = req.body;
  const instructor = await User.findById(instructorId).select('role disabled');
  if (!instructor || instructor.disabled || instructor.role !== 'instructor') return fail(res, 400, 'BAD_REQUEST', 'instructorId must reference an active instructor');
  const c = await Course.create({ title, slug: String(slug).toLowerCase().trim(), description, thumbnail, category, duration: Number(duration), level, price: Number(price||0), published: Boolean(published), instructor: instructor._id });
  await Category.updateOne({ name: category.trim() }, { $setOnInsert: { name: category.trim() } }, { upsert: true });
  return ok(res, { id: String(c._id) }, 201);
}
export async function updateCourse(req, res) {
  const { instructorId, title, slug, description, thumbnail, category, duration, level, price, published } = req.body || {};
  const update = {};
  for (const [key, value] of Object.entries({ title, slug, description, thumbnail, category, duration, level, price, published })) {
    if (value !== undefined) update[key] = value;
  }
  if (instructorId !== undefined) update.instructor = instructorId;
  if (instructorId !== undefined) {
    const instructor = await User.findById(instructorId).select('role disabled');
    if (!instructor || instructor.disabled || instructor.role !== 'instructor') return fail(res, 400, 'BAD_REQUEST', 'instructorId must reference an active instructor');
  }
  const c = await Course.findByIdAndUpdate(req.params.id, { $set: update }, { new: true, runValidators: true });
  if (!c) return fail(res, 404, 'NOT_FOUND', 'Course not found');
  if (update.category) await Category.updateOne({ name: String(update.category).trim() }, { $setOnInsert: { name: String(update.category).trim() } }, { upsert: true });
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
  if (req.params.id === req.user.id && (role !== undefined || disabled !== undefined)) {
    return fail(res, 400, 'BAD_REQUEST', 'Cannot change your own role or account status');
  }
  if (role !== undefined && !['student', 'instructor', 'admin'].includes(role)) {
    return fail(res, 400, 'BAD_REQUEST', 'Invalid role');
  }
  const update = {};
  if (role) update.role = role;
  if (typeof disabled === 'boolean') update.disabled = disabled;
  if (!Object.keys(update).length) return fail(res, 400, 'BAD_REQUEST', 'No permitted fields provided');
  const u = await User.findByIdAndUpdate(req.params.id, { $set: update }, { new: true, runValidators: true }).select('-password');
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
  const [categories, counts] = await Promise.all([
    Category.find().sort({ name: 1 }),
    Course.aggregate([{ $group: { _id: '$category', count: { $sum: 1 } } }]),
  ]);
  const courseCounts = new Map(counts.map((item) => [item._id, item.count]));
  const names = new Set([...categories.map((category) => category.name), ...courseCounts.keys()]);
  return ok(res, [...names].sort().map((name) => ({ name, courses: courseCounts.get(name) || 0 })));
}

export async function createCategory(req, res) {
  const name = String(req.body?.name || '').trim();
  if (!name) return fail(res, 400, 'BAD_REQUEST', 'name required');
  const category = await Category.create({ name });
  return ok(res, { id: String(category._id), name: category.name }, 201);
}

export async function deleteCategory(req, res) {
  const name = decodeURIComponent(req.params.name || '').trim();
  const usedByCourses = await Course.exists({ category: name });
  if (usedByCourses) return fail(res, 409, 'CONFLICT', 'Cannot delete a category assigned to courses');
  const category = await Category.findOneAndDelete({ name });
  if (!category) return fail(res, 404, 'NOT_FOUND', 'Category not found');
  return ok(res, { deleted: true });
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

export async function deleteEnrollment(req, res) {
  const { userId, courseId } = req.params;
  const user = await User.findOneAndUpdate({ _id: userId, enrolledCourses: courseId }, { $pull: { enrolledCourses: courseId, completedCourses: courseId } }, { new: true });
  if (!user) return fail(res, 404, 'NOT_FOUND', 'User not found');
  await Progress.deleteOne({ userId, courseId });
  await Course.updateOne({ _id: courseId, students: { $gt: 0 } }, { $inc: { students: -1 } });
  return ok(res, { deleted: true });
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
