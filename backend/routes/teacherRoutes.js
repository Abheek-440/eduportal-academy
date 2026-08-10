const express = require("express");
const router = express.Router();
const teacherController = require("../controller/teacherController");
const { protect, allowRoles } = require("../middleware/authMiddleware");

router.get("/dashboard", protect, allowRoles("instructor", "admin", "teacher"), teacherController.getTeacherDashboard);
router.post("/approve-certificate", protect, allowRoles("instructor", "admin", "teacher"), teacherController.approveCertificate);
router.post("/revoke-certificate", protect, allowRoles("instructor", "admin", "teacher"), teacherController.revokeCertificate);

module.exports = router;

