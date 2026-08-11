import React, { useState, useEffect } from "react";
import axios from "axios";
import { API_BASE_URL } from "../config/apiConfig";
import { getImageUrl, handleImageError } from "../utils/imageUtils";
import { Link, useNavigate } from "react-router-dom";
import {
  FaBookOpen,
  FaVideo,
  FaUserGraduate,
  FaPlus,
  FaEdit,
  FaTrash,
  FaExternalLinkAlt,
  FaSearch,
  FaSync,
  FaChalkboardTeacher,
  FaCheckCircle,
  FaHourglassHalf,
  FaFilter,
  FaComments,
  FaAward,
  FaFileSignature,
  FaShieldAlt
} from "react-icons/fa";

const InstructorDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("mycourses");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCourseFilter, setSelectedCourseFilter] = useState("all");

  // Certificate approval state
  const [signingEnrollment, setSigningEnrollment] = useState(null);
  const [signatureInput, setSignatureInput] = useState("");
  const [submittingCert, setSubmittingCert] = useState(false);

  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  const fetchTeacherData = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await axios.get(`${API_BASE_URL}/api/teacher/dashboard`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setData(res.data);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Failed to load teacher dashboard data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeacherData();
  }, []);

  const handleDeleteCourse = async (id) => {
    if (!window.confirm("Are you sure you want to delete this course?")) return;
    try {
      await axios.delete(`${API_BASE_URL}/api/courses/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      alert("Course deleted successfully");
      fetchTeacherData();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to delete course");
    }
  };

  const handleDeleteLiveClass = async (id) => {
    if (!window.confirm("Are you sure you want to delete this live class?")) return;
    try {
      await axios.delete(`${API_BASE_URL}/api/liveclasses/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      alert("Live class deleted successfully");
      fetchTeacherData();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to delete live class");
    }
  };

  const handleOpenSignModal = (item) => {
    setSigningEnrollment(item);
    setSignatureInput(
      item.teacherSignature ||
        `Digitally Approved & Signed by Prof. ${user.name || "Teacher"} [Verified Educator]`
    );
  };

  const handleApproveCertificate = async () => {
    if (!signingEnrollment) return;
    try {
      setSubmittingCert(true);
      const res = await axios.post(
        `${API_BASE_URL}/api/teacher/approve-certificate`,
        {
          enrollmentId: signingEnrollment._id,
          digitalSignature: signatureInput,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      alert("🎉 " + (res.data.message || "Certificate approved and signed successfully!"));
      setSigningEnrollment(null);
      fetchTeacherData();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to approve certificate");
    } finally {
      setSubmittingCert(false);
    }
  };

  const handleRevokeCertificate = async (enrollmentId) => {
    if (!window.confirm("Are you sure you want to revoke certificate approval for this student?")) return;
    try {
      await axios.post(
        `${API_BASE_URL}/api/teacher/revoke-certificate`,
        { enrollmentId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert("Certificate approval revoked");
      fetchTeacherData();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to revoke certificate");
    }
  };


  if (loading) {
    return (
      <div className="min-h-screen pt-28 flex flex-col items-center justify-center">
        <div className="w-14 h-14 border-4 border-purple-400 border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 text-purple-300 font-medium tracking-wide">Loading Teacher Dashboard...</p>
      </div>
    );
  }

  const myCourses = data?.myCourses || [];
  const classes = data?.classes || [];
  const totalStudents = data?.totalStudents || 0;
  const studentsList = data?.studentsList || [];

  // Filter students based on search term and selected course
  const filteredStudents = studentsList.filter((item) => {
    const matchesSearch =
      !searchTerm.trim() ||
      item.student?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.student?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.course?.title?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCourse =
      selectedCourseFilter === "all" || item.course?._id === selectedCourseFilter;

    return matchesSearch && matchesCourse;
  });

  // Filter courses based on search term
  const filteredCourses = myCourses.filter((course) =>
    !searchTerm.trim() ||
    course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    course.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen py-10 px-4 md:px-8 pt-28 text-white max-w-7xl mx-auto">

      {/* Header Banner */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8 bg-gradient-to-r from-purple-950/80 via-slate-900/90 to-indigo-950/80 border border-purple-500/30 p-6 rounded-3xl shadow-[0_0_30px_rgba(168,85,247,0.15)] backdrop-blur-xl">
        <div>
          <div className="flex items-center gap-2 text-purple-400 font-bold uppercase tracking-wider text-xs mb-1">
            <FaChalkboardTeacher /> TEACHER DASHBOARD
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-white via-purple-100 to-indigo-300">
            Welcome back, {user.name || "Teacher"}!
          </h1>
          <p className="text-slate-300 text-sm mt-1">
            Manage your offered courses, live interactive classes, and track student attendance & enrollment.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchTeacherData}
            className="p-3 bg-purple-950/60 border border-purple-500/40 text-purple-300 hover:text-white rounded-2xl hover:bg-purple-500/20 transition-all shadow-md"
            title="Refresh Data"
          >
            <FaSync />
          </button>
          <Link
            to="/add-course"
            className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white py-2.5 px-4 text-sm flex items-center gap-2 rounded-2xl font-bold shadow-[0_0_15px_rgba(168,85,247,0.3)] transition-all"
          >
            <FaPlus /> Create Course
          </Link>
          <Link
            to="/create-live-class"
            className="bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-500 hover:to-pink-500 text-white py-2.5 px-4 text-sm flex items-center gap-2 rounded-2xl font-bold shadow-md transition-all"
          >
            <FaVideo /> Live Class+
          </Link>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-900/40 border border-red-500/50 rounded-2xl text-red-200 text-sm">
          {error}
        </div>
      )}

      {/* 3 Main Teacher Metric Cards Requested by User */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">

        {/* Card 1: My Courses */}
        <div
          onClick={() => setActiveTab("mycourses")}
          className={`cursor-pointer glass-card p-6 rounded-3xl border transition-all duration-300 group hover:scale-[1.02] ${activeTab === "mycourses"
              ? "border-purple-400 bg-purple-950/40 shadow-[0_0_25px_rgba(168,85,247,0.25)]"
              : "border-purple-500/20 hover:border-purple-400/50"
            }`}
        >
          <div className="flex justify-between items-start mb-4">
            <div>
              <span className="text-slate-400 text-xs font-semibold uppercase tracking-wider block mb-1">
                My Offered Courses
              </span>
              <h3 className="text-3xl font-black text-white">{myCourses.length}</h3>
            </div>
            <div className="p-3.5 bg-purple-500/20 text-purple-400 rounded-2xl group-hover:scale-110 transition-transform">
              <FaBookOpen className="text-2xl" />
            </div>
          </div>
          <p className="text-xs text-purple-300 font-medium">
            Courses currently published & managed by you
          </p>
        </div>

        {/* Card 2: Classes */}
        <div
          onClick={() => setActiveTab("classes")}
          className={`cursor-pointer glass-card p-6 rounded-3xl border transition-all duration-300 group hover:scale-[1.02] ${activeTab === "classes"
              ? "border-rose-400 bg-rose-950/40 shadow-[0_0_25px_rgba(244,63,94,0.25)]"
              : "border-rose-500/20 hover:border-rose-400/50"
            }`}
        >
          <div className="flex justify-between items-start mb-4">
            <div>
              <span className="text-slate-400 text-xs font-semibold uppercase tracking-wider block mb-1">
                My Live Classes
              </span>
              <h3 className="text-3xl font-black text-white">{classes.length}</h3>
            </div>
            <div className="p-3.5 bg-rose-500/20 text-rose-400 rounded-2xl group-hover:scale-110 transition-transform">
              <FaVideo className="text-2xl" />
            </div>
          </div>
          <p className="text-xs text-rose-300 font-medium">
            Scheduled interactive video sessions
          </p>
        </div>

        {/* Card 3: Total Attending Students */}
        <div
          onClick={() => setActiveTab("students")}
          className={`cursor-pointer glass-card p-6 rounded-3xl border transition-all duration-300 group hover:scale-[1.02] ${activeTab === "students"
              ? "border-cyan-400 bg-cyan-950/40 shadow-[0_0_25px_rgba(56,189,248,0.25)]"
              : "border-cyan-500/20 hover:border-cyan-400/50"
            }`}
        >
          <div className="flex justify-between items-start mb-4">
            <div>
              <span className="text-slate-400 text-xs font-semibold uppercase tracking-wider block mb-1">
                Attending Students
              </span>
              <h3 className="text-3xl font-black text-white">{totalStudents}</h3>
            </div>
            <div className="p-3.5 bg-cyan-500/20 text-cyan-400 rounded-2xl group-hover:scale-110 transition-transform">
              <FaUserGraduate className="text-2xl" />
            </div>
          </div>
          <p className="text-xs text-cyan-300 font-medium">
            Total unique students attending your courses ({studentsList.length} total enrollments)
          </p>
        </div>

      </div>

      {/* Tabs and Search Bar */}
      <div className="flex flex-col md:flex-row gap-4 justify-between items-center mb-6">

        <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto p-1.5 bg-slate-900/80 border border-white/10 rounded-2xl">
          <button
            onClick={() => setActiveTab("mycourses")}
            className={`px-5 py-2.5 text-xs md:text-sm font-semibold rounded-xl whitespace-nowrap transition-all ${activeTab === "mycourses"
                ? "bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md"
                : "text-slate-400 hover:text-white hover:bg-white/5"
              }`}
          >
            My Courses ({myCourses.length})
          </button>
          <button
            onClick={() => setActiveTab("classes")}
            className={`px-5 py-2.5 text-xs md:text-sm font-semibold rounded-xl whitespace-nowrap transition-all ${activeTab === "classes"
                ? "bg-gradient-to-r from-rose-600 to-pink-600 text-white shadow-md"
                : "text-slate-400 hover:text-white hover:bg-white/5"
              }`}
          >
            Classes ({classes.length})
          </button>
          <button
            onClick={() => setActiveTab("students")}
            className={`px-5 py-2.5 text-xs md:text-sm font-semibold rounded-xl whitespace-nowrap transition-all ${activeTab === "students"
                ? "bg-gradient-to-r from-sky-500 to-blue-600 text-white shadow-md"
                : "text-slate-400 hover:text-white hover:bg-white/5"
              }`}
          >
            Attending Students ({studentsList.length})
          </button>
        </div>

        <div className="relative w-full md:w-72">
          <FaSearch className="absolute left-3.5 top-3.5 text-slate-400 text-sm" />
          <input
            type="text"
            placeholder="Search dashboard..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-900/90 border border-purple-500/30 rounded-2xl text-sm text-white placeholder-slate-400 focus:outline-none focus:border-purple-400 transition-colors"
          />
        </div>
      </div>

      {/* TAB CONTENT */}

      {/* TAB 1: MY COURSES */}
      {activeTab === "mycourses" && (
        <div className="glass-card p-6 rounded-3xl border border-purple-500/30">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <FaBookOpen className="text-purple-400" /> My Offered Courses
              </h3>
              <p className="text-xs text-slate-300 mt-1">
                Courses created and published by you on the e-learning portal.
              </p>
            </div>
            <Link
              to="/add-course"
              className="bg-purple-600 hover:bg-purple-500 text-white py-2 px-4 text-xs font-bold flex items-center gap-2 rounded-xl"
            >
              <FaPlus /> Add New Course
            </Link>
          </div>

          {filteredCourses.length === 0 ? (
            <div className="text-center py-12 border border-dashed border-white/10 rounded-2xl">
              <FaBookOpen className="text-4xl text-purple-400/50 mx-auto mb-3" />
              <p className="text-slate-300 font-semibold mb-2">No courses offered yet</p>
              <p className="text-xs text-slate-400 mb-4">Click below to create your first course!</p>
              <Link
                to="/add-course"
                className="btn-primary py-2 px-5 text-xs inline-flex items-center gap-2"
              >
                <FaPlus /> Create Course Now
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredCourses.map((course) => (
                <div
                  key={course._id}
                  className="bg-slate-900/90 border border-purple-500/20 hover:border-purple-400/60 rounded-2xl p-4 flex flex-col justify-between transition-all group"
                >
                  <div>
                    {course.images?.[0] && (
                      <div className="w-full h-44 bg-slate-950/80 rounded-xl mb-3 overflow-hidden flex items-center justify-center border border-purple-500/20">
                        <img
                          src={getImageUrl(course.images[0])}
                          alt={course.title}
                          className="max-h-full max-w-full object-contain"
                          onError={handleImageError}
                        />
                      </div>
                    )}
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-xs bg-purple-950 text-purple-300 px-3 py-1 rounded-full font-semibold border border-purple-500/30">
                        {course.category}
                      </span>
                      <span className="text-sm font-black text-purple-400">₹{course.price}</span>
                    </div>

                    <h4 className="font-bold text-lg text-white mb-1 group-hover:text-purple-300 transition-colors">
                      {course.title}
                    </h4>
                    <p className="text-xs text-slate-400 line-clamp-2 mb-4">{course.description}</p>

                    {/* Stats for this specific course */}
                    <div className="flex items-center justify-between bg-slate-800/80 p-2.5 rounded-xl text-xs mb-4">
                      <span className="text-slate-300 flex items-center gap-1 font-medium">
                        <FaUserGraduate className="text-cyan-400" /> Attending:
                        <strong className="text-white ml-1">{course.enrolledCount || 0}</strong>
                      </span>
                      <span className="text-slate-300 flex items-center gap-1 font-medium">
                        <FaCheckCircle className="text-emerald-400" /> Completed:
                        <strong className="text-white ml-1">{course.completedCount || 0}</strong>
                      </span>
                    </div>
                  </div>

                  <div className="flex gap-2 pt-3 border-t border-white/10">
                    <button
                      onClick={() => navigate(`/course/${course._id}`)}
                      className="flex-1 bg-purple-950/60 hover:bg-purple-600 text-purple-300 hover:text-white border border-purple-400/40 py-2 rounded-xl text-xs font-semibold transition-all flex items-center justify-center gap-1"
                    >
                      <FaExternalLinkAlt /> View
                    </button>
                    <button
                      onClick={() => navigate(`/edit-course/${course._id}`)}
                      className="p-2.5 bg-indigo-600/30 hover:bg-indigo-600 text-indigo-300 hover:text-white rounded-xl transition-colors"
                      title="Edit Course"
                    >
                      <FaEdit />
                    </button>
                    <button
                      onClick={() => handleDeleteCourse(course._id)}
                      className="p-2.5 bg-red-600/20 hover:bg-red-600 text-red-400 hover:text-white rounded-xl transition-colors"
                      title="Delete Course"
                    >
                      <FaTrash />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: CLASSES (LIVE CLASSES) */}
      {activeTab === "classes" && (
        <div className="glass-card p-6 rounded-3xl border border-rose-500/30">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <FaVideo className="text-rose-400" /> Teacher Classes & Video Sessions
              </h3>
              <p className="text-xs text-slate-300 mt-1">
                Live interactive classes created or offered by you for your students.
              </p>
            </div>
            <Link
              to="/create-live-class"
              className="bg-rose-600 hover:bg-rose-500 text-white py-2 px-4 text-xs font-bold flex items-center gap-2 rounded-xl shadow-md"
            >
              <FaPlus /> Schedule Live Class
            </Link>
          </div>

          {classes.length === 0 ? (
            <div className="text-center py-12 border border-dashed border-white/10 rounded-2xl">
              <FaVideo className="text-4xl text-rose-400/50 mx-auto mb-3" />
              <p className="text-slate-300 font-semibold mb-2">No live classes scheduled</p>
              <p className="text-xs text-slate-400 mb-4">Start a live classroom session with your students now!</p>
              <Link
                to="/create-live-class"
                className="bg-rose-600 hover:bg-rose-500 text-white py-2 px-5 text-xs rounded-xl font-bold inline-flex items-center gap-2"
              >
                <FaVideo /> Create Live Room
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {classes.map((item) => (
                <div
                  key={item._id}
                  className="bg-slate-900/90 border border-rose-500/30 hover:border-rose-400/60 rounded-2xl p-5 flex flex-col justify-between transition-all"
                >
                  <div>
                    <div className="flex justify-between items-start mb-3">
                      <span className="text-xs bg-rose-950 text-rose-300 px-3 py-1 rounded-full font-bold border border-rose-500/40">
                        {item.subject}
                      </span>
                      <span className="text-xs text-slate-400 font-medium">
                        📅 {item.date} • ⏰ {item.time}
                      </span>
                    </div>

                    <h4 className="font-bold text-lg text-white mb-2">{item.title}</h4>
                    <p className="text-xs text-slate-300 mb-4">👨‍🏫 Instructor: {item.instructorName}</p>
                  </div>

                  <div className="flex gap-3 pt-3 border-t border-white/10">
                    <Link
                      to={`/join-live-class/${item._id}`}
                      className="flex-1 bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-500 hover:to-pink-500 text-white font-bold py-2.5 rounded-xl text-center text-sm shadow-md transition-all flex items-center justify-center gap-2"
                    >
                      <FaVideo /> Start / Join Live Class
                    </Link>
                    <button
                      onClick={() => handleDeleteLiveClass(item._id)}
                      className="px-3.5 bg-rose-600/20 hover:bg-rose-600 text-rose-400 hover:text-white rounded-xl transition-all border border-rose-500/40 text-sm"
                      title="Delete Live Class"
                    >
                      <FaTrash />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: ATTENDING STUDENTS */}
      {activeTab === "students" && (
        <div className="glass-card p-6 rounded-3xl border border-cyan-500/30">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <div>
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <FaUserGraduate className="text-cyan-400" /> Attending Students Roster ({filteredStudents.length})
              </h3>
              <p className="text-xs text-slate-300 mt-1">
                Students attending your offered courses and their progress status.
              </p>
            </div>

            {/* Course Filter Dropdown */}
            {myCourses.length > 0 && (
              <div className="flex items-center gap-2 text-xs">
                <FaFilter className="text-cyan-400" />
                <select
                  value={selectedCourseFilter}
                  onChange={(e) => setSelectedCourseFilter(e.target.value)}
                  className="bg-slate-900 border border-cyan-500/40 text-cyan-200 px-3 py-2 rounded-xl focus:outline-none"
                >
                  <option value="all">All My Courses</option>
                  {myCourses.map((c) => (
                    <option key={c._id} value={c._id}>
                      {c.title}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {filteredStudents.length === 0 ? (
            <p className="text-slate-400 text-center py-12">No attending students found for the selected course.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-white/10 text-cyan-300 text-xs uppercase tracking-wider">
                    <th className="py-3.5 px-4">Student Name</th>
                    <th className="py-3.5 px-4">Email</th>
                    <th className="py-3.5 px-4">Course Enrolled</th>
                    <th className="py-3.5 px-4">Progress Status</th>
                    <th className="py-3.5 px-4">Digital Certificate</th>
                    <th className="py-3.5 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-sm">
                  {filteredStudents.map((item, idx) => (
                    <tr key={item._id || idx} className="hover:bg-white/5 transition-colors">
                      <td className="py-3.5 px-4 font-semibold text-white flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-cyan-600/30 border border-cyan-400/40 flex items-center justify-center text-xs font-bold text-cyan-300">
                          {item.student?.name?.charAt(0).toUpperCase() || "S"}
                        </div>
                        {item.student?.name || "Student"}
                      </td>
                      <td className="py-3.5 px-4 text-slate-300">{item.student?.email || "N/A"}</td>
                      <td className="py-3.5 px-4">
                        <span className="font-medium text-white">{item.course?.title || "Course"}</span>
                        <span className="block text-xs text-cyan-400">{item.course?.category}</span>
                      </td>
                      <td className="py-3.5 px-4">
                        {item.completed ? (
                          <span className="text-emerald-400 bg-emerald-950/60 border border-emerald-500/40 text-xs px-3 py-1 rounded-full font-semibold flex items-center gap-1 w-fit">
                            <FaCheckCircle /> Course Completed
                          </span>
                        ) : (
                          <span className="text-sky-400 bg-sky-950/60 border border-sky-500/40 text-xs px-3 py-1 rounded-full font-semibold flex items-center gap-1 w-fit">
                            <FaHourglassHalf /> In Progress
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4">
                        {item.certificateApproved ? (
                          <div className="space-y-1">
                            <span className="text-amber-300 bg-amber-950/70 border border-amber-500/40 text-[11px] px-2.5 py-1 rounded-full font-bold flex items-center gap-1 w-fit">
                              <FaAward /> Digitally Signed
                            </span>
                            <span className="block text-[10px] text-slate-400 font-mono">
                              ID: {item.certificateId}
                            </span>
                          </div>
                        ) : item.completed ? (
                          <span className="text-amber-400 bg-slate-900 border border-amber-500/30 text-xs px-2.5 py-1 rounded-full font-semibold flex items-center gap-1 w-fit">
                            <FaShieldAlt /> Awaiting Teacher Signature
                          </span>
                        ) : (
                          <span className="text-slate-500 text-xs">Complete Course First</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {/* Teacher Digital Signature Action */}
                          {item.certificateApproved ? (
                            <button
                              onClick={() => handleRevokeCertificate(item._id)}
                              className="bg-amber-950/60 hover:bg-amber-600 text-amber-300 hover:text-white border border-amber-500/40 font-semibold text-xs px-3 py-1.5 rounded-xl transition-all"
                              title="Revoke Signature"
                            >
                              Revoke Signature
                            </button>
                          ) : (
                            <button
                              onClick={() => handleOpenSignModal(item)}
                              className="bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-400 hover:to-yellow-500 text-slate-950 font-bold text-xs px-3 py-1.5 rounded-xl shadow-md transition-all flex items-center gap-1"
                            >
                              <FaFileSignature /> Sign & Approve
                            </button>
                          )}

                          {item.student?._id && (
                            <Link
                              to={`/chat?userId=${item.student._id}`}
                              className="bg-cyan-950/80 hover:bg-cyan-500 hover:text-black text-cyan-300 border border-cyan-400/40 font-semibold text-xs px-3 py-1.5 rounded-xl transition-all inline-flex items-center gap-1.5"
                            >
                              <FaComments /> Chat
                            </Link>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Teacher Digital Signature Modal */}
      {signingEnrollment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
          <div className="relative w-full max-w-lg bg-slate-900 border border-amber-500/40 rounded-3xl shadow-[0_0_50px_rgba(245,158,11,0.25)] p-6 text-white space-y-5">
            
            <div className="flex justify-between items-center border-b border-white/10 pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-amber-500/20 text-amber-400 rounded-2xl border border-amber-500/40">
                  <FaFileSignature className="text-xl" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">Apply Digital Signature</h3>
                  <p className="text-xs text-amber-300">Approve Student Digital Certificate</p>
                </div>
              </div>
              <button
                onClick={() => setSigningEnrollment(null)}
                className="text-slate-400 hover:text-white text-lg p-1"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 bg-slate-950/70 p-4 rounded-2xl border border-white/10 text-xs">
              <div>
                <span className="text-slate-400">Student:</span>{" "}
                <strong className="text-white">{signingEnrollment.student?.name}</strong> (
                {signingEnrollment.student?.email})
              </div>
              <div>
                <span className="text-slate-400">Course:</span>{" "}
                <strong className="text-sky-300">{signingEnrollment.course?.title}</strong>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-amber-300 mb-1.5 flex items-center gap-1">
                <FaFileSignature /> Teacher Digital Signature & Verification Statement:
              </label>
              <textarea
                rows={3}
                value={signatureInput}
                onChange={(e) => setSignatureInput(e.target.value)}
                placeholder="Enter digital signature statement..."
                className="w-full p-3 bg-slate-950 border border-amber-500/40 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 font-mono"
              />
              <p className="text-[11px] text-slate-400 mt-1">
                This digital signature will be embedded on the student's official Canva certificate.
              </p>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => setSigningEnrollment(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold rounded-xl text-xs border border-white/10"
              >
                Cancel
              </button>
              <button
                disabled={submittingCert}
                onClick={handleApproveCertificate}
                className="px-5 py-2 bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-400 hover:to-yellow-500 text-slate-950 font-extrabold rounded-xl text-xs flex items-center gap-2 shadow-lg transition-all disabled:opacity-50"
              >
                {submittingCert ? (
                  <>
                    <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin"></div>
                    <span>Signing...</span>
                  </>
                ) : (
                  <>
                    <FaShieldAlt /> Sign & Issue Certificate
                  </>
                )}
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};

export default InstructorDashboard;