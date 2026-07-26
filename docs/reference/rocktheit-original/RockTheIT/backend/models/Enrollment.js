const mongoose = require("mongoose");

// Tracks a single student's progress through a single course.
const enrollmentSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    course: { type: mongoose.Schema.Types.ObjectId, ref: "Course", required: true },
    completedLectureIds: [{ type: String }], // stores lecture _id strings, in completion order
    lastWatchedLectureId: { type: String, default: null },
    maxWatchedSeconds: { type: Number, default: 0 }, // anti-skip watermark for current lecture
    completed: { type: Boolean, default: false },
    completedAt: { type: Date, default: null },
    certificateIssued: { type: Boolean, default: false },
  },
  { timestamps: true }
);

enrollmentSchema.index({ user: 1, course: 1 }, { unique: true });

module.exports = mongoose.model("Enrollment", enrollmentSchema);
