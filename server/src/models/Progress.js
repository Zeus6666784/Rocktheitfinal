import mongoose from 'mongoose';

const lectureProgressSchema = new mongoose.Schema(
  {
    watchPercentage: { type: Number, default: 0, min: 0, max: 100 },
    completed: { type: Boolean, default: false },
    updatedAt: { type: Date, default: Date.now },
  },
  { _id: false },
);

const progressSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    courseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
    completedLectures: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Lecture' }],
    watchPercentage: { type: Number, default: 0, min: 0, max: 100 },
    certificateGenerated: { type: Boolean, default: false },
    lastWatchedLecture: { type: mongoose.Schema.Types.ObjectId, ref: 'Lecture' },
    lastWatchedAt: { type: Date, default: Date.now },
    lectures: { type: Map, of: lectureProgressSchema, default: {} },
  },
  { timestamps: true },
);

progressSchema.index({ userId: 1, courseId: 1 }, { unique: true });

export default mongoose.model('Progress', progressSchema);
