import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import API from "../api/courseApi";
import CourseList from "../components/Courselist";
import { FaSearch, FaTimes, FaBookOpen } from "react-icons/fa";

const Home = () => {
  const [courses, setCourses] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);

  const getCourses = async () => {
    try {
      setLoading(true);
      const res = await API.get("/");
      setCourses(res.data);
    } catch (error) {
      console.error(error);
      alert(error.response?.data?.message || "Courses fetch failed");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getCourses();
  }, []);

  useEffect(() => {
    const delayDebounce = setTimeout(async () => {
      try {
        if (search.trim() === "") {
          getCourses();
        } else {
          setLoading(true);
          const res = await API.get(`/search/${search}`);
          setCourses(res.data);
        }
      } catch (error) {
        console.error(error);
        alert(error.response?.data?.message || "Search failed");
      } finally {
        setLoading(false);
      }
    }, 500);

    return () => clearTimeout(delayDebounce);
  }, [search]);

  const handleDelete = async (id) => {
    const user = JSON.parse(localStorage.getItem("user"));
    const token = localStorage.getItem("token");

    if (!token) {
      alert("Please login first");
      return;
    }

    if (user?.role === "student" || (user?.role !== "admin" && user?.role !== "instructor" && user?.role !== "teacher")) {
      alert("Students are not permitted to delete courses.");
      return;
    }

    const confirmDelete = window.confirm(
      "Are you sure you want to delete this course?"
    );

    if (!confirmDelete) return;

    try {
      await API.delete(`/${id}`, {
        headers: {
          Authorization: token,
        },
      });

      alert("Course deleted successfully");
      getCourses();
    } catch (error) {
      console.error(error);

      if (error.response?.status === 401) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        alert("Session expired. Please login again");
      } else {
        alert(error.response?.data?.message || "Delete failed");
      }
    }
  };

  const clearSearch = () => {
    setSearch("");
    getCourses();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 animate-fade-in">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-sky-950/80 via-slate-900/80 to-indigo-950/80 border border-cyan-500/30 text-white rounded-[2rem] p-12 mb-12 shadow-[0_0_30px_rgba(56,189,248,0.2)] relative overflow-hidden group">
        <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
          <div className="w-20 h-20 bg-cyan-950/50 border border-cyan-400/40 backdrop-blur-md rounded-2xl flex items-center justify-center shadow-[0_0_20px_rgba(56,189,248,0.3)] group-hover:scale-110 transition-transform duration-500">
            <FaBookOpen className="text-4xl text-cyan-400" />
          </div>
          <div>
            <h1 className="text-4xl md:text-6xl font-extrabold mb-4 tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white via-cyan-200 to-sky-400">
              Unlock Your Potential
            </h1>
            <p className="text-lg md:text-xl text-slate-300 max-w-2xl font-medium">
              Discover, manage, and explore high-quality online courses tailored for your success.
            </p>
          </div>
        </div>

        {/* Abstract shapes */}
        <div className="absolute -top-24 -right-24 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl animate-pulse-slow"></div>
        <div className="absolute -bottom-24 -left-24 w-80 h-80 bg-blue-600/10 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '1.5s' }}></div>
      </div>

      <div className="flex flex-col md:flex-row justify-between items-center gap-6 mb-10">
        <div className="glass-card px-6 py-4 flex items-center gap-4 border border-cyan-500/30 min-w-[200px] justify-center md:justify-start">
          <div className="bg-slate-950/60 border border-cyan-400/40 w-12 h-12 rounded-xl flex items-center justify-center shadow-[0_0_10px_rgba(56,189,248,0.2)]">
            <span className="text-2xl font-bold text-cyan-400">
              {courses.length}
            </span>
          </div>
          <h2 className="text-lg font-bold text-white">
            Active Courses
          </h2>
        </div>

        <div className="relative w-full md:w-[500px]">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <FaSearch className="text-slate-400" />
          </div>
          <input
            type="text"
            placeholder="Search courses by title..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input-field pl-12 pr-12 shadow-sm"
          />

          {search && (
            <button
              onClick={clearSearch}
              className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-red-500 transition-colors"
            >
              <FaTimes />
            </button>
          )}
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-32">
          <div className="w-16 h-16 border-4 border-cyan-400 border-t-cyan-600 rounded-full animate-spin"></div>
        </div>
      ) : courses.length === 0 ? (
        <div className="text-center py-32 glass-card border border-dashed border-white/10">
          <h3 className="text-2xl font-bold text-white mb-2">
            No courses found
          </h3>
          <p className="text-gray-300">
            Try searching with a different keyword or check back later.
          </p>
        </div>
      ) : (
        <CourseList courses={courses} onDelete={handleDelete} />
      )}
    </div>
  );
};

export default Home;