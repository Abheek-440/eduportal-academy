import React from 'react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from "axios";

const Createliveclass = () => {
    const navigate = useNavigate();
    const token = localStorage.getItem("token");
    const user = JSON.parse(localStorage.getItem("user"));
    const [form,setForm] = useState({
        title:"",
        subject:"",
        instructorName:user?.name || "",
        date:"",
        time:"",
   });

 const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

 const handleSubmit = async (e) => {
    e.preventDefault();

    if (!token) {
      alert("please login first");
      return;
    }
    if(user?.role !== "admin" && user?.role !=="instructor"){
        alert("only admin or instructor can  create live class");
        return;
    }

    try {
      await axios.post(
        "http://localhost:5500/api/liveclasses",
        form,
        {
          headers: {
            Authorization: `Bearer ${token}`, // 🔐 send token
          },
        }
      );

      alert("real live class added successfully!");

      setTimeout(() => navigate("/live-classes"), 1500);
    } catch (error) {
      console.error(error);
      
    } 
  };

  return (
    <div className="min-h-screen pt-32 pb-16 px-4 flex justify-center items-center">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-xl glass-card p-8 rounded-2xl border border-cyan-500/30 text-white shadow-[0_0_30px_rgba(56,189,248,0.2)] space-y-5"
      >
        <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white via-cyan-200 to-sky-400 mb-6 text-center">
          Create Live Class (Live+)
        </h1>

        <div>
          <label className="block text-xs font-semibold text-cyan-400 uppercase tracking-wider mb-1.5">Class Title</label>
          <input
            type="text"
            name="title"
            placeholder="Enter class title..."
            onChange={handleChange}
            value={form.title}
            className="w-full bg-slate-950/60 border border-cyan-500/30 text-white placeholder-slate-400 p-3.5 rounded-xl outline-none focus:border-cyan-400 focus:shadow-[0_0_15px_rgba(56,189,248,0.3)] transition-all"
            required
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-cyan-400 uppercase tracking-wider mb-1.5">Subject</label>
          <input
            type="text"
            name="subject"
            placeholder="Enter subject name..."
            onChange={handleChange}
            value={form.subject}
            className="w-full bg-slate-950/60 border border-cyan-500/30 text-white placeholder-slate-400 p-3.5 rounded-xl outline-none focus:border-cyan-400 focus:shadow-[0_0_15px_rgba(56,189,248,0.3)] transition-all"
            required
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-cyan-400 uppercase tracking-wider mb-1.5">Instructor Name</label>
          <input
            type="text"
            name="instructorName"
            placeholder="Instructor Name"
            onChange={handleChange}
            value={form.instructorName}
            className="w-full bg-slate-950/60 border border-cyan-500/30 text-white placeholder-slate-400 p-3.5 rounded-xl outline-none focus:border-cyan-400 focus:shadow-[0_0_15px_rgba(56,189,248,0.3)] transition-all"
            required
          />
        </div>

        <div className="grid md:grid-cols-2 gap-5">
          <div>
            <label className="block text-xs font-semibold text-cyan-400 uppercase tracking-wider mb-1.5">Date</label>
            <input
              type="date"
              name="date"
              onChange={handleChange}
              value={form.date}
              style={{ colorScheme: "dark" }}
              className="w-full bg-slate-950/80 border border-cyan-500/30 text-white p-3.5 rounded-xl outline-none focus:border-cyan-400 focus:shadow-[0_0_15px_rgba(56,189,248,0.3)] transition-all cursor-pointer font-medium"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-cyan-400 uppercase tracking-wider mb-1.5">Time</label>
            <input
              type="time"
              name="time"
              onChange={handleChange}
              value={form.time}
              style={{ colorScheme: "dark" }}
              className="w-full bg-slate-950/80 border border-cyan-500/30 text-white p-3.5 rounded-xl outline-none focus:border-cyan-400 focus:shadow-[0_0_15px_rgba(56,189,248,0.3)] transition-all cursor-pointer font-medium"
              required
            />
          </div>
        </div>
        
        <button 
          type="submit"
          className="w-full bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white font-bold py-3.5 rounded-xl uppercase tracking-wider shadow-[0_0_20px_rgba(56,189,248,0.3)] transition-all mt-4"
        >
          Create Real Meeting
        </button>
      </form>
    </div>
  );
}

export default Createliveclass