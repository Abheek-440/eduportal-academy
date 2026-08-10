import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";

import Navbar from "./components/Navbar";

import Home from "./pages/Home";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Feature from "./pages/Feauture";

import AddCourse from "./pages/Addcourse";
import EditCourse from "./pages/Editcourse";
import SingleCourse from "./pages/Singelcourse";

import Register from "./pages/Register";
import VerifyOtp from "./pages/VerifyOtp";
import Login from "./pages/Login";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import AdminDashboard from "./pages/AdminDashboard";
import InstructorDashboard from "./pages/InstructorDashboard";
import StudentDashboard from "./pages/StudentDashboard";
import LiveClasses from "./pages/Liveclasses";
import Createliveclass from "./pages/Createliveclass";
import JoinLiveClass from "./pages/Joinliveclass";
import ChatPage from "./pages/Chatpage";
import CourseChatbot from "./pages/CourseChatbot";
import Atsanalyzer from "./pages/Atsanalyzer";
import NotebookLMStudio from "./pages/NotebookLMStudio";
import AIFeatures from "./pages/AIFeatures";
import { useState, useEffect } from "react";

// Brand Logo formed by two overlapping tilted rotating rhombuses
const BrandLogo = () => (
  <div className="relative w-20 h-20 mb-5">
    {/* Rhombus 1 rotating clockwise */}
    <motion.div
      animate={{ rotate: 360 }}
      transition={{ duration: 18, ease: "linear", repeat: Infinity }}
      className="absolute inset-0 flex items-center justify-center"
    >
      <svg viewBox="0 0 100 100" className="w-full h-full">
        <path
          d="M 50,15 L 85,50 L 50,85 L 15,50 Z"
          fill="none"
          stroke="#38BDF8"
          strokeWidth="4"
          strokeLinejoin="round"
        />
      </svg>
    </motion.div>
    {/* Rhombus 2 rotating counter-clockwise */}
    <motion.div
      animate={{ rotate: -360 }}
      transition={{ duration: 12, ease: "linear", repeat: Infinity }}
      className="absolute inset-0 flex items-center justify-center"
    >
      <svg viewBox="0 0 100 100" className="w-full h-full scale-[0.68]">
        <path
          d="M 50,15 L 85,50 L 50,85 L 15,50 Z"
          fill="none"
          stroke="#0284C7"
          strokeWidth="4.5"
          strokeLinejoin="round"
        />
      </svg>
    </motion.div>
  </div>
);

// Dribbble-style Preloader Transition Curtain
const DribbbleCurtain = () => {
  const [progress, setProgress] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setProgress(0);
    setIsLoaded(false);

    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            setIsLoaded(true);
          }, 180);
          return 100;
        }
        const inc = Math.floor(Math.random() * 8) + 8;
        return Math.min(prev + inc, 100);
      });
    }, 45);

    return () => clearInterval(interval);
  }, []);

  const litCount = Math.floor((progress / 100) * 16);

  // Easing curve for a realistic, premium mechanical door slide
  const doorTransition = { duration: 0.85, ease: [0.77, 0, 0.175, 1] };

  // Shared splitting path for both the clip-paths and the SVG glowing line
  const leftClip = "polygon(0% 0%, 30% 30%, 60% 30%, 45% 70%, 72% 70%, 100% 100%, 0% 100%, 0% 0%)";
  const rightClip = "polygon(0% 0%, 30% 30%, 60% 30%, 45% 70%, 72% 70%, 100% 100%, 100% 0%, 0% 0%)";

  return (
    <div className="fixed inset-0 z-50 pointer-events-none select-none">
      {/* Bottom-Left Door Panel sliding down-left (↙) */}
      <motion.div
        initial={{ x: 0, y: 0 }}
        animate={isLoaded ? { x: "-100%", y: "100%" } : { x: 0, y: 0 }}
        exit={{ x: 0, y: 0 }}
        transition={doorTransition}
        style={{ clipPath: leftClip }}
        className="absolute inset-0 bg-[#060913] pointer-events-auto shadow-[10px_-10px_30px_rgba(0,0,0,0.8)]"
      >
        {/* Glowing Cyan Seam Line (Left side) */}
        <svg
          viewBox="0 0 100 100"
          className="absolute inset-0 w-full h-full pointer-events-none"
          preserveAspectRatio="none"
        >
          <path
            d="M 0,0 L 30,30 L 60,30 L 45,70 L 72,70 L 100,100"
            fill="none"
            stroke="#38BDF8"
            strokeWidth="0.8"
            className="drop-shadow-[0_0_8px_#38bdf8]"
          />
        </svg>
      </motion.div>

      {/* Top-Right Door Panel sliding up-right (↗) */}
      <motion.div
        initial={{ x: 0, y: 0 }}
        animate={isLoaded ? { x: "100%", y: "-100%" } : { x: 0, y: 0 }}
        exit={{ x: 0, y: 0 }}
        transition={doorTransition}
        style={{ clipPath: rightClip }}
        className="absolute inset-0 bg-[#060913] pointer-events-auto shadow-[-10px_10px_30px_rgba(0,0,0,0.8)]"
      >
        {/* Glowing Cyan Seam Line (Right side) */}
        <svg
          viewBox="0 0 100 100"
          className="absolute inset-0 w-full h-full pointer-events-none"
          preserveAspectRatio="none"
        >
          <path
            d="M 0,0 L 30,30 L 60,30 L 45,70 L 72,70 L 100,100"
            fill="none"
            stroke="#38BDF8"
            strokeWidth="0.8"
            className="drop-shadow-[0_0_8px_#38bdf8]"
          />
        </svg>
      </motion.div>

      {/* Centered Loading Overlay (fades out when doors split open) */}
      <motion.div
        initial={{ opacity: 1, scale: 1 }}
        animate={isLoaded ? { opacity: 0, scale: 0.95 } : { opacity: 1, scale: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.45, ease: "easeOut" }}
        className="absolute inset-0 flex flex-col items-center justify-center text-white"
      >
        <BrandLogo />

        {/* 16 Loading Ticks */}
        <div className="flex items-center gap-1 border border-white/10 rounded-full px-3 py-2 bg-black/40 mb-3 shadow-inner">
          {[...Array(16)].map((_, i) => (
            <div
              key={i}
              className={`w-1 h-3 rounded-full transition-all duration-150 ${
                i < litCount
                  ? "bg-[#38BDF8] shadow-[0_0_8px_#38bdf8]"
                  : "bg-white/15"
              }`}
            />
          ))}
        </div>

        {/* Compile text details */}
        <div className="flex items-center gap-2 text-[10px] font-mono font-bold tracking-widest text-slate-300 uppercase">
          <span>Linking</span>
          <motion.span
            animate={{ opacity: [0, 1, 0] }}
            transition={{ repeat: Infinity, duration: 1.2 }}
          >
            ...
          </motion.span>
          <span className="text-[#38BDF8] ml-1">{Math.round(progress)}%</span>
        </div>
      </motion.div>
    </div>
  );
};

// Animated routes wrapper with Dribbble Ticks preloader curtains
const AnimatedRoutes = () => {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <div key={location.pathname} className="relative w-full overflow-hidden">
        
        {/* Full-screen preloader curtain */}
        <DribbbleCurtain />

        {/* Page Content Animation */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1, transition: { duration: 0.3, delay: 0.35 } }}
          exit={{ opacity: 0, transition: { duration: 0.25 } }}
        >
          <Routes location={location}>
            <Route path="/" element={<Home />} />
            
            <Route path="/live-classes" element={<LiveClasses />} />
            <Route path="/create-live-class" element={<Createliveclass />} />
            <Route path="/join-live-class/:id" element={<JoinLiveClass />} />
            <Route path="/chat" element={<ChatPage />} />
            <Route path="/course-chatbot" element={<CourseChatbot />} />
            <Route path="/ats-analyzer" element={<Atsanalyzer />} />
            <Route path="/notebook-lm" element={<NotebookLMStudio />} />
            <Route path="/ai-features" element={<AIFeatures />} />

            <Route path="/add-course" element={<AddCourse />} />
            <Route path="/edit-course/:id" element={<EditCourse />} />
            <Route path="/course/:id" element={<SingleCourse />} />

            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/f" element={<Feature />} />
            <Route path="/admin-dashboard" element={<AdminDashboard />} />
            <Route path="/instructor-dashboard" element={<InstructorDashboard />} />
            <Route path="/teacher-dashboard" element={<InstructorDashboard />} />
            <Route path="/student-dashboard" element={<StudentDashboard />} />
            <Route path="/register" element={<Register />} />
            <Route path="/verify-otp" element={<VerifyOtp />} />
            <Route path="/login" element={<Login />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
          </Routes>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

const App = () => {
  return (
    <BrowserRouter>
      <Navbar />
      <div className="min-h-screen">
        <AnimatedRoutes />
      </div>
    </BrowserRouter>
  );
};

export default App;