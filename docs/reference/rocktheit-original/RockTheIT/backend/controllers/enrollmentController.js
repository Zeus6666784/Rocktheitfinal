const Course = require("../models/Course");
const Enrollment = require("../models/Enrollment");

// Builds the unlock map for a course given a set of completed lecture ids.
// Rule: lecture[0] is always unlocked. lecture[i] (i>0) is unlocked only if
// lecture[i-1]._id is in completedLectureIds. This is enforced server-side
// on every action, not just trusted from the frontend.
const buildProgressView = (course, enrollment) => {
  const flat = course.getFlattenedLectures();
  const completedSet = new Set(enrollment ? enrollment.completedLectureIds : []);
  let previousCompleted = true; // first lecture always unlocked
  return flat.map((lec) => {
    const isCompleted = completedSet.has(String(lec._id));
    const isUnlocked = previousCompleted;
    previousCompleted = isCompleted; // next lecture depends on THIS one being completed
    return {
      _id: lec._id,
      title: lec.title,
      order: lec.order,
      durationSeconds: lec.durationSeconds,
      videoUrl: isUnlocked ? lec.videoUrl : null, // never leak locked video URLs
      completed: isCompleted,
      unlocked: isUnlocked,
    };
  });
};

exports.enroll = async (req, res) => {
  try {
    const course = await Course.findById(req.params.courseId);
    if (!course) return res.status(404).json({ message: "Course not found" });

    let enrollment = await Enrollment.findOne({ user: req.user._id, course: course._id });
    if (enrollment) return res.status(200).json({ message: "Already enrolled", enrollment });

    enrollment = await Enrollment.create({ user: req.user._id, course: course._id });
    return res.status(201).json({ message: "Enrolled", enrollment });
  } catch (err) {
    return res.status(500).json({ message: "Enrollment failed", error: err.message });
  }
};

exports.getProgress = async (req, res) => {
  try {
    const course = await Course.findById(req.params.courseId);
    if (!course) return res.status(404).json({ message: "Course not found" });

    const enrollment = await Enrollment.findOne({ user: req.user._id, course: course._id });
    if (!enrollment) return res.status(403).json({ message: "Not enrolled in this course" });

    const lectures = buildProgressView(course, enrollment);
    return res.json({
      courseId: course._id,
      title: course.title,
      totalLectures: lectures.length,
      completedCount: enrollment.completedLectureIds.length,
      allCompleted: enrollment.completed,
      certificateIssued: enrollment.certificateIssued,
      lastWatchedLectureId: enrollment.lastWatchedLectureId,
      maxWatchedSeconds: enrollment.maxWatchedSeconds,
      lectures,
    });
  } catch (err) {
    return res.status(500).json({ message: "Failed to fetch progress", error: err.message });
  }
};

// Called continuously (e.g. every few seconds) by the video player while
// playing. Rejects any watermark that jumps further than a small tolerance
// past what's been recorded, which blocks scrub-to-skip attempts.
exports.reportWatchTime = async (req, res) => {
  try {
    const { lectureId, currentSeconds } = req.body;
    const course = await Course.findById(req.params.courseId);
    if (!course) return res.status(404).json({ message: "Course not found" });

    const enrollment = await Enrollment.findOne({ user: req.user._id, course: course._id });
    if (!enrollment) return res.status(403).json({ message: "Not enrolled" });

    const flat = course.getFlattenedLectures();
    const lecture = flat.find((l) => String(l._id) === String(lectureId));
    if (!lecture) return res.status(404).json({ message: "Lecture not found" });

    // Confirm this lecture is actually unlocked before accepting watch time.
    const view = buildProgressView(course, enrollment);
    const target = view.find((l) => String(l._id) === String(lectureId));
    if (!target || !target.unlocked) {
      return res.status(403).json({ message: "This lecture is locked" });
    }

    const TOLERANCE_SECONDS = 5; // small buffer for buffering/rounding, not enough to skip meaningfully
    const isSameLecture = enrollment.lastWatchedLectureId === String(lectureId);
    const baseline = isSameLecture ? enrollment.maxWatchedSeconds : 0;

    if (currentSeconds > baseline + TOLERANCE_SECONDS) {
      // Client tried to jump ahead further than allowed -> reject, don't update watermark.
      return res.status(200).json({
        accepted: false,
        maxWatchedSeconds: baseline,
        message: "Skipping ahead is not allowed. Playback watermark unchanged.",
      });
    }

    enrollment.lastWatchedLectureId = String(lectureId);
    enrollment.maxWatchedSeconds = Math.max(baseline, currentSeconds);
    await enrollment.save();

    return res.json({ accepted: true, maxWatchedSeconds: enrollment.maxWatchedSeconds });
  } catch (err) {
    return res.status(500).json({ message: "Failed to report watch time", error: err.message });
  }
};

// Marks a lecture complete ONLY if:
// 1. It is currently unlocked (previous lecture already completed / it's the first lecture)
// 2. The recorded max watched time is within tolerance of the lecture's full duration
exports.completeLecture = async (req, res) => {
  try {
    const { lectureId } = req.body;
    const course = await Course.findById(req.params.courseId);
    if (!course) return res.status(404).json({ message: "Course not found" });

    const enrollment = await Enrollment.findOne({ user: req.user._id, course: course._id });
    if (!enrollment) return res.status(403).json({ message: "Not enrolled" });

    const flat = course.getFlattenedLectures();
    const lecture = flat.find((l) => String(l._id) === String(lectureId));
    if (!lecture) return res.status(404).json({ message: "Lecture not found" });

    const view = buildProgressView(course, enrollment);
    const target = view.find((l) => String(l._id) === String(lectureId));
    if (!target.unlocked) {
      return res.status(403).json({ message: "Complete previous lectures first" });
    }
    if (target.completed) {
      return res.status(200).json({ message: "Already completed" });
    }

    const COMPLETION_THRESHOLD = 0.95; // must have watched at least 95% of the video
    const watched = enrollment.lastWatchedLectureId === String(lectureId) ? enrollment.maxWatchedSeconds : 0;
    const required = lecture.durationSeconds * COMPLETION_THRESHOLD;

    if (lecture.durationSeconds > 0 && watched < required) {
      return res.status(400).json({
        message: "You must watch the full video before it can be marked complete",
        watchedSeconds: watched,
        requiredSeconds: required,
      });
    }

    enrollment.completedLectureIds.push(String(lectureId));
    // Reset the watermark so the NEXT lecture starts from zero, not inheriting this one's progress.
    enrollment.maxWatchedSeconds = 0;
    enrollment.lastWatchedLectureId = null;

    if (enrollment.completedLectureIds.length === flat.length) {
      enrollment.completed = true;
      enrollment.completedAt = new Date();
    }

    await enrollment.save();

    return res.json({
      message: "Lecture marked complete",
      allCompleted: enrollment.completed,
      progress: buildProgressView(course, enrollment),
    });
  } catch (err) {
    return res.status(500).json({ message: "Failed to complete lecture", error: err.message });
  }
};

exports.myEnrollments = async (req, res) => {
  const enrollments = await Enrollment.find({ user: req.user._id }).populate("course", "title slug thumbnail");
  return res.json(enrollments);
};
