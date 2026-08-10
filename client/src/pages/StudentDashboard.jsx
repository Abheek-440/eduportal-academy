import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import {
  FaBookOpen,
  FaCheckCircle,
  FaHourglassHalf,
  FaTrophy,
  FaVideo,
  FaSearch,
  FaSync,
  FaExternalLinkAlt,
  FaGraduationCap,
  FaMagic,
  FaTrashAlt,
  FaPlusCircle,
  FaArrowRight,
  FaComments,
  FaReceipt,
  FaCreditCard,
  FaLock,
  FaAward,
  FaShieldAlt,
  FaFileSignature
} from "react-icons/fa";
import { loadRazorpayScript } from "../utils/loadRazorpay";
import CertificateModal from "../components/CertificateModal";

const StudentDashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [allCourses, setAllCourses] = useState([]);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("enrolled");
  const [searchTerm, setSearchTerm] = useState("");
  const [actionLoading, setActionLoading] = useState(false);
  const [selectedCertificate, setSelectedCertificate] = useState(null);

  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  const fetchStudentDashboard = async () => {
    try {
      setLoading(true);
      setError("");

      const res = await axios.get("http://localhost:5500/api/student/dashboard", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setDashboardData(res.data);

      // Fetch all available courses for explore catalog
      const coursesRes = await axios.get("http://localhost:5500/api/courses");
      setAllCourses(coursesRes.data);

      // Fetch payment history
      try {
        const payRes = await axios.get("http://localhost:5500/api/payment/history", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setPayments(payRes.data || []);
      } catch (payErr) {
        console.warn("Could not load payment history:", payErr);
      }

    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Failed to load student dashboard");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudentDashboard();
  }, []);

  const handleToggleComplete = async (courseId) => {
    try {
      setActionLoading(true);
      await axios.post(
        "http://localhost:5500/api/student/complete",
        { courseId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchStudentDashboard();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to update course completion status");
    } finally {
      setActionLoading(false);
    }
  };

  const handleUnenroll = async (courseId) => {
    if (!window.confirm("Are you sure you want to unenroll from this course?")) return;
    try {
      setActionLoading(true);
      await axios.post(
        "http://localhost:5500/api/student/unenroll",
        { courseId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchStudentDashboard();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to unenroll from course");
    } finally {
      setActionLoading(false);
    }
  };

  const handleRazorpayPayment = async (course) => {
    try {
      setActionLoading(true);

      // 1. Create order on backend
      const orderRes = await axios.post(
        "http://localhost:5500/api/payment/create-order",
        { courseId: course._id },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (orderRes.data.isFree) {
        alert("🎉 Free Course Enrolled Successfully!");
        fetchStudentDashboard();
        setActiveTab("enrolled");
        return;
      }

      const { keyId, orderId, amount, currency, courseTitle } = orderRes.data;

      // 2. Load SDK
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        alert("Failed to load Razorpay SDK. Please check internet connection.");
        setActionLoading(false);
        return;
      }

      // 3. Razorpay Options
      const options = {
        key: keyId,
        amount: amount,
        currency: currency,
        name: "EduPortal Academy",
        description: `Course Fee: ${courseTitle}`,
        image: "https://cdn-icons-png.flaticon.com/512/2991/2991148.png",
        order_id: orderId,
        handler: async function (response) {
          try {
            const verifyRes = await axios.post(
              "http://localhost:5500/api/payment/verify-payment",
              {
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                courseId: course._id,
              },
              { headers: { Authorization: `Bearer ${token}` } }
            );

            if (verifyRes.data.success) {
              alert("💳 Payment verified successfully! Course enrolled.");
              fetchStudentDashboard();
              setActiveTab("enrolled");
            }
          } catch (verifyErr) {
            alert(verifyErr.response?.data?.message || "Payment verification failed!");
          } finally {
            setActionLoading(false);
          }
        },
        prefill: {
          name: user.name || "",
          email: user.email || "",
        },
        theme: {
          color: "#0ea5e9",
        },
        modal: {
          ondismiss: function () {
            setActionLoading(false);
          },
        },
      };

      const razorpay = new window.Razorpay(options);
      razorpay.on("payment.failed", function (response) {
        alert(`Payment Failed: ${response.error.description || "Transaction cancelled"}`);
        setActionLoading(false);
      });

      razorpay.open();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Failed to initiate payment checkout!");
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen pt-28 flex flex-col items-center justify-center">
        <div className="w-14 h-14 border-4 border-sky-400 border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 text-sky-300 font-medium tracking-wide">Loading Student Portal...</p>
      </div>
    );
  }

  const enrolledCourses = dashboardData?.enrolledCourses || [];
  const completedCourses = dashboardData?.completedCourses || [];
  const liveClasses = dashboardData?.liveClasses || [];

  const totalEnrolled = dashboardData?.totalEnrolled || 0;
  const totalCompleted = dashboardData?.totalCompleted || 0;
  const totalInProgress = dashboardData?.totalInProgress || 0;
  const completionPercentage = totalEnrolled > 0 ? Math.round((totalCompleted / totalEnrolled) * 100) : 0;

  // Search filtering
  const filterCourses = (list) => {
    if (!searchTerm.trim()) return list;
    return list.filter((item) => {
      const title = item.course?.title || item.title || "";
      const instructor = item.course?.instructor || item.instructor || "";
      const category = item.course?.category || item.category || "";
      return (
        title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        instructor.toLowerCase().includes(searchTerm.toLowerCase()) ||
        category.toLowerCase().includes(searchTerm.toLowerCase())
      );
    });
  };

  const enrolledIds = enrolledCourses.map((e) => e.course?._id);

  return (
    <div className="min-h-screen py-10 px-4 md:px-8 pt-28 text-white max-w-7xl mx-auto">
      
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8 bg-gradient-to-r from-sky-950/80 via-slate-900/90 to-blue-950/80 border border-sky-500/30 p-6 rounded-3xl shadow-[0_0_30px_rgba(56,189,248,0.15)] backdrop-blur-xl">
        <div>
          <div className="flex items-center gap-2 text-sky-400 font-bold uppercase tracking-wider text-xs mb-1">
            <FaGraduationCap /> Student Dashboard
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-white via-sky-200 to-blue-400">
            Welcome back, {user.name || "Student"}!
          </h1>
          <p className="text-slate-300 text-sm mt-1">
            Track enrolled courses, view payment receipts, and manage your learning journey.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchStudentDashboard}
            className="p-3 bg-sky-950/60 border border-sky-500/40 text-sky-300 hover:text-white rounded-2xl hover:bg-sky-500/20 transition-all shadow-md"
            title="Refresh Dashboard"
          >
            <FaSync />
          </button>
          <button
            onClick={() => setActiveTab("explore")}
            className="btn-primary py-2.5 px-4 text-sm flex items-center gap-2 rounded-2xl font-bold shadow-[0_0_15px_rgba(56,189,248,0.3)] transition-all"
          >
            <FaPlusCircle /> Pay & Apply New Course
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-900/40 border border-red-500/50 rounded-2xl text-red-200 text-sm">
          {error}
        </div>
      )}

      {/* 4 Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        
        {/* Card 1: Enrolled Courses */}
        <div
          onClick={() => setActiveTab("enrolled")}
          className={`cursor-pointer glass-card p-6 rounded-3xl border transition-all duration-300 group hover:scale-[1.02] ${
            activeTab === "enrolled"
              ? "border-sky-400 bg-sky-950/40 shadow-[0_0_25px_rgba(56,189,248,0.25)]"
              : "border-sky-500/20 hover:border-sky-400/50"
          }`}
        >
          <div className="flex justify-between items-start mb-4">
            <div>
              <span className="text-slate-400 text-xs font-semibold uppercase tracking-wider block mb-1">
                Enrolled Courses
              </span>
              <h3 className="text-3xl font-black text-white">{totalEnrolled}</h3>
            </div>
            <div className="p-3.5 bg-sky-500/20 text-sky-400 rounded-2xl group-hover:scale-110 transition-transform">
              <FaBookOpen className="text-2xl" />
            </div>
          </div>
          <p className="text-xs text-sky-300 font-medium">Courses you have joined</p>
        </div>

        {/* Card 2: Complete Courses */}
        <div
          onClick={() => setActiveTab("completed")}
          className={`cursor-pointer glass-card p-6 rounded-3xl border transition-all duration-300 group hover:scale-[1.02] ${
            activeTab === "completed"
              ? "border-emerald-400 bg-emerald-950/40 shadow-[0_0_25px_rgba(16,185,129,0.25)]"
              : "border-emerald-500/20 hover:border-emerald-400/50"
          }`}
        >
          <div className="flex justify-between items-start mb-4">
            <div>
              <span className="text-slate-400 text-xs font-semibold uppercase tracking-wider block mb-1">
                Complete Courses
              </span>
              <h3 className="text-3xl font-black text-white">{totalCompleted}</h3>
            </div>
            <div className="p-3.5 bg-emerald-500/20 text-emerald-400 rounded-2xl group-hover:scale-110 transition-transform">
              <FaCheckCircle className="text-2xl" />
            </div>
          </div>
          <p className="text-xs text-emerald-300 font-medium">Finished course certifications</p>
        </div>

        {/* Card 3: Payments History */}
        <div
          onClick={() => setActiveTab("payments")}
          className={`cursor-pointer glass-card p-6 rounded-3xl border transition-all duration-300 group hover:scale-[1.02] ${
            activeTab === "payments"
              ? "border-cyan-400 bg-cyan-950/40 shadow-[0_0_25px_rgba(6,182,212,0.25)]"
              : "border-cyan-500/20 hover:border-cyan-400/50"
          }`}
        >
          <div className="flex justify-between items-start mb-4">
            <div>
              <span className="text-slate-400 text-xs font-semibold uppercase tracking-wider block mb-1">
                Paid Transactions
              </span>
              <h3 className="text-3xl font-black text-white">{payments.filter((p) => p.status === "paid").length}</h3>
            </div>
            <div className="p-3.5 bg-cyan-500/20 text-cyan-400 rounded-2xl group-hover:scale-110 transition-transform">
              <FaReceipt className="text-2xl" />
            </div>
          </div>
          <p className="text-xs text-cyan-300 font-medium">Razorpay payment receipts</p>
        </div>

        {/* Card 4: Completion Rate */}
        <div className="glass-card p-6 rounded-3xl border border-purple-500/20 hover:border-purple-400/50 transition-all duration-300 group hover:scale-[1.02]">
          <div className="flex justify-between items-start mb-4">
            <div>
              <span className="text-slate-400 text-xs font-semibold uppercase tracking-wider block mb-1">
                Completion Rate
              </span>
              <h3 className="text-3xl font-black text-white">{completionPercentage}%</h3>
            </div>
            <div className="p-3.5 bg-purple-500/20 text-purple-400 rounded-2xl group-hover:scale-110 transition-transform">
              <FaTrophy className="text-2xl" />
            </div>
          </div>
          <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden mt-1">
            <div
              className="bg-gradient-to-r from-purple-500 to-sky-400 h-full rounded-full transition-all duration-500"
              style={{ width: `${completionPercentage}%` }}
            ></div>
          </div>
        </div>

      </div>

      {/* Tabs and Search Bar */}
      <div className="flex flex-col md:flex-row gap-4 justify-between items-center mb-6">
        
        <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto p-1.5 bg-slate-900/80 border border-white/10 rounded-2xl">
          <button
            onClick={() => setActiveTab("enrolled")}
            className={`px-5 py-2.5 text-xs md:text-sm font-semibold rounded-xl whitespace-nowrap transition-all ${
              activeTab === "enrolled"
                ? "bg-gradient-to-r from-sky-500 to-blue-600 text-white shadow-md"
                : "text-slate-400 hover:text-white hover:bg-white/5"
            }`}
          >
            Enrolled Courses ({enrolledCourses.length})
          </button>
          <button
            onClick={() => setActiveTab("completed")}
            className={`px-5 py-2.5 text-xs md:text-sm font-semibold rounded-xl whitespace-nowrap transition-all ${
              activeTab === "completed"
                ? "bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-md"
                : "text-slate-400 hover:text-white hover:bg-white/5"
            }`}
          >
            Complete Courses ({completedCourses.length})
          </button>
          <button
            onClick={() => setActiveTab("payments")}
            className={`px-5 py-2.5 text-xs md:text-sm font-semibold rounded-xl whitespace-nowrap transition-all ${
              activeTab === "payments"
                ? "bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-md"
                : "text-slate-400 hover:text-white hover:bg-white/5"
            }`}
          >
            Payment History ({payments.length})
          </button>
          <button
            onClick={() => setActiveTab("live")}
            className={`px-5 py-2.5 text-xs md:text-sm font-semibold rounded-xl whitespace-nowrap transition-all ${
              activeTab === "live"
                ? "bg-gradient-to-r from-rose-500 to-pink-600 text-white shadow-md"
                : "text-slate-400 hover:text-white hover:bg-white/5"
            }`}
          >
            Live Classes ({liveClasses.length})
          </button>
          <button
            onClick={() => setActiveTab("explore")}
            className={`px-5 py-2.5 text-xs md:text-sm font-semibold rounded-xl whitespace-nowrap transition-all ${
              activeTab === "explore"
                ? "bg-gradient-to-r from-purple-500 to-indigo-600 text-white shadow-md"
                : "text-slate-400 hover:text-white hover:bg-white/5"
            }`}
          >
            Explore Catalog
          </button>
        </div>

        <div className="relative w-full md:w-72">
          <FaSearch className="absolute left-3.5 top-3.5 text-slate-400 text-sm" />
          <input
            type="text"
            placeholder="Search my courses..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-900/90 border border-sky-500/30 rounded-2xl text-sm text-white placeholder-slate-400 focus:outline-none focus:border-sky-400 transition-colors"
          />
        </div>
      </div>

      {/* TAB 1: ENROLLED COURSES */}
      {activeTab === "enrolled" && (
        <div className="glass-card p-6 rounded-3xl border border-sky-500/30">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <FaBookOpen className="text-sky-400" /> My Enrolled Courses ({enrolledCourses.length})
              </h3>
              <p className="text-xs text-slate-300 mt-1">
                Courses you are actively learning. Track your progress and access AI study assistants.
              </p>
            </div>
          </div>

          {filterCourses(enrolledCourses).length === 0 ? (
            <div className="text-center py-12 border border-dashed border-white/10 rounded-2xl">
              <FaBookOpen className="text-4xl text-sky-400/50 mx-auto mb-3" />
              <p className="text-slate-300 font-semibold mb-2">No enrolled courses found</p>
              <p className="text-xs text-slate-400 mb-4">Explore our catalog to start learning!</p>
              <button
                onClick={() => setActiveTab("explore")}
                className="btn-primary py-2 px-5 text-xs inline-flex items-center gap-2"
              >
                <FaPlusCircle /> Pay & Apply New Course
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filterCourses(enrolledCourses).map((item) => {
                const c = item.course;
                if (!c) return null;
                return (
                  <div
                    key={item.enrollmentId}
                    className="bg-slate-900/90 border border-sky-500/20 hover:border-sky-400/60 rounded-2xl p-4 flex flex-col justify-between transition-all group"
                  >
                    <div>
                      {c.images?.[0] && (
                        <img
                          src={`http://localhost:5500/uploads/${c.images[0]}`}
                          alt={c.title}
                          className="w-full h-44 object-cover rounded-xl mb-3"
                          onError={(e) => {
                            e.target.src = "https://via.placeholder.com/400x200?text=Course+Image";
                          }}
                        />
                      )}
                      <div className="flex justify-between items-start mb-2">
                        <span className="text-xs bg-sky-950 text-sky-300 px-3 py-1 rounded-full font-semibold border border-sky-500/30">
                          {c.category}
                        </span>
                        {item.completed ? (
                          <span className="text-xs bg-emerald-950 text-emerald-400 border border-emerald-500/40 px-2.5 py-1 rounded-full font-bold flex items-center gap-1">
                            <FaCheckCircle /> Completed
                          </span>
                        ) : (
                          <span className="text-xs bg-sky-950 text-sky-400 border border-sky-500/40 px-2.5 py-1 rounded-full font-semibold flex items-center gap-1">
                            <FaHourglassHalf /> In Progress
                          </span>
                        )}
                      </div>

                      <h4 className="font-bold text-lg text-white mb-1 group-hover:text-sky-300 transition-colors">
                        {c.title}
                      </h4>
                      <p className="text-xs text-slate-300 mb-1">👨‍🏫 Instructor: {c.instructor}</p>
                      <p className="text-xs text-slate-400 line-clamp-2 mb-4">{c.description}</p>
                    </div>

                    <div className="space-y-2 pt-3 border-t border-white/10">
                      
                      {/* NotebookLM AI Studio Link */}
                      <Link
                        to={`/notebook-lm?courseId=${c._id}`}
                        className="w-full bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white font-bold py-2 px-3 rounded-xl text-xs flex items-center justify-center gap-2 shadow-md transition-all"
                      >
                        <FaMagic /> Open in Quiz AI
                      </Link>

                      <div className="flex gap-2">
                        {/* Chat with Instructor */}
                        <Link
                          to={c.createdBy ? `/chat?userId=${c.createdBy}` : "/chat"}
                          className="bg-purple-950/80 hover:bg-purple-600 text-purple-300 hover:text-white p-2 rounded-xl text-xs font-semibold border border-purple-500/40 transition-all flex items-center justify-center gap-1"
                          title="Chat with Instructor"
                        >
                          <FaComments /> Chat
                        </Link>

                        {/* Complete Course Button (One-time action) */}
                        {item.completed ? (
                          <button
                            disabled
                            className="flex-1 bg-emerald-950/60 text-emerald-400 border border-emerald-500/40 py-1.5 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1 cursor-default"
                          >
                            <FaCheckCircle /> Completed
                          </button>
                        ) : (
                          <button
                            disabled={actionLoading}
                            onClick={() => handleToggleComplete(c._id)}
                            className="flex-1 bg-emerald-950/80 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-600 hover:text-white py-1.5 px-3 rounded-xl text-xs font-semibold transition-all flex items-center justify-center gap-1"
                          >
                            <FaCheckCircle /> Mark Complete
                          </button>
                        )}

                        {/* View Course */}
                        <button
                          onClick={() => navigate(`/course/${c._id}`)}
                          className="bg-slate-800 hover:bg-slate-700 text-slate-200 p-2 rounded-xl text-xs font-semibold border border-white/10 transition-colors"
                          title="View Course"
                        >
                          <FaExternalLinkAlt />
                        </button>

                        {/* Unenroll */}
                        <button
                          disabled={actionLoading}
                          onClick={() => handleUnenroll(c._id)}
                          className="bg-red-600/20 hover:bg-red-600 text-red-400 hover:text-white p-2 rounded-xl text-xs font-semibold transition-colors"
                          title="Unenroll"
                        >
                          <FaTrashAlt />
                        </button>
                      </div>

                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: COMPLETE COURSES */}
      {activeTab === "completed" && (
        <div className="glass-card p-6 rounded-3xl border border-emerald-500/30">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <FaCheckCircle className="text-emerald-400" /> Completed Courses ({completedCourses.length})
              </h3>
              <p className="text-xs text-slate-300 mt-1">
                Courses you have successfully completed. Keep up the excellent work!
              </p>
            </div>
          </div>

          {filterCourses(completedCourses).length === 0 ? (
            <div className="text-center py-12 border border-dashed border-white/10 rounded-2xl">
              <FaTrophy className="text-4xl text-emerald-400/50 mx-auto mb-3" />
              <p className="text-slate-300 font-semibold mb-2">No completed courses yet</p>
              <p className="text-xs text-slate-400 mb-4">Mark your enrolled courses as completed as you finish them!</p>
              <button
                onClick={() => setActiveTab("enrolled")}
                className="bg-emerald-600 hover:bg-emerald-500 text-white py-2 px-5 text-xs rounded-xl font-bold inline-flex items-center gap-2"
              >
                Go to Enrolled Courses
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filterCourses(completedCourses).map((item) => {
                const c = item.course;
                if (!c) return null;
                return (
                  <div
                    key={item.enrollmentId}
                    className="bg-slate-900/90 border border-emerald-500/30 hover:border-emerald-400/60 rounded-2xl p-4 flex flex-col justify-between transition-all group shadow-md"
                  >
                    <div>
                      {c.images?.[0] && (
                        <img
                          src={`http://localhost:5500/uploads/${c.images[0]}`}
                          alt={c.title}
                          className="w-full h-44 object-cover rounded-xl mb-3"
                          onError={(e) => {
                            e.target.src = "https://via.placeholder.com/400x200?text=Course+Image";
                          }}
                        />
                      )}
                      <div className="flex justify-between items-start mb-2">
                        <span className="text-xs bg-emerald-950 text-emerald-300 px-3 py-1 rounded-full font-semibold border border-emerald-500/30">
                          {c.category}
                        </span>
                        <span className="text-xs bg-emerald-600 text-white px-2.5 py-1 rounded-full font-extrabold flex items-center gap-1">
                          <FaTrophy /> Completed
                        </span>
                      </div>

                      <h4 className="font-bold text-lg text-white mb-1 group-hover:text-emerald-300 transition-colors">
                        {c.title}
                      </h4>
                      <p className="text-xs text-slate-300 mb-1">👨‍🏫 Instructor: {c.instructor}</p>
                      <p className="text-xs text-slate-400 line-clamp-2 mb-4">{c.description}</p>
                    </div>

                    <div className="space-y-2 pt-3 border-t border-white/10">
                      
                      {/* Digital Certificate Button or Pending Badge */}
                      {item.certificateApproved ? (
                        <button
                          onClick={() => setSelectedCertificate(item)}
                          className="w-full bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-600 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-black py-2.5 px-3 rounded-xl text-xs flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(245,158,11,0.3)] transition-all hover:scale-[1.02]"
                        >
                          <FaAward className="text-base text-slate-950" /> View & Download Digital Certificate
                        </button>
                      ) : (
                        <div className="bg-amber-950/40 border border-amber-500/30 p-2.5 rounded-xl text-center">
                          <span className="text-[11px] text-amber-300 font-semibold flex items-center justify-center gap-1">
                            <FaShieldAlt className="text-amber-400" /> Certificate Awaiting Teacher Signature
                          </span>
                          <p className="text-[10px] text-slate-400 mt-0.5">
                            Your course teacher will review and apply digital signature soon.
                          </p>
                        </div>
                      )}

                      <Link
                        to={`/notebook-lm?courseId=${c._id}`}
                        className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-bold py-2 px-3 rounded-xl text-xs flex items-center justify-center gap-2 shadow-md transition-all"
                      >
                        <FaMagic /> Review in Quiz AI
                      </Link>

                      <div className="flex gap-2">
                        <button
                          disabled
                          className="flex-1 bg-emerald-950/60 text-emerald-400 border border-emerald-500/40 py-1.5 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1 cursor-default"
                        >
                          <FaCheckCircle /> Course Completed
                        </button>
                        <button
                          onClick={() => navigate(`/course/${c._id}`)}
                          className="bg-slate-800 hover:bg-slate-700 text-slate-200 p-2 rounded-xl text-xs font-semibold border border-white/10 transition-colors"
                          title="View Course"
                        >
                          <FaExternalLinkAlt />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: PAYMENTS HISTORY */}
      {activeTab === "payments" && (
        <div className="glass-card p-6 rounded-3xl border border-cyan-500/30">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <FaReceipt className="text-cyan-400" /> Payment & Transaction Receipts ({payments.length})
              </h3>
              <p className="text-xs text-slate-300 mt-1">
                Your Razorpay payments and application fee receipts for enrolled courses.
              </p>
            </div>
          </div>

          {payments.length === 0 ? (
            <div className="text-center py-12 border border-dashed border-white/10 rounded-2xl">
              <FaCreditCard className="text-4xl text-cyan-400/50 mx-auto mb-3" />
              <p className="text-slate-300 font-semibold mb-2">No payment transactions found</p>
              <p className="text-xs text-slate-400">Pay for courses in the catalog to see receipts here.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {payments.map((p) => (
                <div
                  key={p._id}
                  className="bg-slate-900/90 border border-cyan-500/20 hover:border-cyan-400/50 p-5 rounded-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4 transition-all"
                >
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-cyan-500/20 text-cyan-400 rounded-2xl border border-cyan-500/30 mt-1">
                      <FaReceipt className="text-xl" />
                    </div>
                    <div>
                      <h4 className="font-bold text-base text-white">
                        {p.course?.title || "Course Fee Payment"}
                      </h4>
                      <p className="text-xs text-slate-400 mt-1 flex flex-wrap gap-x-4 gap-y-1">
                        <span><strong>Order ID:</strong> {p.razorpayOrderId}</span>
                        {p.razorpayPaymentId && (
                          <span><strong>Payment ID:</strong> {p.razorpayPaymentId}</span>
                        )}
                        <span><strong>Date:</strong> {new Date(p.createdAt).toLocaleDateString()} {new Date(p.createdAt).toLocaleTimeString()}</span>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-end border-t md:border-t-0 pt-3 md:pt-0 border-white/10">
                    <div className="text-right">
                      <div className="text-lg font-black text-cyan-400">₹{p.amount}</div>
                      <span className="text-[10px] uppercase font-bold px-2.5 py-0.5 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-500/40">
                        {p.status}
                      </span>
                    </div>

                    {p.course?._id && (
                      <button
                        onClick={() => navigate(`/course/${p.course._id}`)}
                        className="bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs px-3 py-2 rounded-xl font-semibold border border-white/10 transition-colors"
                      >
                        View Course
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 4: LIVE CLASSES */}
      {activeTab === "live" && (
        <div className="glass-card p-6 rounded-3xl border border-rose-500/30">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <FaVideo className="text-rose-400" /> Interactive Live Classrooms ({liveClasses.length})
              </h3>
              <p className="text-xs text-slate-300 mt-1">
                Join live streaming classes hosted by your instructors.
              </p>
            </div>
          </div>

          {liveClasses.length === 0 ? (
            <p className="text-slate-400 text-center py-12">No live classes scheduled currently.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {liveClasses.map((item) => (
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

                  <Link
                    to={`/join-live-class/${item._id}`}
                    className="w-full bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-500 hover:to-pink-500 text-white font-bold py-2.5 rounded-xl text-center text-sm shadow-md transition-all flex items-center justify-center gap-2"
                  >
                    <FaVideo /> Join Live Class Now
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 5: EXPLORE CATALOG */}
      {activeTab === "explore" && (
        <div className="glass-card p-6 rounded-3xl border border-purple-500/30">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <FaPlusCircle className="text-purple-400" /> Explore & Apply for Platform Courses
              </h3>
              <p className="text-xs text-slate-300 mt-1">
                Browse available courses and pay via Razorpay to complete your course application.
              </p>
            </div>
          </div>

          {filterCourses(allCourses).length === 0 ? (
            <p className="text-slate-400 text-center py-12">No additional courses available.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filterCourses(allCourses).map((course) => {
                const isEnrolled = enrolledIds.includes(course._id);
                return (
                  <div
                    key={course._id}
                    className="bg-slate-900/90 border border-purple-500/20 hover:border-purple-400/60 rounded-2xl p-4 flex flex-col justify-between transition-all group"
                  >
                    <div>
                      {course.images?.[0] && (
                        <img
                          src={`http://localhost:5500/uploads/${course.images[0]}`}
                          alt={course.title}
                          className="w-full h-44 object-cover rounded-xl mb-3"
                          onError={(e) => {
                            e.target.src = "https://via.placeholder.com/400x200?text=Course+Image";
                          }}
                        />
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
                      <p className="text-xs text-slate-300 mb-1">👨‍🏫 Instructor: {course.instructor}</p>
                      <p className="text-xs text-slate-400 line-clamp-2 mb-4">{course.description}</p>
                    </div>

                    <div className="pt-3 border-t border-white/10 flex gap-2">
                      {isEnrolled ? (
                        <button
                          disabled
                          className="flex-1 bg-slate-800 text-slate-400 py-2 rounded-xl text-xs font-bold border border-white/10 cursor-default flex items-center justify-center gap-1"
                        >
                          <FaCheckCircle className="text-emerald-400" /> Enrolled
                        </button>
                      ) : (
                        <button
                          disabled={actionLoading}
                          onClick={() => handleRazorpayPayment(course)}
                          className="flex-1 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-bold py-2 rounded-xl text-xs flex items-center justify-center gap-1 shadow-md transition-all hover:scale-[1.02]"
                        >
                          <FaCreditCard /> Pay & Apply <FaArrowRight />
                        </button>
                      )}

                      <button
                        onClick={() => navigate(`/course/${course._id}`)}
                        className="bg-slate-800 hover:bg-slate-700 text-slate-200 p-2 rounded-xl text-xs font-semibold border border-white/10 transition-colors"
                        title="View Course"
                      >
                        <FaExternalLinkAlt />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Certificate Modal */}
      {selectedCertificate && (
        <CertificateModal
          certificate={selectedCertificate}
          studentName={user.name || "Student"}
          onClose={() => setSelectedCertificate(null)}
        />
      )}

    </div>
  );
};

export default StudentDashboard;