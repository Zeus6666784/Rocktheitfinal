import mongoose from 'mongoose';

const resourceSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    fileUrl: { type: String, required: true },
    type: { type: String, enum: ['pdf', 'zip', 'doc', 'ppt'], required: true },
  },
  { _id: true },
);

const lectureSchema = new mongoose.Schema(
  {
    courseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
    title: { type: String, required: true },
    videoUrl: { type: String, required: true },
    duration: { type: Number, required: true }, // seconds
    order: { type: Number, required: true },
    resources: [resourceSchema],
    locked: { type: Boolean, default: false },
  },
  { timestamps: true },
);

lectureSchema.index({ courseId: 1 });
lectureSchema.index({ courseId: 1, order: 1 });

export default mongoose.model('Lecture', lectureSchema);
