const express = require("express");
const router = express.Router();
const {
  createCourse,
  updateCourse,
  listCourses,
  getCourseBySlug,
  myInstructorCourses,
} = require("../controllers/courseController");
const { protect, requireRole } = require("../middleware/auth");

router.get("/", listCourses);
router.get("/mine", protect, requireRole("instructor", "admin"), myInstructorCourses);
router.get("/:slug", getCourseBySlug);
router.post("/", protect, requireRole("instructor", "admin"), createCourse);
router.put("/:id", protect, requireRole("instructor", "admin"), updateCourse);

module.exports = router;
