import React, { useEffect, useState } from "react";
import API from "../api/courseApi";
import CourseForm from "../components/Courseform";
import { useNavigate, useParams } from "react-router-dom";

const EditCourse = () => {
  const { id } = useParams();
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
  const [oldImages, setOldImages] = useState([]);
  const [previewImages, setPreviewImages] = useState([]);

  const getSingleCourse = async () => {
    try {
      const res = await API.get(`/${id}`);
      const course = res.data;

      setFormData({
        title: course.title || "",
        instructor: course.instructor || "",
        price: course.price || "",
        duration: course.duration || "",
        category: course.category || "",
        description: course.description || "",
      });

      setOldImages(course.images || []);
    } catch (error) {
      console.log(error);
      alert("Course load failed");
    }
  };

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    const token = localStorage.getItem("token");
    if (!token || user.role === "student") {
      alert("Access Denied: Students are not permitted to edit courses.");
      navigate("/");
      return;
    }
    getSingleCourse();
  }, [id, navigate]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    setImages(files);
    setPreviewImages(files.map((file) => URL.createObjectURL(file)));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const token = localStorage.getItem("token");

      if (!token) {
        alert("Please login first");
        navigate("/login");
        return;
      }

      const data = new FormData();

      Object.keys(formData).forEach((key) => {
        data.append(key, formData[key]);
      });

      images.forEach((img) => {
        data.append("images", img);
      });

      await API.put(`/${id}`, data, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: token,
        },
      });

      alert("Course updated successfully");
      navigate("/");
    } catch (error) {
      console.log(error);

      if (error.response?.status === 401) {
        alert("Session expired. Please login again.");
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        navigate("/login");
      } else {
        alert(error.response?.data?.message || "Update failed");
      }
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h2 className="text-3xl font-bold mb-6 text-center">Edit Course</h2>

      <CourseForm
        formData={formData}
        handleChange={handleChange}
        handleSubmit={handleSubmit}
        handelFile={handleFileChange}
        btnText="Update Course"
      />

      {previewImages.length > 0 ? (
        <div className="mt-6">
          <h3 className="font-bold mb-2">New Images</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {previewImages.map((img, index) => (
              <img
                key={index}
                src={img}
                alt="preview"
                className="w-full h-32 object-cover rounded-lg border"
              />
            ))}
          </div>
        </div>
      ) : (
        oldImages.length > 0 && (
          <div className="mt-6">
            <h3 className="font-bold mb-2">Old Images</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {oldImages.map((img, index) => (
                <img
                  key={index}
                  src={`http://localhost:5500/uploads/${img}`}
                  alt="old"
                  className="w-full h-32 object-cover rounded-lg border"
                />
              ))}
            </div>
          </div>
        )
      )}
    </div>
  );
};

export default EditCourse;