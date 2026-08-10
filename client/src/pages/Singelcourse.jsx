import React, { useEffect, useState } from "react";
import API from "../api/courseApi";
import { useParams, Link, useNavigate } from "react-router-dom";
import { FaArrowLeft, FaCreditCard, FaLock, FaCheckCircle } from "react-icons/fa";
import { loadRazorpayScript } from "../utils/loadRazorpay";
import axios from "axios";

const SingleCourse = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [activeImage, setActiveImage] = useState(0);
  const [paying, setPaying] = useState(false);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const currentUser = JSON.parse(localStorage.getItem("user") || "{}");

  const getSingleCourse = async () => {
    try {
      const res = await API.get(`/${id}`);
      setCourse(res.data);

      const token = localStorage.getItem("token");
      if (token) {
        try {
          const dashRes = await axios.get("http://localhost:5500/api/student/dashboard", {
            headers: { Authorization: `Bearer ${token}` },
          });
          const enrolledList = dashRes.data?.enrolledCourses || [];
          const enrolled = enrolledList.some((item) => item.course?._id === id);
          setIsEnrolled(enrolled);
        } catch (e) {
          console.log("Could not fetch student enrollment status:", e);
        }
      }
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    getSingleCourse();
  }, [id]);

  const handlePayment = async () => {
    const token = localStorage.getItem("token");
    const user = JSON.parse(localStorage.getItem("user") || "{}");

    if (!token) {
      alert("Please login first to pay & apply for courses!");
      return;
    }

    try {
      setPaying(true);

      // 1. Create Razorpay order on backend
      const orderRes = await axios.post(
        "http://localhost:5500/api/payment/create-order",
        { courseId: course._id },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Free course bypass
      if (orderRes.data.isFree) {
        alert("🎉 Free Course Enrolled Successfully!");
        setIsEnrolled(true);
        navigate("/student-dashboard");
        return;
      }

      const { keyId, orderId, amount, currency, courseTitle } = orderRes.data;

      // 2. Load Razorpay SDK
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        alert("Failed to load Razorpay SDK. Please check your internet connection.");
        setPaying(false);
        return;
      }

      // 3. Configure Razorpay options
      const options = {
        key: keyId,
        amount: amount,
        currency: currency,
        name: "EduPortal Academy",
        description: `Course Fee: ${courseTitle}`,
        image: "https://cdn-icons-png.flaticon.com/512/2991/2991148.png",
        order_id: orderId,
        handler: async function (response) {
          try {
            // 4. Verify payment on backend
            const verifyRes = await axios.post(
              "http://localhost:5500/api/payment/verify-payment",
              {
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                courseId: course._id,
              },
              { headers: { Authorization: `Bearer ${token}` } }
            );

            if (verifyRes.data.success) {
              alert("💳 Payment successful! You are now enrolled in the course.");
              setIsEnrolled(true);
              navigate("/student-dashboard");
            } else {
              alert("Payment verification failed.");
            }
          } catch (verifyErr) {
            console.error(verifyErr);
            alert(verifyErr.response?.data?.message || "Payment verification failed!");
          } finally {
            setPaying(false);
          }
        },
        prefill: {
          name: user.name || "",
          email: user.email || "",
        },
        notes: {
          courseId: course._id,
        },
        theme: {
          color: "#0ea5e9",
        },
        modal: {
          ondismiss: function () {
            setPaying(false);
          },
        },
      };

      const razorpay = new window.Razorpay(options);
      razorpay.on("payment.failed", function (response) {
        alert(`Payment Failed: ${response.error.description || "Transaction cancelled"}`);
        setPaying(false);
      });

      razorpay.open();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Failed to initiate Razorpay checkout!");
      setPaying(false);
    }
  };

  if (!course) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-10 px-4 pt-28">
      <div className="max-w-6xl mx-auto">

        {/* Back Button */}
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-cyan-400 mb-6 hover:text-cyan-200 transition-colors font-medium"
        >
          <FaArrowLeft /> Back to Courses
        </Link>

        <div className="glass-card rounded-3xl shadow-xl p-6 md:p-10 grid md:grid-cols-2 gap-8 border border-cyan-500/30">

          {/* LEFT: IMAGE SECTION */}
          <div>
            {/* Main Image */}
            <img
              src={
                course.images?.[activeImage]
                  ? `http://localhost:5500/uploads/${course.images[activeImage]}`
                  : "https://via.placeholder.com/600x400?text=No+Image+Available"
              }
              onError={(e) => {
                e.target.src = "https://via.placeholder.com/600x400?text=Image+Not+Found";
              }}
              alt="course"
              className="w-full h-80 object-cover rounded-2xl shadow-md mb-4 border border-cyan-500/20"
            />

            {/* Thumbnails */}
            {course.images?.length > 1 && (
              <div className="flex gap-3 overflow-x-auto">
                {course.images.map((img, index) => (
                  <img
                    key={index}
                    src={`http://localhost:5500/uploads/${img}`}
                    onClick={() => setActiveImage(index)}
                    className={`w-20 h-20 object-cover rounded-lg cursor-pointer border-2 transition 
                      ${
                        activeImage === index
                          ? "border-cyan-400"
                          : "border-white/10"
                      }`}
                  />
                ))}
              </div>
            )}
          </div>

          {/* RIGHT: DETAILS */}
          <div className="flex flex-col justify-between">
            <div>
              <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white via-cyan-200 to-sky-400 mb-4">
                {course.title}
              </h2>

              <p className="mb-2 text-slate-200">
                <span className="font-semibold text-cyan-400">Instructor:</span>{" "}
                {course.instructor}
              </p>

              <p className="mb-2 text-slate-200">
                <span className="font-semibold text-cyan-400">Duration:</span>{" "}
                {course.duration}
              </p>

              <p className="mb-2 text-slate-200">
                <span className="font-semibold text-cyan-400">Category:</span>{" "}
                {course.category}
              </p>

              <p className="mb-4 text-slate-300 leading-relaxed">
                <span className="font-semibold text-cyan-400 block mb-1">Description:</span>{" "}
                {course.description}
              </p>

              {/* Price */}
              <div className="flex items-center gap-3 mb-6">
                <div className="text-3xl font-extrabold text-cyan-400 drop-shadow-[0_0_10px_rgba(56,189,248,0.3)]">
                  ₹{course.price}
                </div>
                <span className="text-xs bg-cyan-950/80 border border-cyan-400/40 text-cyan-300 px-3 py-1 rounded-full font-semibold flex items-center gap-1">
                  <FaLock className="text-xs text-emerald-400" /> Secure Payment via Razorpay
                </span>
              </div>
            </div>

            {/* Buttons */}
            <div className="flex gap-4 flex-wrap">
              {isEnrolled ? (
                <button
                  disabled
                  className="bg-slate-800 border border-emerald-500/40 text-emerald-400 font-bold px-6 py-3 rounded-xl flex items-center gap-2 cursor-default shadow-md"
                >
                  <FaCheckCircle className="text-lg" /> Enrolled & Active
                </button>
              ) : (
                <button
                  disabled={paying}
                  onClick={handlePayment}
                  className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-bold px-6 py-3 rounded-xl shadow-lg transition-all flex items-center gap-2 hover:scale-[1.02] disabled:opacity-50"
                >
                  {paying ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Processing Payment...</span>
                    </>
                  ) : (
                    <>
                      <FaCreditCard />
                      <span>Pay ₹{course.price} & Apply Now</span>
                    </>
                  )}
                </button>
              )}

              <Link
                to={course.createdBy ? `/chat?userId=${course.createdBy}` : "/chat"}
                className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold px-6 py-3 rounded-xl shadow-lg transition-all flex items-center gap-2"
              >
                <span>💬 Chat with Teacher</span>
              </Link>

              <Link
                to={`/notebook-lm?courseId=${course._id}`}
                className="bg-gradient-to-r from-sky-500 to-blue-600 text-white font-bold px-6 py-3 rounded-xl hover:shadow-[0_0_20px_rgba(56,189,248,0.4)] transition-all flex items-center gap-2"
              >
                <span>✨ Open in Quiz AI</span>
              </Link>

              {/* Only show Edit Course if user is instructor, teacher, or admin */}
              {(currentUser.role === "admin" || currentUser.role === "instructor" || currentUser.role === "teacher" || currentUser.id === course.createdBy) && currentUser.role !== "student" && (
                <Link
                  to={`/edit-course/${course._id}`}
                  className="bg-cyan-950/60 border border-cyan-400/40 text-cyan-300 font-semibold px-6 py-3 rounded-xl hover:bg-cyan-500 hover:text-black transition-all"
                >
                  Edit Course
                </Link>
              )}

              <Link
                to="/"
                className="bg-slate-800 hover:bg-slate-700 text-white px-6 py-3 rounded-xl border border-white/10 transition-colors"
              >
                Back to Home
              </Link>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default SingleCourse;