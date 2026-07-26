const { v4: uuidv4 } = require("uuid");
const Course = require("../models/Course");
const Enrollment = require("../models/Enrollment");
const Certificate = require("../models/Certificate");
const generateCertificatePdf = require("../utils/generateCertificatePdf");

exports.claimCertificate = async (req, res) => {
  try {
    const course = await Course.findById(req.params.courseId);
    if (!course) return res.status(404).json({ message: "Course not found" });

    const enrollment = await Enrollment.findOne({ user: req.user._id, course: course._id });
    if (!enrollment) return res.status(403).json({ message: "Not enrolled" });

    // Hard gate: certificate can ONLY be claimed once every lecture is completed.
    if (!enrollment.completed) {
      return res.status(400).json({
        message: "You must complete all lectures before claiming a certificate",
        completedCount: enrollment.completedLectureIds.length,
      });
    }

    let cert = await Certificate.findOne({ user: req.user._id, course: course._id });
    if (cert) return res.json({ message: "Certificate already issued", certificate: cert });

    const certificateId = uuidv4();
    const fileUrl = await generateCertificatePdf({
      certificateId,
      studentName: req.user.name,
      courseTitle: course.title,
      issuedAt: new Date(),
    });

    cert = await Certificate.create({
      user: req.user._id,
      course: course._id,
      certificateId,
      fileUrl,
    });

    enrollment.certificateIssued = true;
    await enrollment.save();

    return res.status(201).json({ message: "Certificate issued", certificate: cert });
  } catch (err) {
    return res.status(500).json({ message: "Failed to issue certificate", error: err.message });
  }
};

exports.myCertificates = async (req, res) => {
  const certs = await Certificate.find({ user: req.user._id }).populate("course", "title slug");
  return res.json(certs);
};

exports.verifyCertificate = async (req, res) => {
  const cert = await Certificate.findOne({ certificateId: req.params.certificateId })
    .populate("user", "name")
    .populate("course", "title");
  if (!cert) return res.status(404).json({ message: "Certificate not found" });
  return res.json(cert);
};
