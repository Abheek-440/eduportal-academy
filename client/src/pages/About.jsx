import React from "react";
import Atsanalyzer from "./Atsanalyzer";

const About = () => {
  return (
    <div
      className="min-h-screen bg-cover bg-center flex flex-col items-center pt-32 pb-16"
    >
      <div className="w-[80%] h-fit glass-card border border-cyan-500/30 rounded-2xl p-8 text-slate-100 mb-10 shadow-[0_0_30px_rgba(56,189,248,0.2)]">
        <h1 className="text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white via-cyan-200 to-sky-400 mb-6">About</h1>

        <p className="text-xl leading-8 text-slate-200">
          Eduportal Academy is a modern online learning platform designed to provide
          students with high-quality educational resources, live classes,
          interactive courses, and AI-powered assistance.
        </p>

        <p className="mt-4 text-lg text-slate-300">
          Our mission is to make learning accessible, engaging, and effective
          for everyone. Students can access study materials, participate in
          live sessions, chat with instructors, and enhance their learning
          experience through intelligent tools.
        </p>

        <div className="grid md:grid-cols-3 gap-6 mt-10">
          <div className="bg-slate-950/50 p-5 rounded-xl border border-cyan-500/30 shadow-[0_0_15px_rgba(56,189,248,0.15)]">
            <h3 className="text-2xl text-cyan-400 font-semibold">
              Live Classes
            </h3>
            <p className="mt-2 text-slate-300">
              Attend interactive classes with experienced instructors.
            </p>
          </div>

          <div className="bg-slate-950/50 p-5 rounded-xl border border-cyan-500/30 shadow-[0_0_15px_rgba(56,189,248,0.15)]">
            <h3 className="text-2xl text-cyan-400 font-semibold">
              AI Learning
            </h3>
            <p className="mt-2 text-slate-300">
              Get instant answers and personalized study support.
            </p>
          </div>

          <div className="bg-slate-950/50 p-5 rounded-xl border border-cyan-500/30 shadow-[0_0_15px_rgba(56,189,248,0.15)]">
            <h3 className="text-2xl text-cyan-400 font-semibold">
              Courses
            </h3>
            <p className="mt-2 text-slate-300">
              Learn from structured courses designed by experts.
            </p>
          </div>
        </div>
      </div>

    
    </div>
  );
};

export default About;