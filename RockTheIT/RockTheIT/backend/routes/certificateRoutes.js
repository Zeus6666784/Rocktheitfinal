const express = require("express");
const router = express.Router();
const {
  claimCertificate,
  myCertificates,
  verifyCertificate,
} = require("../controllers/certificateController");
const { protect } = require("../middleware/auth");

router.get("/mine", protect, myCertificates);
router.get("/verify/:certificateId", verifyCertificate);
router.post("/:courseId/claim", protect, claimCertificate);

module.exports = router;
