const express = require("express");
const router = express.Router();
const {
  enroll,
  getProgress,
  reportWatchTime,
  completeLecture,
  myEnrollments,
} = require("../controllers/enrollmentController");
const { protect } = require("../middleware/auth");

router.get("/mine", protect, myEnrollments);
router.post("/:courseId/enroll", protect, enroll);
router.get("/:courseId/progress", protect, getProgress);
router.post("/:courseId/watch-time", protect, reportWatchTime);
router.post("/:courseId/complete-lecture", protect, completeLecture);

module.exports = router;
