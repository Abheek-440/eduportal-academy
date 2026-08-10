import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  FaVideo,
  FaCalendarAlt,
  FaClock,
  FaTrash,
  FaPlus,
} from "react-icons/fa";

import axios from "axios";
const LiveClasses = () => {
  const [classes, setClasses] = useState([]);

  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user"));

  const getClasses = async () => {
    try {
      const res = await axios.get("http://localhost:5500/api/liveclasses",);
      setClasses(res.data);
    } catch (error) {
      alert(error.response?.data?.message || "Fetch failed");
    }
  };


  useEffect(() => {
    getClasses();
  }, []);

  const handleDeleteClass = async (id) => {
    if (!window.confirm("Are you sure you want to delete this live class link?")) return;
    try {
      await axios.delete(`http://localhost:5500/api/liveclasses/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      alert("Live class deleted successfully");
      getClasses();
    } catch (error) {
      alert(error.response?.data?.message || "Failed to delete live class");
    }
  };

  const isTeacherOrAdmin =
    user?.role === "admin" ||
    user?.role === "instructor" ||
    user?.role === "teacher" ||
    user?.role === "Teacher";

  return (
    <div className="min-h-screen pt-28 pb-16 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-10">
          <div>
            <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white via-cyan-200 to-sky-400">
              Live Classes
            </h1>

            <p className="text-slate-300 mt-2">
              Join real-time video classroom
            </p>
          </div>

          {isTeacherOrAdmin && (
            <Link
              to="/create-live-class"
              className="btn-primary text-sm font-semibold flex items-center gap-2"
            >
              <FaPlus />
              Create Class
            </Link>
          )}
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {classes.map((item) => (
            <div
              key={item._id}
              className="glass-card border border-cyan-500/30 rounded-2xl shadow-lg p-6 hover:border-cyan-400/60 transition-colors flex flex-col justify-between"
            >
              <div>
                <div className="w-16 h-16 rounded-2xl bg-cyan-950/60 border border-cyan-400/40 text-cyan-400 flex items-center justify-center text-3xl mb-5 shadow-[0_0_15px_rgba(56,189,248,0.3)]">
                  <FaVideo />
                </div>

                <h2 className="text-xl font-bold mb-3 text-slate-100">
                  {item.title}
                </h2>

                <p className="mb-2 text-slate-200">
                  <b className="text-cyan-400">Subject:</b> {item.subject}
                </p>

                <p className="mb-2 text-slate-200">
                  <b className="text-cyan-400">Teacher:</b> {item.instructorName}
                </p>

                <div className="flex items-center gap-2 text-slate-300 mb-2">
                  <FaCalendarAlt className="text-cyan-400" />
                  {item.date}
                </div>

                <div className="flex items-center gap-2 text-slate-300 mb-5">
                  <FaClock className="text-cyan-400" />
                  {item.time}
                </div>
              </div>

              <div className="flex gap-3 pt-4 border-t border-white/10">
                <Link
                  to={`/join-live-class/${item._id}`}
                  className="flex-1 text-center bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white py-2.5 rounded-xl font-semibold transition-all shadow-[0_0_15px_rgba(56,189,248,0.3)]"
                >
                  Join Class
                </Link>

                {isTeacherOrAdmin && (
                  <button
                    onClick={() => handleDeleteClass(item._id)}
                    className="px-4 bg-rose-600/20 hover:bg-rose-600 border border-rose-500/40 text-rose-400 hover:text-white rounded-xl font-bold transition-all flex items-center justify-center gap-1.5"
                    title="Delete Live Class"
                  >
                    <FaTrash />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default LiveClasses;