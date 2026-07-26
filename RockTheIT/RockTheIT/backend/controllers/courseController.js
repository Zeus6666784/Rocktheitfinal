const Course = require("../models/Course");
const slugify = (str) =>
  str.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, "");

// Assigns sequential global "order" to lectures across all sections so
// the LMS unlock logic has a single, unambiguous sequence to follow.
const applyGlobalOrder = (sections) => {
  let counter = 0;
  return sections.map((section) => ({
    ...section,
    lectures: section.lectures.map((lec) => ({ ...lec, order: counter++ })),
  }));
};

exports.createCourse = async (req, res) => {
  try {
    const { title, description, thumbnail, price, category, sections } = req.body;
    if (!title || !description || !sections || !sections.length) {
      return res.status(400).json({ message: "Title, description and at least one section are required" });
    }
    const slug = slugify(title) + "-" + Date.now().toString(36);
    const course = await Course.create({
      title,
      slug,
      description,
      thumbnail,
      price: price || 0,
      category,
      instructor: req.user._id,
      sections: applyGlobalOrder(sections),
    });
    return res.status(201).json(course);
  } catch (err) {
    return res.status(500).json({ message: "Failed to create course", error: err.message });
  }
};

exports.updateCourse = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) return res.status(404).json({ message: "Course not found" });
    if (String(course.instructor) !== String(req.user._id) && req.user.role !== "admin") {
      return res.status(403).json({ message: "Not your course" });
    }
    const { title, description, thumbnail, price, category, sections, published } = req.body;
    if (title) course.title = title;
    if (description) course.description = description;
    if (thumbnail !== undefined) course.thumbnail = thumbnail;
    if (price !== undefined) course.price = price;
    if (category) course.category = category;
    if (sections) course.sections = applyGlobalOrder(sections);
    if (published !== undefined) course.published = published;
    await course.save();
    return res.json(course);
  } catch (err) {
    return res.status(500).json({ message: "Failed to update course", error: err.message });
  }
};

exports.listCourses = async (req, res) => {
  try {
    const { category, search } = req.query;
    const filter = { published: true };
    if (category) filter.category = category;
    if (search) filter.title = { $regex: search, $options: "i" };
    const courses = await Course.find(filter)
      .populate("instructor", "name")
      .select("-sections.lectures.videoUrl") // hide raw video links from catalog listing
      .sort({ createdAt: -1 });
    return res.json(courses);
  } catch (err) {
    return res.status(500).json({ message: "Failed to list courses", error: err.message });
  }
};

exports.getCourseBySlug = async (req, res) => {
  try {
    const course = await Course.findOne({ slug: req.params.slug }).populate("instructor", "name email");
    if (!course) return res.status(404).json({ message: "Course not found" });
    return res.json(course);
  } catch (err) {
    return res.status(500).json({ message: "Failed to fetch course", error: err.message });
  }
};

exports.myInstructorCourses = async (req, res) => {
  const courses = await Course.find({ instructor: req.user._id }).sort({ createdAt: -1 });
  return res.json(courses);
};
