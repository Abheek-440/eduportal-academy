import { Link } from "react-router-dom";
import { useState } from "react";

const CourseCard = ({ course, onDelete }) => {
  const [activeImage, setActiveImage] = useState(0);
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const canDelete = (user.role === "admin" || user.role === "instructor" || user.role === "teacher") && user.role !== "student";

  return (
    <div className="glass-card rounded-2xl shadow-md hover:shadow-2xl transition duration-300 overflow-hidden border border-cyan-500/30 group hover:border-cyan-400/60">

      {/* Image */}
      <div className="relative">
        <img
          src={
            course.images?.[activeImage]
              ? `http://localhost:5500/uploads/${course.images[activeImage]}`
              : "https://via.placeholder.com/400x200?text=No+Image+Available"
          }
          onError={(e) => {
            e.target.src = "https://via.placeholder.com/400x200?text=Image+Not+Found";
          }}
          className="w-full h-52 object-cover group-hover:scale-105 transition"
        />

        <span className="absolute top-3 left-3 bg-gradient-to-r from-sky-500 to-blue-600 text-white text-xs px-3.5 py-1 rounded-full font-bold shadow-md">
          ₹{course.price}
        </span>
      </div>

      {/* Thumbnails */}
      {course.images?.length > 1 && (
        <div className="flex gap-2 p-3 overflow-x-auto">
          {course.images.map((img, i) => (
            <img
              key={i}
              src={`http://localhost:5500/uploads/${img}`}
              onMouseEnter={() => setActiveImage(i)}
              className={`w-14 h-14 rounded-md object-cover cursor-pointer border 
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