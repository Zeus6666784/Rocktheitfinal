import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: { type: String, required: true, select: false },
    avatar: String,
    role: {
      type: String,
      enum: ['student', 'instructor', 'admin'],
      default: 'student',
    },
    enrolledCourses: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Course' }],
    completedCourses: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Course' }],
  },
  { timestamps: true },
);

userSchema.index({ enrolledCourses: 1 });
userSchema.index({ completedCourses: 1 });

export default mongoose.model('User', userSchema);
