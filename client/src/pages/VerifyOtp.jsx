import React,{useState} from 'react'
import axios from 'axios'
import { useNavigate,useLocation } from 'react-router-dom'

const VerifyOtp = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email || "";

  const [otp,setOtp] = useState("");

  const hv = async(e)=>{
    e.preventDefault();
    if(!email) {
      alert("email missing please register fast...");
      navigate("/register");
      return;
    }
    try {
      const res = await axios.post("http://localhost:5500/api/auth/verify-otp",{email,otp});
      alert(res.data.message);
      navigate("/login");
    } catch(err){
      console.error(err);
    }
  }
  return <>
  <form
      onSubmit={hv}
      className="glass-card p-8 rounded-2xl shadow-card space-y-4"
    >
      <h2>Verify otp</h2>
      <p>otp sent to:{email} </p>
       <input
        type="text"
        placeholder='enter otp'
        onChange={(e)=>setOtp(e.target.value)}
        value={otp}
        className="w-full border p-3 rounded-lg"
        required
      />

      <button 
      className="w-full glass-card text-black py-3 rounded-lg hover:bg-blue-700 transition"
      >
        Verify otp
      </button>
    </form>
  
  
  </>
}

export default VerifyOtp