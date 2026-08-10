const Enrollment = require("../models/Enrollment");
const Course = require("../models/Course");
const Liveclass = require("../models/Liveclass");

// Get Student Dashboard Data
exports.getStudentDashboard = async (req, res) => {
  try {
    const studentId = req.user.id;

    // Fetch all enrollments for this student with course details
    const enrollments = await Enrollment.find({ student: studentId })
      .populate("course")
      .sort({ updatedAt: -1 });

    const enrolledCourses = enrollments
      .map((e) => ({
        enrollmentId: e._id,
        completed: e.completed,
        completedAt: e.completedAt,
        enrolledAt: e.createdAt,
        certificateApproved: e.certificateApproved,
        certificateRequested: e.certificateRequested,
        teacherSignature: e.teacherSignature,
        certificateId: e.certificateId,
        approvedAt: e.approvedAt,
        course: e.course,
      }))
      .filter((item) => item.course !== null);

    const completedCourses = enrolledCourses.filter((e) => e.completed);
    const inProgressCourses = enrolledCourses.filter((e) => !e.completed);

    // Also fetch live classes for student
    const liveClasses = await Liveclass.find().sort({ createdAt: -1 }).limit(10);

    res.status(200).json({
      totalEnrolled: enrolledCourses.length,
      totalCompleted: completedCourses.length,
      totalInProgress: inProgressCourses.length,
      enrolledCourses,
      completedCourses,
      liveClasses,
    });
  } catch (error) {
    res.status(500).json({ message: "Student dashboard failed", error: error.message });
  }
};

// Enroll in a course
exports.enrollCourse = async (req, res) => {
  try {
    const studentId = req.user.id;
    const { courseId } = req.body;

    if (!courseId) {
      return res.status(400).json({ message: "Course ID is required" });
    }

    const courseExists = await Course.findById(courseId);
    if (!courseExists) {
      return res.status(404).json({ message: "Course not found" });
    }

    let enrollment = await Enrollment.findOne({ student: studentId, course: courseId });
    if (enrollment) {
      return res.status(400).json({ message: "Already enrolled in this course" });
    }

    enrollment = await Enrollment.create({
      student: studentId,
      course: courseId,
    });

    res.status(201).json({ message: "Enrolled successfully", enrollment });
  } catch (error) {
    res.status(500).json({ message: "Enrollment failed", error: error.message });
  }
};

// Mark course as completed (permanent one-time action per user request)
exports.toggleCompleteCourse = async (req, res) => {
  try {
    const studentId = req.user.id;
    const { courseId } = req.body;

    let enrollment = await Enrollment.findOne({ student: studentId, course: courseId });
    if (!enrollment) {
      return res.status(404).json({ message: "Enrollment record not found" });
    }

    if (enrollment.completed) {
      return res.status(400).json({ message: "Course is already marked as completed" });
    }

    enrollment.completed = true;
    enrollment.completedAt = new Date();
    await enrollment.save();

    res.status(200).json({
      message: "🎉 Course marked as completed successfully!",
      completed: true,
    });
  } catch (error) {
    res.status(500).json({ message: "Toggle completion failed", error: error.message });
  }
};

// Unenroll from course
exports.unenrollCourse = async (req, res) => {
  try {
    const studentId = req.user.id;
    const { courseId } = req.body;

    await Enrollment.findOneAndDelete({ student: studentId, course: courseId });
    res.status(200).json({ message: "Unenrolled successfully" });
  } catch (error) {
    res.status(500).json({ message: "Unenroll failed", error: error.message });
  }
};
