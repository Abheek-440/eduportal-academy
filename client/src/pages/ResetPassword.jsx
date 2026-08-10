import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, useLocation, Link } from 'react-router-dom';

const ResetPassword = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ 
    email: location.state?.email || "", 
    otp: "", 
    newPassword: "" 
  });
  const [loading, setLoading] = useState(false);

  const hc = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const hs = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const res = await axios.post("http://localhost:5500/api/auth/reset-password", form);
      alert(res.data.message);
      navigate("/login");
    } catch (err) {
      alert(err.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-[calc(100vh-100px)] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 animate-fade-in relative">
      
      {/* Background decorations */}
      <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-indigo-200/50 rounded-full blur-3xl -z-10 animate-pulse-slow"></div>
      <div className="absolute bottom-1/4 left-1/4 w-96 h-96 bg-violet-200/50 rounded-full blur-3xl -z-10 animate-pulse-slow" style={{ animationDelay: '2s' }}></div>

      <div className="max-w-md w-full glass-card p-10 space-y-8 relative overflow-hidden">
        {/* Top gradient bar */}
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-indigo-500 to-violet-500"></div>

        <div>
          <h2 className="text-center text-3xl font-extrabold text-white tracking-tight">
            Reset Password
          </h2>
          <p className="mt-3 text-center text-sm text-gray-300">
            Enter the OTP sent to your email and set a new password.
          </p>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={hs}>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-white mb-1">Email address</label>
              <input
                type="email"
                name="email"
                placeholder='you@example.com'
                onChange={hc}
                value={form.email}
                className="input-field"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-white mb-1">OTP</label>
              <input
                type="text"
                name="otp"
                placeholder='Enter 6-digit OTP'
                onChange={hc}
                value={form.otp}
                className="input-field"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-white mb-1">New Password</label>
              <input
                type="password"
                name="newPassword"
                placeholder='••••••••'
                onChange={hc}
                value={form.newPassword}
                className="input-field"
                required
              />
            </div>
          </div>

          <div>
            <button 
              type="submit" 
              disabled={loading}
              className="w-full btn-primary flex justify-center items-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  Resetting...
                </>
              ) : (
                "Reset Password"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ResetPassword;
