import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  FaChevronDown,
  FaBrain,
  FaRobot,
  FaFileAlt,
  FaBars,
  FaTimes,
  FaComments,
  FaGraduationCap,
  FaChalkboardTeacher,
  FaShieldAlt,
  FaVideo,
  FaPlus
} from "react-icons/fa";
import { HiSparkles } from "react-icons/hi";

const Navbar = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user") || "null");
  const [aiMenuOpen, setAiMenuOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setMobileMenuOpen(false);
    navigate("/login");
  };

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
  };

  const linkClass =
    "text-slate-200 hover:text-cyan-400 font-medium transition-colors duration-200 relative group text-sm flex items-center gap-1.5 py-1";
  const hoverUnderline = (
    <span className="absolute -bottom-1 left-0 w-0 h-[2px] bg-gradient-to-r from-cyan-400 to-blue-500 transition-all duration-300 group-hover:w-full rounded-full"></span>
  );

  return (
    <div className="sticky top-2 sm:top-4 z-50 px-2 sm:px-4 w-full">
      <nav className="glass-card max-w-7xl mx-auto px-4 sm:px-6 py-3.5 flex justify-between items-center animate-slide-up opacity-0 relative">
        
        {/* Logo */}
        <div
          onClick={() => {
            navigate("/");
            closeMobileMenu();
          }}
          className="cursor-pointer flex items-center shrink-0 select-none group"
        >
          <span className="text-xl sm:text-2xl font-extrabold tracking-tight font-sans bg-gradient-to-r from-cyan-400 via-sky-300 to-blue-500 bg-clip-text text-transparent drop-shadow-[0_0_12px_rgba(56,189,248,0.4)]">
            Eduportal
          </span>
          <span className="ml-1.5 text-base sm:text-lg font-serif font-semibold tracking-wider text-amber-400 group-hover:text-amber-300 transition-colors">
            Academy
          </span>
        </div>

        {/* Desktop Menu (Hidden on Mobile) */}
        <div className="hidden md:flex gap-6 items-center">
          <Link to="/" className={linkClass}>
            Home {hoverUnderline}
          </Link>

          {/* AI Features Dropdown Nav */}
          <div
            className="relative group"
            onMouseEnter={() => setAiMenuOpen(true)}
            onMouseLeave={() => setAiMenuOpen(false)}
          >
            <Link
              to="/ai-features"
              className="text-cyan-300 hover:text-cyan-100 font-semibold transition-colors duration-200 relative group text-sm flex items-center gap-1.5 bg-cyan-500/15 px-3.5 py-1 rounded-full border border-cyan-400/40 shadow-[0_0_15px_rgba(56,189,248,0.3)]"
            >
              <HiSparkles className="text-cyan-400 text-sm animate-pulse" />
              <span>AI Features</span>
              <FaChevronDown
                className={`text-[10px] transition-transform duration-200 ${
                  aiMenuOpen ? "rotate-180" : ""
                }`}
              />
              {hoverUnderline}
            </Link>

            {/* Dropdown Menu Container */}
            <div
              className={`absolute top-full left-0 pt-1.5 w-64 transition-all duration-200 z-50 group-hover:opacity-100 group-hover:visible group-hover:translate-y-0 ${
                aiMenuOpen
                  ? "opacity-100 visible translate-y-0"
                  : "opacity-0 invisible -translate-y-2 pointer-events-none"
              }`}
            >
              <div className="rounded-2xl bg-slate-900/95 backdrop-blur-xl border border-cyan-500/30 p-2 shadow-[0_10px_30px_rgba(0,0,0,0.5)]">
                <Link
                  to="/ai-features?feature=notebooklm"
                  onClick={() => setAiMenuOpen(false)}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-200 hover:text-white hover:bg-cyan-500/20 transition-colors"
                >
                  <FaBrain className="text-cyan-400 text-base" />
                  <div>
                    <div className="text-xs font-bold">Quiz AI</div>
                    <div className="text-[10px] text-slate-400">
                      AI-generated quizzes
                    </div>
                  </div>
                </Link>

                <Link
                  to="/ai-features?feature=aibot"
                  onClick={() => setAiMenuOpen(false)}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-200 hover:text-white hover:bg-purple-500/20 transition-colors"
                >
                  <FaRobot className="text-purple-400 text-base" />
                  <div>
                    <div className="text-xs font-bold">AI Course Bot</div>
                    <div className="text-[10px] text-slate-400">
                      Learning Assistant
                    </div>
                  </div>
                </Link>

                <Link
                  to="/ai-features?feature=resume"
                  onClick={() => setAiMenuOpen(false)}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-200 hover:text-white hover:bg-emerald-500/20 transition-colors"
                >
                  <FaFileAlt className="text-emerald-400 text-base" />
                  <div>
                    <div className="text-xs font-bold">Resume Analyzer</div>
                    <div className="text-[10px] text-slate-400">
                      Document Evaluation
                    </div>
                  </div>
                </Link>
              </div>
            </div>
          </div>

          <Link to="/about" className={linkClass}>
            About {hoverUnderline}
          </Link>
          <Link to="/contact" className={linkClass}>
            Contact {hoverUnderline}
          </Link>
          <Link to="/live-classes" className={linkClass}>
            Live Classes {hoverUnderline}
          </Link>

          {token && (
            <div className="flex items-center gap-5 border-l border-white/10 pl-5 ml-1">
              <Link to="/chat" className={linkClass}>
                Chat {hoverUnderline}
              </Link>
            </div>
          )}
        </div>

        {/* Desktop Auth / Actions (Hidden on Mobile) */}
        <div className="hidden md:flex items-center gap-4">
          {(user?.role === "admin" || user?.role === "instructor") && (
            <div className="hidden lg:flex items-center gap-4 mr-2 border-r border-white/10 pr-4">
              <Link
                to="/create-live-class"
                className="text-xs font-semibold text-cyan-400 hover:text-cyan-200 transition-colors uppercase tracking-wider"
              >
                Live+
              </Link>
              <Link
                to="/add-course"
                className="text-xs font-semibold text-cyan-400 hover:text-cyan-200 transition-colors uppercase tracking-wider"
              >
                Course+
              </Link>
            </div>
          )}

          {user?.role === "student" && (
            <Link to="/student-dashboard" className={linkClass}>
              Dashboard {hoverUnderline}
            </Link>
          )}
          {user?.role === "admin" && (
            <Link to="/admin-dashboard" className={linkClass}>
              Dashboard {hoverUnderline}
            </Link>
          )}
          {(user?.role === "instructor" ||
            user?.role === "teacher" ||
            user?.role === "Teacher") && (
            <Link to="/instructor-dashboard" className={linkClass}>
              Dashboard {hoverUnderline}
            </Link>
          )}

          {!token ? (
            <div className="flex gap-3">
              <Link to="/login" className="btn-secondary py-2 px-5 text-sm">
                Login
              </Link>
              <Link to="/register" className="btn-primary py-2 px-5 text-sm">
                Get Started
              </Link>
            </div>
          ) : (
            <button
              onClick={logout}
              className="btn-secondary py-2 px-5 text-sm hover:text-red-600 hover:border-red-200 ml-2"
            >
              Logout
            </button>
          )}
        </div>

        {/* Mobile Hamburger Button */}
        <div className="flex md:hidden items-center gap-3">
          {!token ? (
            <Link
              to="/login"
              className="btn-primary py-1.5 px-3.5 text-xs rounded-xl"
            >
              Login
            </Link>
          ) : (
            <Link
              to={
                user?.role === "admin"
                  ? "/admin-dashboard"
                  : user?.role === "instructor" || user?.role === "teacher"
                  ? "/instructor-dashboard"
                  : "/student-dashboard"
              }
              className="text-xs bg-cyan-950 text-cyan-300 border border-cyan-500/40 px-2.5 py-1 rounded-xl font-semibold line-clamp-1 max-w-[110px]"
            >
              Dashboard
            </Link>
          )}

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 text-cyan-400 hover:text-white bg-slate-900 border border-cyan-500/30 rounded-xl transition-all"
            aria-label="Toggle Navigation Menu"
          >
            {mobileMenuOpen ? (
              <FaTimes className="text-xl" />
            ) : (
              <FaBars className="text-xl" />
            )}
          </button>
        </div>

        {/* Mobile Navigation Drawer / Dropdown */}
        {mobileMenuOpen && (
          <div className="md:hidden absolute top-full left-0 right-0 mt-3 p-4 bg-slate-900/95 backdrop-blur-2xl border border-cyan-500/40 rounded-3xl shadow-[0_10px_30px_rgba(0,0,0,0.8)] z-50 flex flex-col gap-3 animate-fade-in text-sm">
            
            <Link
              to="/"
              onClick={closeMobileMenu}
              className="px-4 py-2.5 rounded-xl text-slate-200 hover:text-white hover:bg-white/5 font-semibold transition-colors flex items-center justify-between"
            >
              <span>🏠 Home</span>
            </Link>

            {/* Mobile AI Features Section */}
            <div className="bg-slate-950/80 p-3 rounded-2xl border border-cyan-500/20 space-y-2">
              <div className="text-xs font-bold text-cyan-400 flex items-center gap-1.5">
                <HiSparkles /> AI Smart Features
              </div>
              <div className="grid grid-cols-1 gap-1 pl-2">
                <Link
                  to="/ai-features?feature=notebooklm"
                  onClick={closeMobileMenu}
                  className="py-1.5 text-xs text-slate-300 hover:text-cyan-300 flex items-center gap-2"
                >
                  <FaBrain className="text-cyan-400" /> Quiz AI
                </Link>
                <Link
                  to="/ai-features?feature=aibot"
                  onClick={closeMobileMenu}
                  className="py-1.5 text-xs text-slate-300 hover:text-purple-300 flex items-center gap-2"
                >
                  <FaRobot className="text-purple-400" /> AI Course Bot
                </Link>
                <Link
                  to="/ai-features?feature=resume"
                  onClick={closeMobileMenu}
                  className="py-1.5 text-xs text-slate-300 hover:text-emerald-300 flex items-center gap-2"
                >
                  <FaFileAlt className="text-emerald-400" /> Resume Analyzer
                </Link>
              </div>
            </div>

            <Link
              to="/about"
              onClick={closeMobileMenu}
              className="px-4 py-2 rounded-xl text-slate-200 hover:text-white hover:bg-white/5 font-medium"
            >
              ℹ️ About Us
            </Link>

            <Link
              to="/contact"
              onClick={closeMobileMenu}
              className="px-4 py-2 rounded-xl text-slate-200 hover:text-white hover:bg-white/5 font-medium"
            >
              📞 Contact Us
            </Link>

            <Link
              to="/live-classes"
              onClick={closeMobileMenu}
              className="px-4 py-2 rounded-xl text-slate-200 hover:text-white hover:bg-white/5 font-medium"
            >
              📹 Live Interactive Classes
            </Link>

            {token && (
              <Link
                to="/chat"
                onClick={closeMobileMenu}
                className="px-4 py-2 rounded-xl text-cyan-300 font-semibold bg-cyan-950/60 border border-cyan-500/30 flex items-center justify-between"
              >
                <span className="flex items-center gap-2">
                  <FaComments /> Direct Chat
                </span>
                <span className="text-[10px] bg-cyan-500 text-black px-2 py-0.5 rounded-full font-bold">
                  Live
                </span>
              </Link>
            )}

            {/* Role Dashboards & Create Shortcuts */}
            {user?.role === "student" && (
              <Link
                to="/student-dashboard"
                onClick={closeMobileMenu}
                className="px-4 py-2.5 rounded-xl font-bold bg-gradient-to-r from-sky-500 to-blue-600 text-white flex items-center gap-2 shadow-md"
              >
                <FaGraduationCap /> Student Dashboard
              </Link>
            )}

            {(user?.role === "instructor" ||
              user?.role === "teacher" ||
              user?.role === "Teacher") && (
              <div className="space-y-2">
                <Link
                  to="/instructor-dashboard"
                  onClick={closeMobileMenu}
                  className="px-4 py-2.5 rounded-xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 text-white flex items-center gap-2 shadow-md"
                >
                  <FaChalkboardTeacher /> Teacher Dashboard
                </Link>
                <div className="flex gap-2 pt-1">
                  <Link
                    to="/add-course"
                    onClick={closeMobileMenu}
                    className="flex-1 py-2 bg-purple-950 border border-purple-500/40 text-purple-300 rounded-xl text-xs font-bold text-center flex items-center justify-center gap-1"
                  >
                    <FaPlus /> Add Course
                  </Link>
                  <Link
                    to="/create-live-class"
                    onClick={closeMobileMenu}
                    className="flex-1 py-2 bg-rose-950 border border-rose-500/40 text-rose-300 rounded-xl text-xs font-bold text-center flex items-center justify-center gap-1"
                  >
                    <FaVideo /> Live Class
                  </Link>
                </div>
              </div>
            )}

            {user?.role === "admin" && (
              <Link
                to="/admin-dashboard"
                onClick={closeMobileMenu}
                className="px-4 py-2.5 rounded-xl font-bold bg-gradient-to-r from-amber-500 to-yellow-600 text-slate-950 flex items-center gap-2 shadow-md"
              >
                <FaShieldAlt /> Admin Dashboard
              </Link>
            )}

            {/* Auth Buttons */}
            <div className="pt-2 border-t border-white/10 flex gap-2">
              {!token ? (
                <>
                  <Link
                    to="/login"
                    onClick={closeMobileMenu}
                    className="flex-1 btn-secondary py-2 text-center text-xs"
                  >
                    Login
                  </Link>
                  <Link
                    to="/register"
                    onClick={closeMobileMenu}
                    className="flex-1 btn-primary py-2 text-center text-xs"
                  >
                    Get Started
                  </Link>
                </>
              ) : (
                <button
                  onClick={logout}
                  className="w-full py-2.5 bg-red-600/20 hover:bg-red-600 text-red-400 hover:text-white border border-red-500/40 rounded-xl text-xs font-bold transition-all"
                >
                  Logout Account
                </button>
              )}
            </div>

          </div>
        )}

      </nav>
    </div>
  );
};

export default Navbar;