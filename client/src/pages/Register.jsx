import React,{useState} from 'react'
import axios from 'axios'
import { useNavigate, Link } from 'react-router-dom'
import { API_BASE_URL } from '../config/apiConfig'

const Register = () => {
  const navigate = useNavigate();
  const [form,setForm] = useState({name:"",email:"",password:"",role:"student"});
  const [loading, setLoading] = useState(false);

  const hc = (e)=> setForm({...form,[e.target.name]:e.target.value});
  
  const hs = async(e)=>{
    e.preventDefault();
    try {
      setLoading(true);
      const res = await axios.post(`${API_BASE_URL}/api/auth/register`,form);
      alert(res.data.message);
      navigate("/verify-otp",{state:{email:form.email}});
    } catch(err){
      console.error(err);
      alert(err.response?.data?.message || "Registration failed");
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
            Create an account
          </h2>
          <p className="mt-3 text-center text-sm text-gray-300">
            Already have an account?{' '}
            <Link to="/login" className="font-semibold text-accent hover:text-accent transition-colors">
              Sign in
            </Link>
          </p>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={hs}>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-white mb-1">Full Name</label>
              <input
                type="text"
                name='name'
                placeholder='John Doe'
                onChange={hc}
                value={form.name}
                className="input-field"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-white mb-1">Email address</label>
              <input
                type="email"
                name='email'
                placeholder='you@example.com'
                onChange={hc}
                value={form.email}
                className="input-field"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-white mb-1">Password</label>
              <input
                type="password"
                name='password'
                placeholder='••••••••'
                onChange={hc}
                value={form.password}
                className="input-field"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-white mb-1">I am a...</label>
              <select 
                name='role' 
                className="input-field cursor-pointer" 
                onChange={hc}
                value={form.role}
                required
              >
                <option value="student">Student</option>
                <option value="instructor">Instructor</option>
                <option value="admin">Admin</option>
              </select>
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
                  Registering...
                </>
              ) : (
                "Create Account"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default Register