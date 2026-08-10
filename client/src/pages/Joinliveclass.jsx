import { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import DailyIframe from "@daily-co/daily-js";
import axios from "axios";
import { API_BASE_URL } from "../config/apiConfig";
import { FaTrash } from "react-icons/fa";

const JoinLiveClass = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  const containerRef = useRef(null);
  const callFrameRef = useRef(null);

  const [liveClass, setLiveClass] = useState(null);
  const [joined, setJoined] = useState(false);

  const getClass = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/api/liveclasses/${id}`);
      setLiveClass(res.data);
    } catch (error) {
      alert(error.response?.data?.message || "Load failed");
    }
  };

  const handleDeleteClass = async () => {
    if (!window.confirm("Are you sure you want to delete this live class link?")) return;
    try {
      await axios.delete(`${API_BASE_URL}/api/liveclasses/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      alert("Live class deleted successfully");
      navigate("/live-classes");
    } catch (error) {
      alert(error.response?.data?.message || "Failed to delete live class");
    }
  };

  const isTeacherOrAdmin =
    user?.role === "admin" ||
    user?.role === "instructor" ||
    user?.role === "teacher" ||
    user?.role === "Teacher";

  useEffect(() => {
    getClass();

    return () => {
      if (callFrameRef.current) {
        callFrameRef.current.destroy();
      }
    };
  }, [id]);

  const joinMeeting = () => {
    if (!liveClass?.roomUrl) {
      alert("Meeting room not found");
      return;
    }

    const callFrame = DailyIframe.createFrame(
      containerRef.current,
      {
        iframeStyle: {
          width: "100%",
          height: "700px",
          border: "0",
          borderRadius: "16px",
        },

        showLeaveButton: true,
        showFullscreenButton: true,
      }
    );

    callFrame.join({
      url: liveClass.roomUrl,
    });

    callFrameRef.current = callFrame;

    setJoined(true);
  };

  const leaveMeeting = async () => {
    if (callFrameRef.current) {
      await callFrameRef.current.leave();

      callFrameRef.current.destroy();

      callFrameRef.current = null;

      setJoined(false);
    }
  };

  if (!liveClass) {
    return (
      <h2 className="text-center py-20 text-accent">
        Loading classroom...
      </h2>
    );
  }

  return (
    <div className="min-h-screen bg-black/40 py-8 px-6 pt-24">
      <div className="max-w-7xl mx-auto">
        <div className="glass-card p-6 rounded-2xl shadow-lg mb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border border-cyan-500/30">
          <div>
            <h1 className="text-3xl font-bold text-cyan-300 mb-2">
              {liveClass.title}
            </h1>

            <p className="text-slate-200 mb-1">
              <b>Subject:</b> {liveClass.subject}
            </p>

            <p className="text-slate-200 mb-1">
              <b>Teacher:</b> {liveClass.instructorName}
            </p>

            <p className="text-slate-300">
              <b>Schedule:</b> {liveClass.date} at {liveClass.time}
            </p>
          </div>

          <div className="flex gap-3 items-center">
            {!joined ? (
              <button
                onClick={joinMeeting}
                className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-6 py-3 rounded-xl shadow-lg transition-all"
              >
                Join Meeting
              </button>
            ) : (
              <button
                onClick={leaveMeeting}
                className="bg-amber-600 hover:bg-amber-500 text-white font-bold px-6 py-3 rounded-xl shadow-lg transition-all"
              >
                Leave Meeting
              </button>
            )}

            {isTeacherOrAdmin && (
              <button
                onClick={handleDeleteClass}
                className="bg-rose-600/30 hover:bg-rose-600 border border-rose-500/50 text-rose-300 hover:text-white px-5 py-3 rounded-xl font-bold transition-all flex items-center gap-2"
                title="Delete Live Class"
              >
                <FaTrash /> Delete Class
              </button>
            )}
          </div>
        </div>

        <div
          ref={containerRef}
          className="bg-black rounded-2xl min-h-[700px]"
        ></div>
      </div>
    </div>
  );
};

export default JoinLiveClass;