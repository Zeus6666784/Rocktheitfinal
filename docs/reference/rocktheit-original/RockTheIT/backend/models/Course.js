const mongoose = require("mongoose");

const lectureSchema = new mongoose.Schema({
  title: { type: String, required: true },
  videoUrl: { type: String, required: true }, // hosted file URL / S3 / cloudinary link
  durationSeconds: { type: Number, default: 0 },
  order: { type: Number, required: true }, // global order within the course (0-based)
});

const sectionSchema = new mongoose.Schema({
  title: { type: String, required: true },
  lectures: [lectureSchema],
});

const courseSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    description: { type: String, required: true },
    thumbnail: { type: String, default: "" },
    price: { type: Number, default: 0 },
    category: { type: String, default: "General" },
    instructor: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    sections: [sectionSchema],
    published: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// Virtual: total number of lectures across all sections (used for LMS unlock logic)
courseSchema.methods.getFlattenedLectures = function () {
  const all = [];
  this.sections.forEach((section) => {
    section.lectures.forEach((lec) => all.push(lec));
  });
  return all.sort((a, b) => a.order - b.order);
};

module.exports = mongoose.model("Course", courseSchema);
