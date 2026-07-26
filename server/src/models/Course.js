import mongoose from 'mongoose';

const courseSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    description: { type: String, required: true },
    thumbnail: { type: String, required: true },
    coverImage: String,
    category: { type: String, required: true, index: true },
    instructor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    duration: { type: Number, required: true }, // total seconds
    rating: { type: Number, default: 0, min: 0, max: 5 },
    students: { type: Number, default: 0 },
    price: { type: Number, default: 0 },
    level: {
      type: String,
      enum: ['Beginner', 'Intermediate', 'Advanced', 'All levels'],
      default: 'Beginner',
    },
    published: { type: Boolean, default: false },
    lectures: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Lecture' }],
  },
  { timestamps: true },
);

courseSchema.index({ instructor: 1 });
courseSchema.index({ title: 'text', description: 'text' });

export default mongoose.model('Course', courseSchema);
