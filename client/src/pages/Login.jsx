import React,{useState} from 'react'
import axios from 'axios'
import { useNavigate, useLocation, Link } from 'react-router-dom'
import { API_BASE_URL } from '../config/apiConfig'

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [form,setForm] = useState({email:"",password:"",role:"student"});
  const [loading, setLoading] = useState(false);

  const redirectbyrole = (role)=>{
    if(role ==="admin") navigate("/admin-dashboard");
    else if(role ==="instructor") navigate("/instructor-dashboard");
    else navigate("/student-dashboard");
  }

  const hc = (e)=> setForm({...form,[e.target.name]:e.target.value});
  
  const hs = async(e)=>{
    e.preventDefault();
    try {
      setLoading(true);
      const res = await axios.post(`${API_BASE_URL}/api/auth/login`,form);
      localStorage.setItem("token",res.data.token);
      localStorage.setItem("user",JSON.stringify(res.data.user));
      alert(res.data.message);
      redirectbyrole(res.data.user.role);
    } catch(err){
      console.error(err);
      alert(err.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-[calc(100vh-100px)] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 animate-fade-in relative">
      
      {/* Background decorations */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-200/50 rounded-full blur-3xl -z-10 animate-pulse-slow"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-violet-200/50 rounded-full blur-3xl -z-10 animate-pulse-slow" style={{ animationDelay: '2s' }}></div>

      <div className="max-w-md w-full glass-card p-10 space-y-8 relative overflow-hidden">
        {/* Top gradient bar */}
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-indigo-500 to-violet-500"></div>

        <div>
          <h2 className="text-center text-3xl font-extrabold text-white tracking-tight">
            Welcome back
          </h2>
          <p className="mt-3 text-center text-sm text-gray-300">
            Don't have an account?{' '}
            <Link to="/register" className="font-semibold text-accent hover:text-accent transition-colors">
              Sign up today
            </Link>
          </p>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={hs}>
          <div className="space-y-4">
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
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input
                id="remember-me"
                name="remember-me"
                type="checkbox"
                className="h-4 w-4 text-accent focus:ring-indigo-500 border-white/10 rounded"
              />
              <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-300">
                Remember me
              </label>
            </div>

            <div className="text-sm">
              <Link to="/forgot-password" className="font-semibold text-accent hover:text-accent transition-colors">
                Forgot password?
              </Link>
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
                  Signing in...
                </>
              ) : (
                "Sign in"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default Login