import React, { useState, useEffect } from "react";
import axios from "axios";
import { API_BASE_URL } from "../config/apiConfig";
import CourseForm from "../components/Courseform";
import { useNavigate, Link } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import { FaArrowLeft, FaBookOpen } from "react-icons/fa";

const AddCourse = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    title: "",
    instructor: "",
    price: "",
    duration: "",
    category: "",
    description: "",
  });

  const [images, setImages] = useState([]);
  const [previewImages, setPreviewImages] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    const token = localStorage.getItem("token");
    if (!token || user.role === "student") {
      toast.error("Access Denied: Students are not permitted to add courses.");
      setTimeout(() => navigate("/"), 1200);
    }
  }, [navigate]);

  // Handle text input
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Handle file upload + preview
  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    setImages(files);

    const previews = files.map((file) => URL.createObjectURL(file));
    setPreviewImages(previews);
  };

  // Submit
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.title || !formData.instructor || !formData.price) {
      toast.error("Please fill required fields!");
      return;
    }

    try {
      setLoading(true);

      const token = localStorage.getItem("token");

      const data = new FormData();

      // append text fields
      Object.keys(formData).forEach((key) =>
        data.append(key, formData[key])
      );

      // append images
      images.forEach((img) => data.append("images", img));

      await axios.post(
        `${API_BASE_URL}/api/courses`,
        data,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: token, // 🔐 send token
          },
        }
      );

      toast.success("Course added successfully!");

      setTimeout(() => navigate("/"), 1500);
    } catch (error) {
      console.error(error);
      toast.error("Failed to add course!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen py-10 px-4 animate-fade-in">
      <ToastContainer position="top-right" autoClose={3000} />

      <div className="max-w-4xl mx-auto">
        {/* Back */}
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-accent hover:text-primary mb-4 font-medium transition-colors duration-300"
        >
          <FaArrowLeft /> Back to Home
        </Link>

        {/* Hero */}
        <div className="bg-primary border border-accent text-white rounded-2xl p-8 mb-6 shadow-glow text-center relative overflow-hidden">
          <FaBookOpen className="text-4xl mx-auto mb-3" />
          <h2 className="text-3xl font-bold">Add New Course</h2>
          <p className="text-sm opacity-90 mt-2">
            Create and publish a new course
          </p>
        </div>

        {/* Form */}
        <div className="glass-card rounded-2xl shadow-xl p-8">
          <CourseForm
            formData={formData}
            handleChange={handleChange}
            handleSubmit={handleSubmit}
            handelFile={handleFileChange}
            btnText={loading ? "Adding..." : "Add Course"}
          />

          {/* Preview */}
          {previewImages.length > 0 && (
            <div className="mt-6">
              <h3 className="text-lg font-semibold mb-3 text-white">
                Image Preview
              </h3>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {previewImages.map((src, index) => (
                  <div
                    key={index}
                    className="w-full h-32 bg-slate-950/80 rounded-lg border border-cyan-500/30 overflow-hidden flex items-center justify-center p-1 shadow"
                  >
                    <img
                      src={src}
                      alt={`Preview ${index}`}
                      className="max-w-full max-h-full object-contain"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Loader */}
          {loading && (
            <div className="flex justify-center mt-6">
              <div className="w-8 h-8 border-4 border-accent border-t-primary rounded-full animate-spin"></div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AddCourse;