const Course = require("../models/Course");
const Liveclass = require("../models/Liveclass");
const Enrollment = require("../models/Enrollment");
const User = require("../models/User");

exports.getTeacherDashboard = async (req, res) => {
  try {
    const userId = req.user.id;
    const userName = req.user.name;

    // Find courses created by this instructor
    const myCourses = await Course.find({
      $or: [
        { createdBy: userId },
        { instructor: { $regex: new RegExp(`^${userName}$`, "i") } }
      ]
    }).sort({ createdAt: -1 });

    const courseIds = myCourses.map(c => c._id);

    // Find live classes created by or conducted by this instructor
    const classes = await Liveclass.find({
      $or: [
        { createdBy: userId },
        { instructorName: { $regex: new RegExp(`^${userName}$`, "i") } }
      ]
    }).sort({ createdAt: -1 });

    // Find all enrollments for this teacher's courses
    const enrollments = await Enrollment.find({ course: { $in: courseIds } })
      .populate("student", "name email isVerified createdAt")
      .populate("course", "title instructor price category duration")
      .sort({ createdAt: -1 });

    // Calculate unique student count across all teacher's courses
    const uniqueStudentIds = [...new Set(enrollments.map(e => e.student?._id?.toString()).filter(Boolean))];
    const totalStudentsCount = uniqueStudentIds.length;

    // Attach enrollment statistics per course
    const myCoursesWithStats = myCourses.map(course => {
      const courseEnrollments = enrollments.filter(e => e.course?._id?.toString() === course._id.toString());
      return {
        ...course.toObject(),
        enrolledCount: courseEnrollments.length,
        completedCount: courseEnrollments.filter(e => e.completed).length,
      };
    });

    res.status(200).json({
      myCourses: myCoursesWithStats,
      classes,
      totalStudents: totalStudentsCount,
      totalCourses: myCourses.length,
      totalLiveClasses: classes.length,
      studentsList: enrollments,
    });
  } catch (error) {
    res.status(500).json({ message: "Teacher dashboard failed", error: error.message });
  }
};

// Approve student certificate with teacher digital signature
exports.approveCertificate = async (req, res) => {
  try {
    const teacherId = req.user.id;
    const teacherName = req.user.name;
    const { enrollmentId, digitalSignature } = req.body;

    if (!enrollmentId) {
      return res.status(400).json({ message: "Enrollment ID is required" });
    }

    const enrollment = await Enrollment.findById(enrollmentId)
      .populate("student", "name email")
      .populate("course", "title instructor createdBy");

    if (!enrollment) {
      return res.status(404).json({ message: "Enrollment record not found" });
    }

    // Ensure teacher owns course or is instructor/admin
    const isOwner =
      req.user.role === "admin" ||
      enrollment.course?.createdBy?.toString() === teacherId.toString() ||
      enrollment.course?.instructor?.toLowerCase() === teacherName.toLowerCase();

    if (!isOwner) {
      return res
        .status(403)
        .json({ message: "You are not authorized to sign certificates for this course" });
    }

    const certId =
      enrollment.certificateId ||
      `CERT-EDU-${Date.now().toString(36).toUpperCase()}-${Math.floor(
        1000 + Math.random() * 9000
      )}`;

    const signatureText =
      digitalSignature?.trim() ||
      `Digitally Signed by ${teacherName} [Verified Educator] on ${new Date().toLocaleDateString()}`;

    enrollment.completed = true;
    enrollment.completedAt = enrollment.completedAt || new Date();
    enrollment.certificateApproved = true;
    enrollment.certificateRequested = true;
    enrollment.teacherSignature = signatureText;
    enrollment.certificateId = certId;
    enrollment.approvedAt = new Date();

    await enrollment.save();

    res.status(200).json({
      success: true,
      message: "Certificate approved & digitally signed successfully!",
      enrollment,
    });
  } catch (error) {
    console.error("Approve Certificate Error:", error);
    res.status(500).json({ message: "Failed to approve certificate", error: error.message });
  }
};

// Revoke/Reject student certificate approval
exports.revokeCertificate = async (req, res) => {
  try {
    const { enrollmentId } = req.body;
    const enrollment = await Enrollment.findById(enrollmentId);

    if (!enrollment) {
      return res.status(404).json({ message: "Enrollment record not found" });
    }

    enrollment.certificateApproved = false;
    enrollment.teacherSignature = null;
    enrollment.approvedAt = null;

    await enrollment.save();

    res.status(200).json({
      success: true,
      message: "Certificate approval revoked successfully",
      enrollment,
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to revoke certificate", error: error.message });
  }
};

