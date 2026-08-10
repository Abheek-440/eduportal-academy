const User = require("../models/User");
const Course = require("../models/Course");
const Liveclass = require("../models/Liveclass");
const Enrollment = require("../models/Enrollment");

exports.getDashboardData = async (req, res) => {
  try {
    const totalStudents = await User.countDocuments({ role: "student" });
    const totalTeachers = await User.countDocuments({ role: { $in: ["instructor", "teacher"] } });
    const totalCourses = await Course.countDocuments();
    const liveClassesCount = await Liveclass.countDocuments();
    const activeUsers = await User.countDocuments({ isVerified: true });
    const totalUsers = await User.countDocuments();

    // Detailed lists for Admin Dashboard tabs
    const studentsList = await User.find({ role: "student" }).select("-password").sort({ createdAt: -1 });
    const teachersList = await User.find({ role: { $in: ["instructor", "teacher"] } }).select("-password").sort({ createdAt: -1 });
    const coursesList = await Course.find().sort({ createdAt: -1 });
    const liveClassesList = await Liveclass.find().sort({ createdAt: -1 });
    const activeUsersList = await User.find({ isVerified: true }).select("-password").sort({ createdAt: -1 });

    const enrollments = await Enrollment.find()
      .populate("student", "name email")
      .populate("course", "title instructor price");

    res.status(200).json({
      totalUsers,
      totalStudents,
      totalTeachers,
      totalCourses,
      liveClasses: liveClassesCount,
      activeUsers,
      studentsList,
      teachersList,
      coursesList,
      liveClassesList,
      activeUsersList,
      enrollments,
    });
  } catch (error) {
    res.status(500).json({ message: "Admin dashboard failed", error: error.message });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const userId = req.params.id;
    await User.findByIdAndDelete(userId);
    await Enrollment.deleteMany({ student: userId });
    res.status(200).json({ message: "User deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Delete user failed", error: error.message });
  }
};