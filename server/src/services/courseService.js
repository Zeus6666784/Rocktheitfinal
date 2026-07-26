// Course listing + detail. Slug or _id acceptable for /:id (catalog uses slug).
import mongoose from 'mongoose';
import Course from '../models/Course.js';
import Lecture from '../models/Lecture.js';
import User from '../models/User.js';
import Progress from '../models/Progress.js';

const isObjectId = (s) => mongoose.Types.ObjectId.isValid(s) && String(new mongoose.Types.ObjectId(s)) === s;

function buildListFilter({ q, category }) {
  const filter = { published: true };
  if (category) filter.category = category;
  if (q) filter.$text = { $search: q };
  return filter;
}

function sortFor(sort) {
  switch (sort) {
    case 'rating':
      return { rating: -1 };
    case 'popular':
      return { students: -1 };
    case 'new':
    default:
      return { createdAt: -1 };
  }
}

export async function listCourses({ q, category, page = 1, limit = 12, sort = 'new', userId }) {
  const filter = buildListFilter({ q, category });
  const safeLimit = Math.min(Math.max(parseInt(limit, 10) || 12, 1), 50);
  const safePage = Math.max(parseInt(page, 10) || 1, 1);
  const cursor = Course.find(filter)
    .sort(sortFor(sort))
    .skip((safePage - 1) * safeLimit)
    .limit(safeLimit)
    .populate('instructor', 'name avatar')
    .populate('lectures', 'order');

  const [items, total] = await Promise.all([cursor, Course.countDocuments(filter)]);

  // Determine enrollment per item for current user.
  let enrolledSet = new Set();
  if (userId) {
    const u = await User.findById(userId).select('enrolledCourses');
    enrolledSet = new Set((u?.enrolledCourses || []).map((id) => String(id)));
  }

  const shaped = items.map((c) => ({
    id: String(c._id),
    title: c.title,
    slug: c.slug,
    description: c.description,
    thumbnail: c.thumbnail,
    category: c.category,
    instructor: c.instructor
      ? { id: String(c.instructor._id), name: c.instructor.name, avatar: c.instructor.avatar }
      : null,
    duration: c.duration,
    rating: c.rating,
    students: c.students,
    lectures: (c.lectures || []).length,
    enrolled: enrolledSet.has(String(c._id)),
  }));

  return { items: shaped, page: safePage, limit: safeLimit, total };
}

export async function getCourse(idOrSlug, { userId } = {}) {
  const query = isObjectId(idOrSlug) ? { _id: idOrSlug } : { slug: idOrSlug };
  const course = await Course.findOne(query)
    .populate('instructor', 'name avatar bio')
    .populate({ path: 'lectures', options: { sort: { order: 1 } } });
  if (!course) {
    const err = new Error('Course not found');
    err.status = 404;
    err.code = 'NOT_FOUND';
    throw err;
  }

  let enrolled = false;
  let progressPct = 0;
  let completedIds = new Set();
  if (userId) {
    const u = await User.findById(userId).select('enrolledCourses');
    enrolled = (u?.enrolledCourses || []).some((id) => String(id) === String(course._id));
    const p = await Progress.findOne({ userId, courseId: course._id });
    if (p) {
      progressPct = p.watchPercentage;
      completedIds = new Set((p.completedLectures || []).map((id) => String(id)));
    }
  }

  const lectures = (course.lectures || []).map((lec) => {
    const prev = (course.lectures || []).find((l) => l.order === lec.order - 1);
    const locked = lec.order > 1 && (!prev || !completedIds.has(String(prev._id)));
    return {
      id: String(lec._id),
      title: lec.title,
      // ponytail: demo exposes videoUrl here so the unauthenticated
      // Learning page can play without the auth-gated lecture endpoint.
      // Auth builds the contract-faithful call to /api/lectures/:id.
      videoUrl: lec.videoUrl,
      duration: lec.duration,
      order: lec.order,
      locked,
    };
  });

  return {
    id: String(course._id),
    slug: course.slug,
    title: course.title,
    description: course.description,
    thumbnail: course.thumbnail,
    coverImage: course.coverImage,
    category: course.category,
    instructor: course.instructor
      ? { id: String(course.instructor._id), name: course.instructor.name, avatar: course.instructor.avatar }
      : null,
    duration: course.duration,
    rating: course.rating,
    students: course.students,
    lectures,
    enrolled,
    progress: progressPct,
    level: course.level,
  };
}

export async function enroll(courseId, userId) {
  const course = await Course.findById(courseId);
  if (!course) {
    const err = new Error('Course not found');
    err.status = 404;
    err.code = 'NOT_FOUND';
    throw err;
  }
  await User.findByIdAndUpdate(userId, {
    $addToSet: { enrolledCourses: course._id },
  });
  // ponytail: skip the students counter update on every enroll — already inflated in seed;
  // add a $inc when enrollment counts become a real metric.
  return { enrolled: true, courseId: String(course._id) };
}

// Used by lecture service.
export async function userIsEnrolled({ userId, courseId }) {
  const u = await User.findById(userId).select('enrolledCourses');
  return (u?.enrolledCourses || []).some((id) => String(id) === String(courseId));
}

// Used by lecture service.
export async function getLectureLockState({ userId, lectureId }) {
  const lec = await Lecture.findById(lectureId);
  if (!lec) {
    const err = new Error('Lecture not found');
    err.status = 404;
    err.code = 'NOT_FOUND';
    throw err;
  }
  if (lec.order <= 1) return { lecture: lec, locked: false };
  const prev = await Lecture.findOne({ courseId: lec.courseId, order: lec.order - 1 });
  if (!prev) return { lecture: lec, locked: false };
  const p = await Progress.findOne({ userId, courseId: lec.courseId }).select('completedLectures');
  const completed = (p?.completedLectures || []).some((id) => String(id) === String(prev._id));
  return { lecture: lec, locked: !completed };
}