import { useState } from "react";
import axios from "axios";
import { FaFileUpload, FaRobot } from "react-icons/fa";

const Atsanalyzer = () => {
  const [resume, setResume] = useState(null);
  const [report, setReport] = useState("");
  const [loading, setLoading] = useState(false);

  const analyzeResume = async (e) => {
    e.preventDefault();

    if (!resume) {
      alert("Please select a resume file first.");
      return;
    }

    const formData = new FormData();
    formData.append("resume", resume);

    try {
      setLoading(true);
      setReport("");

      const res = await axios.post(
        "http://localhost:5500/api/ats/analyze",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      setReport(res.data.report);
    } catch (error) {
      const errorMsg =
        error.response?.data?.message ||
        error.response?.data?.error ||
        error.message ||
        "Resume analysis failed. Please try again.";
      alert(`Error: ${errorMsg}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-cover bg-center flex justify-center pt-32 px-4 pb-16">
      <div className="w-full max-w-4xl glass-card border border-cyan-500/30 rounded-2xl p-8 text-slate-100 shadow-[0_0_30px_rgba(56,189,248,0.2)]">
        <div className="text-center mb-8">
          <FaRobot className="text-5xl text-cyan-400 mx-auto mb-3 animate-pulse" />
          <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white via-cyan-200 to-sky-400">
            AI Document & Resume Analyzer
          </h1>
          <p className="text-slate-300 mt-2">
            Upload any PDF or DOCX document (resume, admit card, report, or study material) for detailed AI analysis.
          </p>
        </div>

        <form onSubmit={analyzeResume} className="space-y-6">
          <label className="border-2 border-dashed border-cyan-500/40 hover:border-cyan-400 transition-colors rounded-2xl p-10 flex flex-col items-center cursor-pointer bg-slate-950/50">
            <FaFileUpload className="text-5xl text-cyan-400 mb-3" />
            <p className="text-slate-200 font-semibold text-lg">
              {resume ? "Change Document File" : "Upload Document (PDF / DOCX)"}
            </p>
            <input
              type="file"
              accept=".pdf,.docx,.txt"
              onChange={(e) => setResume(e.target.files[0])}
              className="hidden"
            />
            {resume && (
              <p className="mt-3 text-cyan-300 font-semibold bg-cyan-500/15 px-4 py-1.5 rounded-full border border-cyan-400/40 shadow-[0_0_12px_rgba(56,189,248,0.2)]">
                📄 {resume.name}
              </p>
            )}
          </label>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-sky-500 to-blue-600 text-white font-bold py-4 rounded-xl hover:from-sky-400 hover:to-blue-500 transition-colors duration-200 disabled:bg-slate-800 disabled:text-slate-500 disabled:cursor-not-allowed shadow-[0_0_20px_rgba(56,189,248,0.3)] hover:shadow-[0_0_30px_rgba(56,189,248,0.5)]"
          >
            {loading ? "Analyzing document contents, please wait..." : "Analyze Document"}
          </button>
        </form>

        {report && (
          <div className="mt-8 bg-slate-950/60 border border-cyan-500/30 rounded-2xl p-6 shadow-inner animate-slide-up">
            <h2 className="text-2xl font-bold text-cyan-400 mb-4 border-b border-cyan-500/20 pb-2">
              ATS Analysis Report
            </h2>
            <pre className="whitespace-pre-wrap text-slate-200 font-sans leading-7 text-base">
              {report}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
};

export default Atsanalyzer;
