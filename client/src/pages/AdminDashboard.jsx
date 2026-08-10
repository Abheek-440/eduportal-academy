import React, { useState, useEffect } from "react";
import axios from "axios";
import { API_BASE_URL } from "../config/apiConfig";
import { Link, useNavigate } from "react-router-dom";
import {
  FaUserGraduate,
  FaChalkboardTeacher,
  FaBookOpen,
  FaVideo,
  FaUserCheck,
  FaSearch,
  FaTrash,
  FaPlus,
  FaExternalLinkAlt,
  FaSync,
  FaShieldAlt,
  FaComments
} from "react-icons/fa";

const AdminDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  const [searchTerm, setSearchTerm] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const token = localStorage.getItem("token");

  const fetchAdminData = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await axios.get(`${API_BASE_URL}/api/admin/dashboard`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setData(res.data);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Failed to load admin dashboard data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  const handleDeleteUser = async (id) => {
    if (!window.confirm("Are you sure you want to delete this user?")) return;
    try {
      await axios.delete(`${API_BASE_URL}/api/admin/users/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      alert("User deleted successfully");
      fetchAdminData();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to delete user");
    }
  };

  const handleDeleteLiveClass = async (id) => {
    if (!window.confirm("Are you sure you want to delete this live class link?")) return;
    try {
      await axios.delete(`${API_BASE_URL}/api/liveclasses/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      alert("Live class deleted successfully");
      fetchAdminData();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to delete live class");
    }
  };

  const handleDeleteCourse = async (id) => {
    if (!window.confirm("Are you sure you want to delete this course?")) return;
    try {
      await axios.delete(`${API_BASE_URL}/api/courses/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      alert("Course deleted successfully");
      fetchAdminData();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to delete course");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen pt-28 flex flex-col items-center justify-center">
        <div className="w-14 h-14 border-4 border-cyan-400 border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 text-cyan-300 font-medium tracking-wide">Loading Admin System...</p>
      </div>
    );
  }

  // Fallbacks if backend list is empty or API fails
  const totalStudents = data?.totalStudents ?? 0;
  const totalTeachers = data?.totalTeachers ?? 0;
  const totalCourses = data?.totalCourses ?? 0;
  const liveClassesCount = data?.liveClasses ?? 0;
  const activeUsersCount = data?.activeUsers ?? 0;

  const studentsList = data?.studentsList || [];
  const teachersList = data?.teachersList || [];
  const coursesList = data?.coursesList || [];
  const liveClassesList = data?.liveClassesList || [];
  const activeUsersList = data?.activeUsersList || [];

  // Filtering based on search term
  const filterBySearch = (list, keys = ["name", "email", "title", "instructor"]) => {
    if (!searchTerm.trim()) return list;
    return list.filter((item) =>
      keys.some((key) => item[key]?.toString().toLowerCase().includes(searchTerm.toLowerCase()))
    );
  };

  return (
    <div className="min-h-screen py-10 px-4 md:px-8 pt-28 text-white max-w-7xl mx-auto">
      
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8 bg-gradient-to-r from-cyan-950/80 via-slate-900/90 to-blue-950/80 border border-cyan-500/30 p-6 rounded-3xl shadow-[0_0_30px_rgba(56,189,248,0.15)] backdrop-blur-xl">
        <div>
          <div className="flex items-center gap-2 text-cyan-400 font-bold uppercase tracking-wider text-xs mb-1">
            <FaShieldAlt /> System Administration
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-white via-cyan-100 to-sky-400">
            Admin Management Console
          </h1>
          <p className="text-slate-300 text-sm mt-1">
            Monitor platform metrics, manage registered students, teachers, active courses, and live classrooms.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchAdminData}
            className="p-3 bg-cyan-950/60 border border-cyan-500/40 text-cyan-300 hover:text-white rounded-2xl hover:bg-cyan-500/20 transition-all shadow-md"
            title="Refresh Data"
          >
            <FaSync />
          </button>
          <Link
            to="/add-course"
            className="btn-primary py-2.5 px-4 text-sm flex items-center gap-2 rounded-2xl font-bold shadow-[0_0_15px_rgba(56,189,248,0.3)]"
          >
            <FaPlus /> Add Course
          </Link>
          <Link
            to="/create-live-class"
            className="bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white py-2.5 px-4 text-sm flex items-center gap-2 rounded-2xl font-bold shadow-md transition-all"
          >
            <FaVideo /> Live+
          </Link>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-900/40 border border-red-500/50 rounded-2xl text-red-200 text-sm">
          {error}
        </div>
      )}

      {/* 5 Key Metric Cards Requested by User */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5 mb-8">
        
        {/* Card 1: Total Student */}
        <div
          onClick={() => setActiveTab("students")}
          className={`cursor-pointer glass-card p-5 rounded-2xl border transition-all duration-300 group hover:scale-[1.02] ${
            activeTab === "students"
              ? "border-cyan-400 bg-cyan-950/40 shadow-[0_0_20px_rgba(56,189,248,0.25)]"
              : "border-cyan-500/20 hover:border-cyan-400/50"
          }`}
        >
          <div className="flex justify-between items-start mb-3">
            <span className="text-slate-400 text-xs font-semibold uppercase tracking-wider">
              Total Students
            </span>
            <div className="p-3 bg-sky-500/20 text-sky-400 rounded-xl group-hover:scale-110 transition-transform">
              <FaUserGraduate className="text-xl" />
            </div>
          </div>
          <div className="text-3xl font-black text-white">{totalStudents}</div>
          <span className="text-xs text-sky-400 font-medium mt-2 inline-block">
            Registered Student Accounts
          </span>
        </div>

        {/* Card 2: Total Teacher */}
        <div
          onClick={() => setActiveTab("teachers")}
          className={`cursor-pointer glass-card p-5 rounded-2xl border transition-all duration-300 group hover:scale-[1.02] ${
            activeTab === "teachers"
              ? "border-cyan-400 bg-cyan-950/40 shadow-[0_0_20px_rgba(56,189,248,0.25)]"
              : "border-cyan-500/20 hover:border-cyan-400/50"
          }`}
        >
          <div className="flex justify-between items-start mb-3">
            <span className="text-slate-400 text-xs font-semibold uppercase tracking-wider">
              Total Teachers
            </span>
            <div className="p-3 bg-purple-500/20 text-purple-400 rounded-xl group-hover:scale-110 transition-transform">
              <FaChalkboardTeacher className="text-xl" />
            </div>
          </div>
          <div className="text-3xl font-black text-white">{totalTeachers}</div>
          <span className="text-xs text-purple-400 font-medium mt-2 inline-block">
            Instructors & Educator Accounts
          </span>
        </div>

        {/* Card 3: Total Courses */}
        <div
          onClick={() => setActiveTab("courses")}
          className={`cursor-pointer glass-card p-5 rounded-2xl border transition-all duration-300 group hover:scale-[1.02] ${
            activeTab === "courses"
              ? "border-cyan-400 bg-cyan-950/40 shadow-[0_0_20px_rgba(56,189,248,0.25)]"
              : "border-cyan-500/20 hover:border-cyan-400/50"
          }`}
        >
          <div className="flex justify-between items-start mb-3">
            <span className="text-slate-400 text-xs font-semibold uppercase tracking-wider">
              Total Courses
            </span>
            <div className="p-3 bg-emerald-500/20 text-emerald-400 rounded-xl group-hover:scale-110 transition-transform">
              <FaBookOpen className="text-xl" />
            </div>
          </div>
          <div className="text-3xl font-black text-white">{totalCourses}</div>
          <span className="text-xs text-emerald-400 font-medium mt-2 inline-block">
            Active Catalog Courses
          </span>
        </div>

        {/* Card 4: Live Classes */}
        <div
          onClick={() => setActiveTab("liveclasses")}
          className={`cursor-pointer glass-card p-5 rounded-2xl border transition-all duration-300 group hover:scale-[1.02] ${
            activeTab === "liveclasses"
              ? "border-cyan-400 bg-cyan-950/40 shadow-[0_0_20px_rgba(56,189,248,0.25)]"
              : "border-cyan-500/20 hover:border-cyan-400/50"
          }`}
        >
          <div className="flex justify-between items-start mb-3">
            <span className="text-slate-400 text-xs font-semibold uppercase tracking-wider">
              Live Classes
            </span>
            <div className="p-3 bg-rose-500/20 text-rose-400 rounded-xl group-hover:scale-110 transition-transform">
              <FaVideo className="text-xl" />
            </div>
          </div>
          <div className="text-3xl font-black text-white">{liveClassesCount}</div>
          <span className="text-xs text-rose-400 font-medium mt-2 inline-block">
            Scheduled Sessions
          </span>
        </div>

        {/* Card 5: Active Users */}
        <div
          onClick={() => setActiveTab("activeusers")}
          className={`cursor-pointer glass-card p-5 rounded-2xl border transition-all duration-300 group hover:scale-[1.02] ${
            activeTab === "activeusers"
              ? "border-cyan-400 bg-cyan-950/40 shadow-[0_0_20px_rgba(56,189,248,0.25)]"
              : "border-cyan-500/20 hover:border-cyan-400/50"
          }`}
        >
          <div className="flex justify-between items-start mb-3">
            <span className="text-slate-400 text-xs font-semibold uppercase tracking-wider">
              Active Users
            </span>
            <div className="p-3 bg-amber-500/20 text-amber-400 rounded-xl group-hover:scale-110 transition-transform">
              <FaUserCheck className="text-xl" />
            </div>
          </div>
          <div className="text-3xl font-black text-white">{activeUsersCount}</div>
          <span className="text-xs text-amber-400 font-medium mt-2 inline-block">
            Verified Account Holders
          </span>
        </div>

      </div>

      {/* Navigation Tabs and Search */}
      <div className="flex flex-col md:flex-row gap-4 justify-between items-center mb-6">
        
        {/* Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto p-1.5 bg-slate-900/80 border border-white/10 rounded-2xl">
          {[
            { id: "overview", label: "Overview" },
            { id: "students", label: `Students (${totalStudents})` },
            { id: "teachers", label: `Teachers (${totalTeachers})` },
            { id: "courses", label: `Courses (${totalCourses})` },
            { id: "liveclasses", label: `Live Classes (${liveClassesCount})` },
            { id: "activeusers", label: `Active Users (${activeUsersCount})` },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 text-xs md:text-sm font-semibold rounded-xl whitespace-nowrap transition-all ${
                activeTab === tab.id
                  ? "bg-gradient-to-r from-sky-500 to-blue-600 text-white shadow-md"
                  : "text-slate-400 hover:text-white hover:bg-white/5"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search Bar */}
        <div className="relative w-full md:w-72">
          <FaSearch className="absolute left-3.5 top-3.5 text-slate-400 text-sm" />
          <input
            type="text"
            placeholder="Search records..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-900/90 border border-cyan-500/30 rounded-2xl text-sm text-white placeholder-slate-400 focus:outline-none focus:border-cyan-400 transition-colors"
          />
        </div>
      </div>

      {/* TAB CONTENT AREA */}

      {/* TAB 1: OVERVIEW */}
      {activeTab === "overview" && (
        <div className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            
            {/* Quick Metrics Breakdown */}
            <div className="glass-card p-6 rounded-3xl border border-cyan-500/30">
              <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <span className="w-3 h-3 bg-cyan-400 rounded-full animate-pulse"></span>
                System Highlights & Distribution
              </h3>

              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-1 font-medium">
                    <span className="text-slate-300">Student Percentage</span>
                    <span className="text-cyan-400">
                      {data?.totalUsers ? Math.round((totalStudents / data.totalUsers) * 100) : 0}%
                    </span>
                  </div>
                  <div className="w-full h-3 bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-sky-500 to-cyan-400 rounded-full"
                      style={{
                        width: `${data?.totalUsers ? (totalStudents / data.totalUsers) * 100 : 0}%`,
                      }}
                    ></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-sm mb-1 font-medium">
                    <span className="text-slate-300">Teachers Percentage</span>
                    <span className="text-purple-400">
                      {data?.totalUsers ? Math.round((totalTeachers / data.totalUsers) * 100) : 0}%
                    </span>
                  </div>
                  <div className="w-full h-3 bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-purple-500 to-indigo-400 rounded-full"
                      style={{
                        width: `${data?.totalUsers ? (totalTeachers / data.totalUsers) * 100 : 0}%`,
                      }}
                    ></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-sm mb-1 font-medium">
                    <span className="text-slate-300">Verified Active Accounts</span>
                    <span className="text-emerald-400">
                      {data?.totalUsers ? Math.round((activeUsersCount / data.totalUsers) * 100) : 0}%
                    </span>
                  </div>
                  <div className="w-full h-3 bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full"
                      style={{
                        width: `${data?.totalUsers ? (activeUsersCount / data.totalUsers) * 100 : 0}%`,
                      }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Admin Actions */}
            <div className="glass-card p-6 rounded-3xl border border-cyan-500/30 flex flex-col justify-between">
              <div>
                <h3 className="text-xl font-bold text-white mb-2">Platform Controls</h3>
                <p className="text-slate-300 text-sm mb-6">
                  Perform core management tasks across the educational hub.
                </p>

                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => setActiveTab("students")}
                    className="p-4 bg-slate-900/80 border border-white/10 hover:border-cyan-400/50 rounded-2xl text-left transition-all group"
                  >
                    <FaUserGraduate className="text-2xl text-cyan-400 mb-2 group-hover:scale-110 transition-transform" />
                    <div className="font-bold text-sm text-white">Manage Students</div>
                    <div className="text-xs text-slate-400">{totalStudents} Total</div>
                  </button>

                  <button
                    onClick={() => setActiveTab("teachers")}
                    className="p-4 bg-slate-900/80 border border-white/10 hover:border-purple-400/50 rounded-2xl text-left transition-all group"
                  >
                    <FaChalkboardTeacher className="text-2xl text-purple-400 mb-2 group-hover:scale-110 transition-transform" />
                    <div className="font-bold text-sm text-white">Manage Teachers</div>
                    <div className="text-xs text-slate-400">{totalTeachers} Total</div>
                  </button>

                  <button
                    onClick={() => setActiveTab("courses")}
                    className="p-4 bg-slate-900/80 border border-white/10 hover:border-emerald-400/50 rounded-2xl text-left transition-all group"
                  >
                    <FaBookOpen className="text-2xl text-emerald-400 mb-2 group-hover:scale-110 transition-transform" />
                    <div className="font-bold text-sm text-white">Catalog Courses</div>
                    <div className="text-xs text-slate-400">{totalCourses} Active</div>
                  </button>

                  <button
                    onClick={() => setActiveTab("liveclasses")}
                    className="p-4 bg-slate-900/80 border border-white/10 hover:border-rose-400/50 rounded-2xl text-left transition-all group"
                  >
                    <FaVideo className="text-2xl text-rose-400 mb-2 group-hover:scale-110 transition-transform" />
                    <div className="font-bold text-sm text-white">Live Rooms</div>
                    <div className="text-xs text-slate-400">{liveClassesCount} Scheduled</div>
                  </button>
                </div>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* TAB 2: TOTAL STUDENTS */}
      {activeTab === "students" && (
        <div className="glass-card p-6 rounded-3xl border border-cyan-500/30">
          <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <FaUserGraduate className="text-cyan-400" /> Total Students Roster ({studentsList.length})
          </h3>

          {filterBySearch(studentsList).length === 0 ? (
            <p className="text-slate-400 text-center py-8">No students found.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-white/10 text-cyan-300 text-xs uppercase tracking-wider">
                    <th className="py-3 px-4">Student Name</th>
                    <th className="py-3 px-4">Email</th>
                    <th className="py-3 px-4">Role</th>
                    <th className="py-3 px-4">Verification</th>
                    <th className="py-3 px-4">Joined Date</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-sm">
                  {filterBySearch(studentsList).map((student) => (
                    <tr key={student._id} className="hover:bg-white/5 transition-colors">
                      <td className="py-3 px-4 font-semibold text-white">{student.name}</td>
                      <td className="py-3 px-4 text-slate-300">{student.email}</td>
                      <td className="py-3 px-4">
                        <span className="bg-cyan-950 border border-cyan-400/40 text-cyan-300 text-xs px-2.5 py-1 rounded-full font-medium">
                          {student.role}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        {student.isVerified ? (
                          <span className="text-emerald-400 bg-emerald-950/60 border border-emerald-500/40 text-xs px-2.5 py-1 rounded-full">
                            Verified
                          </span>
                        ) : (
                          <span className="text-amber-400 bg-amber-950/60 border border-amber-500/40 text-xs px-2.5 py-1 rounded-full">
                            Pending
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-slate-400 text-xs">
                        {new Date(student.createdAt).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-4 text-right flex items-center justify-end gap-2">
                        <Link
                          to={`/chat?userId=${student._id}`}
                          className="p-2 bg-cyan-950/80 hover:bg-cyan-500 hover:text-black text-cyan-300 border border-cyan-400/40 rounded-lg text-xs font-semibold transition-all inline-flex items-center gap-1"
                          title="Chat with Student"
                        >
                          <FaComments /> Chat
                        </Link>
                        <button
                          onClick={() => handleDeleteUser(student._id)}
                          className="p-2 bg-red-600/20 hover:bg-red-600 text-red-400 hover:text-white rounded-lg transition-colors"
                          title="Delete Student"
                        >
                          <FaTrash />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* TAB 3: TOTAL TEACHERS */}
      {activeTab === "teachers" && (
        <div className="glass-card p-6 rounded-3xl border border-cyan-500/30">
          <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <FaChalkboardTeacher className="text-purple-400" /> Total Teachers & Instructors ({teachersList.length})
          </h3>

          {filterBySearch(teachersList).length === 0 ? (
            <p className="text-slate-400 text-center py-8">No teachers found.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-white/10 text-purple-300 text-xs uppercase tracking-wider">
                    <th className="py-3 px-4">Teacher Name</th>
                    <th className="py-3 px-4">Email</th>
                    <th className="py-3 px-4">Role</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Joined Date</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-sm">
                  {filterBySearch(teachersList).map((teacher) => (
                    <tr key={teacher._id} className="hover:bg-white/5 transition-colors">
                      <td className="py-3 px-4 font-semibold text-white flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-purple-600/30 border border-purple-400/40 flex items-center justify-center text-xs font-bold text-purple-300">
                          {teacher.name.charAt(0).toUpperCase()}
                        </div>
                        {teacher.name}
                      </td>
                      <td className="py-3 px-4 text-slate-300">{teacher.email}</td>
                      <td className="py-3 px-4">
                        <span className="bg-purple-950 border border-purple-400/40 text-purple-300 text-xs px-2.5 py-1 rounded-full font-medium">
                          {teacher.role}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-emerald-400 bg-emerald-950/60 border border-emerald-500/40 text-xs px-2.5 py-1 rounded-full">
                          Active Instructor
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-400 text-xs">
                        {new Date(teacher.createdAt).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-4 text-right flex items-center justify-end gap-2">
                        <Link
                          to={`/chat?userId=${teacher._id}`}
                          className="p-2 bg-purple-950/80 hover:bg-purple-600 hover:text-white text-purple-300 border border-purple-400/40 rounded-lg text-xs font-semibold transition-all inline-flex items-center gap-1"
                          title="Chat with Teacher"
                        >
                          <FaComments /> Chat
                        </Link>
                        <button
                          onClick={() => handleDeleteUser(teacher._id)}
                          className="p-2 bg-red-600/20 hover:bg-red-600 text-red-400 hover:text-white rounded-lg transition-colors"
                          title="Delete Teacher Account"
                        >
                          <FaTrash />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* TAB 4: TOTAL COURSES */}
      {activeTab === "courses" && (
        <div className="glass-card p-6 rounded-3xl border border-cyan-500/30">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-bold text-white flex items-center gap-2">
              <FaBookOpen className="text-emerald-400" /> Total Platform Courses ({coursesList.length})
            </h3>
            <Link
              to="/add-course"
              className="btn-primary py-2 px-4 text-xs font-bold flex items-center gap-2 rounded-xl"
            >
              <FaPlus /> New Course
            </Link>
          </div>

          {filterBySearch(coursesList).length === 0 ? (
            <p className="text-slate-400 text-center py-8">No courses available.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filterBySearch(coursesList).map((course) => (
                <div
                  key={course._id}
                  className="bg-slate-900/90 border border-cyan-500/20 hover:border-cyan-400/60 rounded-2xl overflow-hidden p-4 flex flex-col justify-between transition-all group"
                >
                  <div>
                    {course.images?.[0] && (
                      <img
                        src={`${API_BASE_URL}/uploads/${course.images[0]}`}
                        alt={course.title}
                        className="w-full h-40 object-cover rounded-xl mb-3"
                        onError={(e) => {
                          e.target.src = "https://via.placeholder.com/400x200?text=Course+Image";
                        }}
                      />
                    )}
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-xs bg-cyan-950 text-cyan-300 px-2.5 py-1 rounded-full font-semibold border border-cyan-500/30">
                        {course.category}
                      </span>
                      <span className="text-sm font-extrabold text-cyan-400">₹{course.price}</span>
                    </div>
                    <h4 className="font-bold text-lg text-white mb-1 group-hover:text-cyan-300 transition-colors">
                      {course.title}
                    </h4>
                    <p className="text-xs text-slate-300 mb-2">👨‍🏫 {course.instructor}</p>
                    <p className="text-xs text-slate-400 line-clamp-2 mb-4">{course.description}</p>
                  </div>

                  <div className="flex gap-2 pt-3 border-t border-white/10">
                    <button
                      onClick={() => navigate(`/course/${course._id}`)}
                      className="flex-1 bg-cyan-950/60 hover:bg-cyan-500 hover:text-black border border-cyan-400/40 text-cyan-300 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center justify-center gap-1"
                    >
                      <FaExternalLinkAlt /> View
                    </button>
                    <button
                      onClick={() => handleDeleteCourse(course._id)}
                      className="p-2 bg-red-600/20 hover:bg-red-600 text-red-400 hover:text-white rounded-xl transition-colors"
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

      {/* TAB 5: LIVE CLASSES */}
      {activeTab === "liveclasses" && (
        <div className="glass-card p-6 rounded-3xl border border-cyan-500/30">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-bold text-white flex items-center gap-2">
              <FaVideo className="text-rose-400" /> Scheduled Live Classes ({liveClassesList.length})
            </h3>
            <Link
              to="/create-live-class"
              className="bg-rose-600 hover:bg-rose-500 text-white py-2 px-4 text-xs font-bold flex items-center gap-2 rounded-xl"
            >
              <FaPlus /> Schedule Live Class
            </Link>
          </div>

          {filterBySearch(liveClassesList, ["title", "subject", "instructorName"]).length === 0 ? (
            <p className="text-slate-400 text-center py-8">No live classes scheduled.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filterBySearch(liveClassesList, ["title", "subject", "instructorName"]).map((item) => (
                <div
                  key={item._id}
                  className="bg-slate-900/90 border border-rose-500/30 hover:border-rose-400/60 rounded-2xl p-5 flex flex-col justify-between transition-all"
                >
                  <div>
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-xs bg-rose-950 text-rose-300 px-3 py-1 rounded-full font-bold border border-rose-500/40">
                        {item.subject}
                      </span>
                      <span className="text-xs text-slate-400">📅 {item.date} • ⏰ {item.time}</span>
                    </div>

                    <h4 className="font-bold text-lg text-white mb-2">{item.title}</h4>
                    <p className="text-xs text-slate-300 mb-4">👨‍🏫 Instructor: {item.instructorName}</p>
                  </div>

                  <div className="flex gap-3 pt-3 border-t border-white/10">
                    <Link
                      to={`/join-live-class/${item._id}`}
                      className="flex-1 bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-500 hover:to-pink-500 text-white font-bold py-2 rounded-xl text-center text-sm shadow-md transition-all flex items-center justify-center gap-1.5"
                    >
                      Join Live Classroom
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

      {/* TAB 6: ACTIVE USERS */}
      {activeTab === "activeusers" && (
        <div className="glass-card p-6 rounded-3xl border border-cyan-500/30">
          <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <FaUserCheck className="text-amber-400" /> Active Verified Users ({activeUsersList.length})
          </h3>

          {filterBySearch(activeUsersList).length === 0 ? (
            <p className="text-slate-400 text-center py-8">No active verified users found.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-white/10 text-amber-300 text-xs uppercase tracking-wider">
                    <th className="py-3 px-4">User Name</th>
                    <th className="py-3 px-4">Email</th>
                    <th className="py-3 px-4">Account Type</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Joined Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-sm">
                  {filterBySearch(activeUsersList).map((user) => (
                    <tr key={user._id} className="hover:bg-white/5 transition-colors">
                      <td className="py-3 px-4 font-semibold text-white">{user.name}</td>
                      <td className="py-3 px-4 text-slate-300">{user.email}</td>
                      <td className="py-3 px-4">
                        <span className="capitalize bg-slate-800 text-cyan-300 border border-cyan-500/30 text-xs px-2.5 py-1 rounded-full font-medium">
                          {user.role}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-emerald-400 bg-emerald-950/60 border border-emerald-500/40 text-xs px-2.5 py-1 rounded-full flex items-center gap-1 w-fit font-semibold">
                          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                          Active & Verified
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-400 text-xs">
                        {new Date(user.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

    </div>
  );
};

export default AdminDashboard;