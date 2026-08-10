import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { FaBrain, FaRobot, FaFileAlt } from "react-icons/fa";
import { HiSparkles } from "react-icons/hi";
import NotebookLMStudio from "./NotebookLMStudio";
import CourseChatbot from "./CourseChatbot";
import Atsanalyzer from "./Atsanalyzer";

const AI_FEATURES = [
  {
    id: "notebooklm",
    name: "Quiz AI",
    tagline: "AI-Generated Interactive Knowledge Quizzes",
    icon: FaBrain,
    color: "from-cyan-500 to-blue-600",
    badge: "Quiz Generator"
  },
  {
    id: "aibot",
    name: "AI Course Bot",
    tagline: "Interactive Course & Learning Assistant",
    icon: FaRobot,
    color: "from-purple-500 to-indigo-600",
    badge: "Conversational"
  },
  {
    id: "resume",
    name: "Resume & Document Analyzer",
    tagline: "Instant Document & Resume Evaluation",
    icon: FaFileAlt,
    color: "from-emerald-500 to-teal-600",
    badge: "ATS Smart"
  }
];

const AIFeatures = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const initialFeature = searchParams.get("feature") || "notebooklm";
  const [selectedFeature, setSelectedFeature] = useState(
    AI_FEATURES.some((f) => f.id === initialFeature) ? initialFeature : "notebooklm"
  );

  useEffect(() => {
    const featureParam = searchParams.get("feature");
    if (featureParam && AI_FEATURES.some((f) => f.id === featureParam)) {
      setSelectedFeature(featureParam);
    }
  }, [searchParams]);

  const handleSelectFeature = (featureId) => {
    setSelectedFeature(featureId);
    setSearchParams({ feature: featureId });
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 pb-20 pt-24 px-4 sm:px-6">
      {/* Top Banner & Control Center */}
      <div className="max-w-7xl mx-auto mb-8">
        <div className="relative glass-card p-6 md:p-8 rounded-3xl border border-cyan-500/30 overflow-hidden shadow-[0_0_50px_rgba(56,189,248,0.15)]">
          {/* Ambient Glow */}
          <div className="absolute -top-24 -right-24 w-96 h-96 bg-cyan-500/20 rounded-full blur-3xl pointer-events-none"></div>
          <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl pointer-events-none"></div>

          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-cyan-500/20 border border-cyan-400/40 text-cyan-300 text-xs font-bold uppercase tracking-wider mb-3">
                <HiSparkles className="animate-spin text-cyan-400 text-sm" />
                EduPortal AI Hub
              </div>
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-white via-cyan-100 to-sky-400 tracking-tight">
                AI Features Suite
              </h1>
              <p className="text-slate-300 text-sm sm:text-base mt-2 max-w-2xl leading-relaxed">
                Explore our suite of intelligent AI tools: Quiz AI for generating interactive knowledge quizzes from your study material, AI Course Bot for instant course recommendations, and Resume Analyzer for document evaluation.
              </p>
            </div>
          </div>

          {/* Feature Selection Cards / Navigation Bar */}
          <div className="mt-8 pt-6 border-t border-white/10 grid grid-cols-1 md:grid-cols-3 gap-4">
            {AI_FEATURES.map((feature) => {
              const Icon = feature.icon;
              const isSelected = feature.id === selectedFeature;

              return (
                <button
                  key={feature.id}
                  onClick={() => handleSelectFeature(feature.id)}
                  className={`flex items-center gap-4 p-4 rounded-2xl border text-left transition-all duration-300 ${
                    isSelected
                      ? "bg-slate-900/90 border-cyan-400 shadow-[0_0_25px_rgba(56,189,248,0.3)] scale-[1.02]"
                      : "bg-slate-900/40 border-white/10 hover:border-white/25 hover:bg-slate-900/70"
                  }`}
                >
                  <div
                    className={`w-12 h-12 rounded-xl flex items-center justify-center bg-gradient-to-br ${feature.color} text-white shadow-md flex-shrink-0`}
                  >
                    <Icon className="text-2xl" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-1">
                      <span className={`font-bold text-base truncate ${isSelected ? "text-cyan-300" : "text-slate-200"}`}>
                        {feature.name}
                      </span>
                      {isSelected && (
                        <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-ping"></span>
                      )}
                    </div>
                    <p className="text-slate-400 text-xs truncate mt-1">{feature.tagline}</p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Selected Feature Content Display Area */}
      <div className="max-w-7xl mx-auto">
        <AnimatePresence mode="wait">
          <motion.div
            key={selectedFeature}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.25 }}
          >
            {selectedFeature === "notebooklm" && <NotebookLMStudio />}
            {selectedFeature === "aibot" && <CourseChatbot />}
            {selectedFeature === "resume" && <Atsanalyzer />}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};

export default AIFeatures;
