import React, { useState, useEffect } from "react";
import axios from "axios";
import { useLocation } from "react-router-dom";
import {
  FaQuestionCircle,
  FaUpload,
  FaBookOpen,
  FaFileAlt,
  FaRegLightbulb,
  FaSpinner,
  FaCheckCircle,
  FaTimesCircle,
  FaArrowRight,
  FaRedo,
} from "react-icons/fa";
import { HiSparkles } from "react-icons/hi";
import { motion, AnimatePresence } from "framer-motion";

const NotebookLMStudio = () => {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const initialCourseId = queryParams.get("courseId") || "";

  // Source state
  const [sourceType, setSourceType] = useState("course"); // 'course', 'upload', 'text'
  const [courses, setCourses] = useState([]);
  const [selectedCourseId, setSelectedCourseId] = useState(initialCourseId);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [notesText, setNotesText] = useState("");

  // Quiz Options
  const [quizDifficulty, setQuizDifficulty] = useState("Medium");
  const [quizNumQuestions, setQuizNumQuestions] = useState(5);

  // Quiz Data State
  const [quizData, setQuizData] = useState(null);

  // Loading & Error States
  const [loadingQuiz, setLoadingQuiz] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // --- QUIZ RUNNER STATE ---
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState({});
  const [showHint, setShowHint] = useState(false);
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [score, setScore] = useState(0);

  // Fetch courses on mount
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const res = await axios.get("http://localhost:5500/api/courses");
        if (Array.isArray(res.data)) {
          setCourses(res.data);
          if (!selectedCourseId && res.data.length > 0) {
            setSelectedCourseId(res.data[0]._id);
          }
        }
      } catch (err) {
        console.error("Error fetching courses:", err);
      }
    };
    fetchCourses();
  }, []);

  // Build payload for request
  const createPayload = () => {
    setErrorMsg("");
    if (sourceType === "upload") {
      if (!uploadedFile) {
        setErrorMsg("Please choose a PDF, DOCX, or TXT file to upload.");
        return null;
      }
      const formData = new FormData();
      formData.append("document", uploadedFile);
      return { isFormData: true, body: formData };
    } else if (sourceType === "course") {
      if (!selectedCourseId) {
        setErrorMsg("Please select a course from the list (or choose Upload File / Paste Notes).");
        return null;
      }
      return { isFormData: false, body: { courseId: selectedCourseId } };
    } else {
      if (!notesText.trim()) {
        setErrorMsg("Please enter text notes or study material.");
        return null;
      }
      return { isFormData: false, body: { notesText: notesText.trim() } };
    }
  };

  // Generate Quiz API Call
  const handleGenerateQuiz = async () => {
    setErrorMsg("");
    setLoadingQuiz(true);
    setQuizSubmitted(false);
    setUserAnswers({});
    setCurrentQuestionIndex(0);
    setShowHint(false);

    try {
      let res;
      if (sourceType === "upload") {
        if (!uploadedFile) {
          setErrorMsg("Please select a file to upload.");
          setLoadingQuiz(false);
          return;
        }
        const formData = new FormData();
        formData.append("document", uploadedFile);
        formData.append("difficulty", quizDifficulty);
        formData.append("numQuestions", quizNumQuestions);
        res = await axios.post("http://localhost:5500/api/notebook/quiz", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      } else {
        const payload = createPayload();
        if (!payload) {
          setLoadingQuiz(false);
          return;
        }
        const quizBody = {
          ...payload.body,
          difficulty: quizDifficulty,
          numQuestions: quizNumQuestions,
        };
        res = await axios.post("http://localhost:5500/api/notebook/quiz", quizBody);
      }
      setQuizData(res.data.data);
    } catch (err) {
      console.error("Quiz API Error:", err);
      setErrorMsg(err.response?.data?.message || err.message || "Failed to generate Quiz.");
    } finally {
      setLoadingQuiz(false);
    }
  };

  // Quiz Option Click
  const handleSelectOption = (qId, optionIdx) => {
    if (quizSubmitted) return;
    setUserAnswers((prev) => ({ ...prev, [qId]: optionIdx }));
  };

  // Submit Quiz
  const handleSubmitQuiz = () => {
    if (!quizData?.questions) return;
    let correctCount = 0;
    quizData.questions.forEach((q) => {
      if (userAnswers[q.id] === q.correctAnswerIndex) {
        correctCount += 1;
      }
    });
    setScore(correctCount);
    setQuizSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-slate-950/40 text-slate-100 px-4 py-8 max-w-7xl mx-auto pt-28">
      {/* Header Banner */}
      <div className="relative glass-card p-6 md:p-8 mb-8 border border-cyan-500/30 overflow-hidden shadow-[0_0_50px_rgba(56,189,248,0.15)]">
        <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
          <FaQuestionCircle className="text-9xl text-cyan-400" />
        </div>
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/20 border border-cyan-400/40 text-cyan-300 text-xs font-semibold uppercase tracking-wider mb-2">
              <HiSparkles className="animate-spin text-cyan-400" /> Quiz AI Generator
            </div>
            <h1 className="text-3xl md:text-5xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-white via-cyan-200 to-sky-400">
              Quiz AI
            </h1>
            <p className="text-slate-300 text-sm md:text-base mt-1 max-w-2xl">
              Transform course materials and documents into interactive AI-generated knowledge quizzes. Test your understanding instantly.
            </p>
          </div>
        </div>
      </div>

      {/* STEP 1: SOURCE SELECTION BOX */}
      <div className="glass-card p-6 mb-8 border border-cyan-500/30 shadow-lg">
        <h2 className="text-xl font-bold text-cyan-400 mb-4 flex items-center gap-2">
          <span className="w-7 h-7 rounded-full bg-cyan-500/20 text-cyan-300 flex items-center justify-center text-sm font-bold border border-cyan-400/30">1</span>
          Select Source Content
        </h2>

        {/* Source Mode Tabs */}
        <div className="grid grid-cols-3 gap-2 p-1 bg-slate-950/80 rounded-xl mb-6 border border-white/10">
          <button
            onClick={() => setSourceType("course")}
            className={`py-2.5 px-3 text-sm font-semibold rounded-lg transition-all flex items-center justify-center gap-2 ${
              sourceType === "course" ? "bg-gradient-to-r from-sky-500 to-blue-600 text-white shadow-md font-bold" : "text-slate-300 hover:text-white"
            }`}
          >
            <FaBookOpen /> Choose Course
          </button>

          <button
            onClick={() => setSourceType("upload")}
            className={`py-2.5 px-3 text-sm font-semibold rounded-lg transition-all flex items-center justify-center gap-2 ${
              sourceType === "upload" ? "bg-gradient-to-r from-sky-500 to-blue-600 text-white shadow-md font-bold" : "text-slate-300 hover:text-white"
            }`}
          >
            <FaUpload /> Upload File
          </button>

          <button
            onClick={() => setSourceType("text")}
            className={`py-2.5 px-3 text-sm font-semibold rounded-lg transition-all flex items-center justify-center gap-2 ${
              sourceType === "text" ? "bg-gradient-to-r from-sky-500 to-blue-600 text-white shadow-md font-bold" : "text-slate-300 hover:text-white"
            }`}
          >
            <FaFileAlt /> Paste Notes
          </button>
        </div>

        {/* Dynamic Source Input */}
        <div>
          {sourceType === "course" && (
            <div>
              <label className="block text-sm text-slate-300 mb-2 font-medium">Select from platform courses:</label>
              <select
                value={selectedCourseId}
                onChange={(e) => setSelectedCourseId(e.target.value)}
                className="w-full bg-slate-950/80 border border-cyan-500/30 text-white rounded-xl p-3 outline-none focus:ring-2 focus:ring-cyan-400"
              >
                {courses.length === 0 ? (
                  <option value="">No courses created yet (Switch to Upload File or Paste Notes)</option>
                ) : (
                  courses.map((c) => (
                    <option key={c._id} value={c._id}>
                      {c.title} ({c.category || "General"})
                    </option>
                  ))
                )}
              </select>
            </div>
          )}

          {sourceType === "upload" && (
            <div>
              <label className="block text-sm text-slate-300 mb-2 font-medium">Upload study material (PDF, DOCX, TXT):</label>
              <div className="border-2 border-dashed border-cyan-500/40 hover:border-cyan-400 rounded-2xl p-6 text-center bg-slate-950/50 cursor-pointer relative transition-all">
                <input
                  type="file"
                  accept=".pdf,.docx,.txt"
                  onChange={(e) => setUploadedFile(e.target.files[0])}
                  className="absolute inset-0 opacity-0 cursor-pointer"
                />
                <FaUpload className="text-3xl text-cyan-400 mx-auto mb-2" />
                {uploadedFile ? (
                  <p className="text-cyan-300 font-semibold">{uploadedFile.name}</p>
                ) : (
                  <p className="text-slate-400 text-sm">Drag and drop or click to browse document</p>
                )}
              </div>
            </div>
          )}

          {sourceType === "text" && (
            <div>
              <label className="block text-sm text-slate-300 mb-2 font-medium">Paste course summary, lecture notes, or study topic:</label>
              <textarea
                rows={4}
                value={notesText}
                onChange={(e) => setNotesText(e.target.value)}
                placeholder="Paste your study notes or concept outline here..."
                className="w-full bg-slate-950/80 border border-cyan-500/30 text-white rounded-xl p-3 outline-none focus:ring-2 focus:ring-cyan-400"
              />
            </div>
          )}
        </div>

        {errorMsg && (
          <div className="mt-4 p-3 bg-red-900/40 border border-red-500/50 rounded-xl text-red-300 text-sm flex items-center gap-2">
            <FaTimesCircle /> {errorMsg}
          </div>
        )}
      </div>

      {/* QUIZ GENERATION SECTION */}
      <div className="space-y-6">
        {!quizData ? (
          <div className="glass-card p-8 md:p-12 border border-cyan-500/30">
            <div className="max-w-xl mx-auto text-center space-y-6">
              <FaQuestionCircle className="text-6xl text-cyan-400 mx-auto opacity-80 animate-bounce" />
              <h3 className="text-2xl font-bold text-white">Generate Interactive Quiz</h3>
              <p className="text-slate-300 text-sm">
                Test your understanding with automated AI quiz questions generated directly from your chosen study source.
              </p>

              <div className="grid grid-cols-2 gap-4 text-left">
                <div>
                  <label className="block text-xs text-slate-300 mb-1 font-semibold">Difficulty Level</label>
                  <select
                    value={quizDifficulty}
                    onChange={(e) => setQuizDifficulty(e.target.value)}
                    className="w-full bg-slate-950/80 border border-cyan-500/30 text-white rounded-xl p-3 outline-none focus:ring-2 focus:ring-cyan-400"
                  >
                    <option value="Easy">Easy</option>
                    <option value="Medium">Medium</option>
                    <option value="Hard">Hard</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs text-slate-300 mb-1 font-semibold">Number of Questions</label>
                  <select
                    value={quizNumQuestions}
                    onChange={(e) => setQuizNumQuestions(parseInt(e.target.value))}
                    className="w-full bg-slate-950/80 border border-cyan-500/30 text-white rounded-xl p-3 outline-none focus:ring-2 focus:ring-cyan-400"
                  >
                    <option value={3}>3 Questions</option>
                    <option value={5}>5 Questions</option>
                    <option value={10}>10 Questions</option>
                  </select>
                </div>
              </div>

              <button
                onClick={handleGenerateQuiz}
                disabled={loadingQuiz}
                className="btn-primary py-3 px-8 text-base font-bold flex items-center gap-3 mx-auto disabled:opacity-50"
              >
                {loadingQuiz ? (
                  <>
                    <FaSpinner className="animate-spin text-xl" /> Creating Quiz...
                  </>
                ) : (
                  <>
                    <HiSparkles /> Start Interactive Quiz
                  </>
                )}
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Quiz Header Bar */}
            <div className="glass-card p-6 border border-cyan-500/30 flex items-center justify-between">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-cyan-300 bg-cyan-500/20 px-3 py-1 rounded-full border border-cyan-400/30">
                  {quizData.difficulty || quizDifficulty} Quiz • {quizData.topic || "Knowledge Test"}
                </span>
                <h2 className="text-2xl font-bold mt-2 text-white">{quizData.title}</h2>
              </div>
              <button
                onClick={handleGenerateQuiz}
                disabled={loadingQuiz}
                className="btn-secondary text-xs py-2 px-4 flex items-center gap-2"
              >
                <FaRedo /> New Quiz
              </button>
            </div>

            {!quizSubmitted ? (
              /* Question Runner Card */
              <div className="glass-card p-6 md:p-8 border border-cyan-500/30 relative">
                {/* Stepper Progress */}
                <div className="flex items-center justify-between mb-6 border-b border-white/10 pb-4">
                  <span className="text-sm font-semibold text-cyan-400">
                    Question {currentQuestionIndex + 1} of {quizData.questions?.length || 0}
                  </span>
                  <div className="flex gap-1">
                    {quizData.questions?.map((_, idx) => (
                      <div
                        key={idx}
                        className={`h-2 rounded-full transition-all ${
                          idx === currentQuestionIndex
                            ? "w-8 bg-cyan-400"
                            : userAnswers[quizData.questions[idx].id] !== undefined
                            ? "w-4 bg-sky-600"
                            : "w-2 bg-slate-700"
                        }`}
                      />
                    ))}
                  </div>
                </div>

                {/* Question Title */}
                <h3 className="text-xl md:text-2xl font-bold mb-6 text-white">
                  {quizData.questions?.[currentQuestionIndex]?.question}
                </h3>

                {/* Answer Options */}
                <div className="space-y-3 mb-6">
                  {quizData.questions?.[currentQuestionIndex]?.options?.map((opt, optIdx) => {
                    const qId = quizData.questions[currentQuestionIndex].id;
                    const isSelected = userAnswers[qId] === optIdx;
                    return (
                      <div
                        key={optIdx}
                        onClick={() => handleSelectOption(qId, optIdx)}
                        className={`p-4 rounded-xl cursor-pointer transition-all border flex items-center justify-between ${
                          isSelected
                            ? "bg-cyan-500/20 border-cyan-400 font-semibold shadow-[0_0_15px_rgba(56,189,248,0.2)] text-white"
                            : "bg-slate-950/60 border-white/10 hover:border-white/30 text-slate-300"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <span
                            className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold border ${
                              isSelected
                                ? "bg-cyan-400 text-black border-cyan-300"
                                : "bg-slate-800 text-slate-400 border-white/10"
                            }`}
                          >
                            {String.fromCharCode(65 + optIdx)}
                          </span>
                          <span className="text-sm md:text-base">{opt}</span>
                        </div>
                        {isSelected && <FaCheckCircle className="text-cyan-400" />}
                      </div>
                    );
                  })}
                </div>

                {/* Hint Toggle */}
                {quizData.questions?.[currentQuestionIndex]?.hint && (
                  <div className="mb-6">
                    <button
                      onClick={() => setShowHint((prev) => !prev)}
                      className="text-xs text-cyan-400 flex items-center gap-1.5 hover:underline"
                    >
                      <FaRegLightbulb /> {showHint ? "Hide Hint" : "Need a Hint?"}
                    </button>
                    {showHint && (
                      <div className="mt-2 p-3 rounded-lg bg-cyan-500/10 border border-cyan-400/30 text-xs text-cyan-200">
                        💡 <strong>Hint:</strong> {quizData.questions[currentQuestionIndex].hint}
                      </div>
                    )}
                  </div>
                )}

                {/* Stepper Navigation */}
                <div className="flex items-center justify-between pt-4 border-t border-white/10">
                  <button
                    onClick={() => {
                      setShowHint(false);
                      setCurrentQuestionIndex((prev) => Math.max(0, prev - 1));
                    }}
                    disabled={currentQuestionIndex === 0}
                    className="btn-secondary text-xs py-2.5 px-5 disabled:opacity-40"
                  >
                    Previous
                  </button>

                  {currentQuestionIndex + 1 < (quizData.questions?.length || 0) ? (
                    <button
                      onClick={() => {
                        setShowHint(false);
                        setCurrentQuestionIndex((prev) => prev + 1);
                      }}
                      className="btn-primary text-xs py-2.5 px-6 flex items-center gap-2"
                    >
                      Next <FaArrowRight />
                    </button>
                  ) : (
                    <button
                      onClick={handleSubmitQuiz}
                      className="bg-gradient-to-r from-sky-500 to-blue-600 text-white font-bold py-2.5 px-8 rounded-xl hover:brightness-110 shadow-[0_0_20px_rgba(56,189,248,0.4)] text-xs"
                    >
                      Submit Quiz
                    </button>
                  )}
                </div>
              </div>
            ) : (
              /* Quiz Score & Results Breakdown */
              <div className="glass-card p-8 border border-cyan-500/40 text-center space-y-8">
                <div className="max-w-md mx-auto">
                  <div className="w-28 h-28 rounded-full bg-cyan-500/20 border-4 border-cyan-400 mx-auto flex items-center justify-center text-3xl font-black text-cyan-300 shadow-[0_0_30px_rgba(56,189,248,0.4)] mb-4">
                    {Math.round((score / (quizData.questions?.length || 1)) * 100)}%
                  </div>
                  <h3 className="text-3xl font-extrabold text-white">Quiz Completed!</h3>
                  <p className="text-slate-300 text-sm mt-1">
                    You answered <strong className="text-cyan-400">{score}</strong> out of{" "}
                    <strong>{quizData.questions?.length || 0}</strong> questions correctly.
                  </p>
                </div>

                {/* Detailed Answers Review */}
                <div className="text-left space-y-4 max-w-3xl mx-auto">
                  <h4 className="text-lg font-bold text-cyan-400 border-b border-white/10 pb-2">Answer Breakdown</h4>
                  {quizData.questions?.map((q, idx) => {
                    const userAns = userAnswers[q.id];
                    const isCorrect = userAns === q.correctAnswerIndex;
                    return (
                      <div
                        key={idx}
                        className={`p-4 rounded-xl border ${
                          isCorrect ? "bg-green-950/30 border-green-500/40" : "bg-red-950/30 border-red-500/40"
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <h5 className="font-semibold text-white text-sm">
                            {idx + 1}. {q.question}
                          </h5>
                          {isCorrect ? (
                            <span className="text-xs font-bold text-green-400 flex items-center gap-1">
                              <FaCheckCircle /> Correct
                            </span>
                          ) : (
                            <span className="text-xs font-bold text-red-400 flex items-center gap-1">
                              <FaTimesCircle /> Incorrect
                            </span>
                          )}
                        </div>

                        <p className="text-xs text-slate-300">
                          <strong>Your Answer:</strong>{" "}
                          {userAns !== undefined ? q.options[userAns] : "Not Answered"}
                        </p>
                        {!isCorrect && (
                          <p className="text-xs text-green-400 mt-0.5">
                            <strong>Correct Answer:</strong> {q.options[q.correctAnswerIndex]}
                          </p>
                        )}
                        <p className="text-xs text-slate-400 mt-2 italic">💡 {q.explanation}</p>
                      </div>
                    );
                  })}
                </div>

                <button
                  onClick={() => {
                    setQuizSubmitted(false);
                    setUserAnswers({});
                    setCurrentQuestionIndex(0);
                  }}
                  className="btn-primary py-3 px-8 text-sm font-bold flex items-center gap-2 mx-auto"
                >
                  <FaRedo /> Retake Quiz
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default NotebookLMStudio;
