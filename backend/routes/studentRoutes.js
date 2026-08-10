const express = require("express");
const router = express.Router();
const studentController = require("../controller/studentController");
const { protect } = require("../middleware/authMiddleware");

router.get("/dashboard", protect, studentController.getStudentDashboard);
router.post("/enroll", protect, studentController.enrollCourse);
router.post("/complete", protect, studentController.toggleCompleteCourse);
router.post("/unenroll", protect, studentController.unenrollCourse);

module.exports = router;
