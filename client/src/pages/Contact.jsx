import React, { useState } from "react";
import axios from "axios";

const Contact = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState({ type: "", message: "" });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) {
      setStatus({ type: "error", message: "Please fill in all fields." });
      return;
    }

    try {
      setLoading(true);
      setStatus({ type: "", message: "" });

      const res = await axios.post("http://localhost:5500/api/contact/send", formData);
      setStatus({ type: "success", message: res.data.message || "Message sent successfully!" });
      setFormData({ name: "", email: "", message: "" });
    } catch (error) {
      setStatus({
        type: "error",
        message: error.response?.data?.message || "Failed to send message. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-cover bg-center flex justify-center pt-32 pb-16 px-4">
      <div className="w-full max-w-4xl glass-card border border-cyan-500/30 rounded-2xl p-8 text-slate-100 shadow-[0_0_30px_rgba(56,189,248,0.2)]">
        <h1 className="text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white via-cyan-200 to-sky-400 mb-6">Contact Us</h1>

        <div className="grid md:grid-cols-2 gap-10">
          <div>
            <h2 className="text-2xl text-cyan-400 mb-4 font-semibold">Get In Touch</h2>

            <p className="mb-3 flex items-center gap-2 text-slate-200">
              <span>📧</span> Email: sahilshaw2004002@gmail.com
            </p>

            <p className="mb-3 flex items-center gap-2 text-slate-200">
              <span>📞</span> Phone: +91 9330123364
            </p>

            <p className="mb-3 flex items-center gap-2 text-slate-200">
              <span>📍</span> Address: Kolkata, West Bengal, India
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {status.message && (
              <div
                className={`p-3 rounded-lg text-sm font-medium ${
                  status.type === "success"
                    ? "bg-green-900/60 text-green-300 border border-green-500"
                    : "bg-red-900/60 text-red-300 border border-red-500"
                }`}
              >
                {status.message}
              </div>
            )}

            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Your Name"
              className="w-full p-3 rounded-xl bg-slate-950/60 border border-cyan-500/30 outline-none text-slate-100 placeholder-slate-400 focus:border-cyan-400 focus:shadow-[0_0_15px_rgba(56,189,248,0.3)] transition-all"
            />

            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Your Email"
              className="w-full p-3 rounded-xl bg-slate-950/60 border border-cyan-500/30 outline-none text-slate-100 placeholder-slate-400 focus:border-cyan-400 focus:shadow-[0_0_15px_rgba(56,189,248,0.3)] transition-all"
            />

            <textarea
              rows="5"
              name="message"
              value={formData.message}
              onChange={handleChange}
              placeholder="Your Message"
              className="w-full p-3 rounded-xl bg-slate-950/60 border border-cyan-500/30 outline-none text-slate-100 placeholder-slate-400 focus:border-cyan-400 focus:shadow-[0_0_15px_rgba(56,189,248,0.3)] transition-all"
            ></textarea>

            <button
              type="submit"
              disabled={loading}
              className="bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white font-semibold transition px-6 py-3 rounded-xl shadow-[0_0_20px_rgba(56,189,248,0.3)] w-full md:w-auto disabled:opacity-50"
            >
              {loading ? "Sending..." : "Send Message"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Contact;