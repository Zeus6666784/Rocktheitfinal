// Progress upsert + read. Recomputes watchPercentage across all lectures as an average.
// plan §17: lectures[lectureId].watchPercentage = max(current, new);
//           mark completed when pct >= 90 || completed === true;
//           add to completedLectures.
import mongoose from 'mongoose';
import Progress from '../models/Progress.js';
import Lecture from '../models/Lecture.js';
import Course from '../models/Course.js';

export async function upsertProgress({ userId, courseId, lectureId, watchPercentage, completed }) {
  if (!mongoose.Types.ObjectId.isValid(courseId) || !mongoose.Types.ObjectId.isValid(lectureId)) {
    const err = new Error('Invalid id');
    err.status = 400;
    err.code = 'BAD_REQUEST';
    throw err;
  }

  // Ensure the lecture belongs to the course.
  const lecture = await Lecture.findById(lectureId).select('courseId order');
  if (!lecture || String(lecture.courseId) !== String(courseId)) {
    const err = new Error('Lecture does not belong to course');
    err.status = 400;
    err.code = 'BAD_REQUEST';
    throw err;
  }

  const pct = Math.max(0, Math.min(100, Math.floor(watchPercentage)));
  const explicit = completed === true;
  const isCompleted = explicit || pct >= 90;

  const lecKey = String(lectureId);
  const setOnInsert = { userId, courseId };
  const now = new Date();

  // Read existing per-lecture entry to compute max().
  const existing = await Progress.findOne({ userId, courseId }).select('lectures');
  const prev = existing?.lectures?.get(lecKey);
  const prevPct = prev?.watchPercentage || 0;
  const newPct = Math.max(prevPct, pct);
  const newCompleted = (prev?.completed || false) || isCompleted;

  const update = {
    $set: {
      [`lectures.${lecKey}`]: { watchPercentage: newPct, completed: newCompleted, updatedAt: now },
      lastWatchedLecture: lectureId,
      lastWatchedAt: now,
    },
    $setOnInsert: setOnInsert,
  };

  if (newCompleted) {
    update.$addToSet = { completedLectures: lectureId };
  }

  const doc = await Progress.findOneAndUpdate({ userId, courseId }, update, {
    upsert: true,
    new: true,
    setDefaultsOnInsert: true,
  });

  // Recompute overall watchPercentage as the average across all lectures in the course.
  const allLectures = await Lecture.find({ courseId }).select('_id').lean();
  const total = allLectures.length;
  if (total > 0) {
    let sum = 0;
    for (const l of allLectures) {
      const key = String(l._id);
      const entry = doc.lectures?.get(key);
      sum += entry?.watchPercentage || 0;
    }
    const overall = Math.round(sum / total);
    doc.watchPercentage = overall;
    await doc.save();
  }

  // If user hit 100% overall and isn't yet marked completed, push to completedCourses.
  if (doc.watchPercentage >= 90) {
    await mongoose.model('User').updateOne(
      { _id: userId },
      { $addToSet: { completedCourses: courseId, enrolledCourses: courseId } },
    );
  }

  return {
    courseId: String(doc.courseId),
    completedLectures: (doc.completedLectures || []).map(String),
    totalLectures: total,
    watchPercentage: doc.watchPercentage,
    certificateEligible: doc.watchPercentage >= 90,
  };
}

export async function getProgress({ userId, courseId }) {
  const doc = await Progress.findOne({ userId, courseId });
  const total = await Lecture.countDocuments({ courseId });
  if (!doc) {
    return {
      courseId: String(courseId),
      completedLectures: [],
      totalLectures: total,
      watchPercentage: 0,
      certificateGenerated: false,
    };
  }
  return {
    courseId: String(doc.courseId),
    completedLectures: (doc.completedLectures || []).map(String),
    totalLectures: total,
    watchPercentage: doc.watchPercentage,
    certificateGenerated: doc.certificateGenerated,
  };
}