// Certificate read. Server is authoritative: 403 unless watchPercentage >= 90.
// The actual PDF render happens client-side (jspdf) per the plan; this endpoint
// hands the client the certificate metadata + a stable downloadUrl.
import mongoose from 'mongoose';
import Course from '../models/Course.js';
import Progress from '../models/Progress.js';
import User from '../models/User.js';

function makeCertificateNumber(userId, courseId) {
  return `LF-${String(userId).slice(-6).toUpperCase()}-${String(courseId).slice(-6).toUpperCase()}`;
}

export async function getCertificate({ userId, courseId }) {
  if (!mongoose.Types.ObjectId.isValid(courseId)) {
    const err = new Error('Course not found');
    err.status = 404;
    err.code = 'NOT_FOUND';
    throw err;
  }
  const [progress, course, user] = await Promise.all([
    Progress.findOne({ userId, courseId }),
    Course.findById(courseId).select('title'),
    User.findById(userId).select('name'),
  ]);
  if (!course) {
    const err = new Error('Course not found');
    err.status = 404;
    err.code = 'NOT_FOUND';
    throw err;
  }
  if (!progress || progress.watchPercentage < 90) {
    const err = new Error('Course not completed');
    err.status = 403;
    err.code = 'FORBIDDEN';
    throw err;
  }

  const completedDate = (progress.lastWatchedAt || progress.updatedAt || new Date()).toISOString();
  const certificateNumber = makeCertificateNumber(userId, courseId);
  const downloadUrl = `/api/certificate/${courseId}/download`; // client uses jspdf; download is a stub

  // Mark generated.
  if (!progress.certificateGenerated) {
    progress.certificateGenerated = true;
    await progress.save();
  }

  return {
    id: String(progress._id),
    courseId: String(courseId),
    courseName: course.title,
    userName: user?.name || 'Learner',
    completedDate,
    downloadUrl,
    certificateNumber,
  };
}