// Lecture detail for playback. Enforces enrollment + lock state from courseService.
import mongoose from 'mongoose';
import Lecture from '../models/Lecture.js';
import { getLectureLockState } from './courseService.js';

export async function getLectureForUser({ userId, lectureId }) {
  if (!mongoose.Types.ObjectId.isValid(lectureId)) {
    const err = new Error('Lecture not found');
    err.status = 404;
    err.code = 'NOT_FOUND';
    throw err;
  }
  const { lecture, locked } = await getLectureLockState({ userId, lectureId });

  // Find next lecture in same course by order.
  const next = await Lecture.findOne({ courseId: lecture.courseId, order: lecture.order + 1 }).select('_id');

  return {
    id: String(lecture._id),
    courseId: String(lecture.courseId),
    title: lecture.title,
    videoUrl: lecture.videoUrl,
    duration: lecture.duration,
    resources: (lecture.resources || []).map((r) => ({
      id: String(r._id),
      title: r.title,
      fileUrl: r.fileUrl,
      type: r.type,
    })),
    order: lecture.order,
    nextLectureId: next ? String(next._id) : null,
    locked,
  };
}