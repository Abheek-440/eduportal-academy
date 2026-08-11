import { Link } from "react-router-dom";
import { useState } from "react";
import { getImageUrl, handleImageError } from "../utils/imageUtils";

const CourseCard = ({ course, onDelete }) => {
  const [activeImage, setActiveImage] = useState(0);
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const canDelete = (user.role === "admin" || user.role === "instructor" || user.role === "teacher") && user.role !== "student";

  return (
    <div className="glass-card rounded-2xl shadow-md hover:shadow-2xl transition duration-300 overflow-hidden border border-cyan-500/30 group hover:border-cyan-400/60">

      {/* Image */}
      <div className="relative bg-slate-950/80 w-full h-52 overflow-hidden flex items-center justify-center">
        <img
          src={getImageUrl(course.images?.[activeImage])}
          onError={handleImageError}
          alt={course.title || "Course image"}
          className="max-w-full max-h-full object-contain group-hover:scale-105 transition-transform duration-300"
        />

        <span className="absolute top-3 left-3 bg-gradient-to-r from-sky-500 to-blue-600 text-white text-xs px-3.5 py-1 rounded-full font-bold shadow-md">
          ₹{course.price}
        </span>
      </div>

      {/* Thumbnails */}
      {course.images?.length > 1 && (
        <div className="flex gap-2 p-3 overflow-x-auto bg-slate-900/40 border-b border-white/5">
          {course.images.map((img, i) => (
            <img
              key={i}
              src={getImageUrl(img)}
              onError={handleImageError}
              onMouseEnter={() => setActiveImage(i)}
              className={`w-14 h-14 rounded-md object-contain bg-slate-950 p-0.5 cursor-pointer border 
              ${activeImage === i ? "border-cyan-400" : "border-white/10"}`}
            />
          ))}
        </div>
      )}

      {/* Content */}
      <div className="p-4">
        <h2 className="font-bold text-lg text-slate-100 group-hover:text-cyan-300 transition-colors line-clamp-1">
          {course.title}
        </h2>

        <p className="text-sm text-slate-300 mt-1">👨‍🏫 {course.instructor}</p>
        <p className="text-sm text-slate-300 mb-3">⏱ {course.duration}</p>

        <span className="text-xs bg-cyan-950/60 border border-cyan-400/40 text-cyan-300 px-3 py-1 rounded-full font-semibold">
          {course.category}
        </span>

        <div className="flex gap-2 mt-4">
          <Link
            to={`/course/${course._id}`}
            className="flex-1 text-center bg-gradient-to-r from-sky-500 to-blue-600 text-white py-2 rounded-xl font-semibold hover:shadow-[0_0_15px_rgba(56,189,248,0.4)] transition-all"
          >
            View
          </Link>

          {canDelete && (
            <button
              onClick={() => onDelete(course._id)}
              className="flex-1 bg-red-600/80 hover:bg-red-600 text-white py-2 rounded-xl font-semibold transition-all"
            >
              Delete
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default CourseCard;