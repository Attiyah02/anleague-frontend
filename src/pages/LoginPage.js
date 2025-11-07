import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth, db } from "../firebase";
import { collection, query, where, getDocs } from "firebase/firestore";
import "./LoginPage.css";
import { 
  FaTrophy, 
  FaEnvelope, 
  FaLock, 
  FaSignInAlt, 
  FaUserShield, 
  FaFootballBall, 
  FaTimesCircle, 
  FaInfoCircle,
  FaSpinner
} from 'react-icons/fa';
import { IoEyeOffOutline, IoEyeOutline } from 'react-icons/io5';

function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  
  async function handleLogin(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      const usersRef = collection(db, "users");
      const q = query(usersRef, where("uid", "==", user.uid));
      const snapshot = await getDocs(q);
      
      if (!snapshot.empty) {
        const userData = snapshot.docs[0].data();
        
        if (userData.role === "admin") {
          navigate("/admin");
        } else if (userData.role === "representative") {
          navigate("/representative");
        } else {
          navigate("/");
        }
      } else {
        setError("User data not found. Please contact administrator.");
      }
      
    } catch (err) {
      console.error("Login error:", err);
      if (err.code === "auth/invalid-email") {
        setError("Please enter a valid email address.");
      } else if (err.code === "auth/user-disabled") {
        setError("Your account has been disabled. Please contact support.");
      } else if (err.code === "auth/invalid-credential" || err.code === "auth/wrong-password" || err.code === "auth/user-not-found") {
        setError("Invalid email or password. Please check your credentials.");
      } else {
        setError("Login failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  }

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };
  
  return (
    <div 
      className="login-page"
      style={{
        backgroundImage: `linear-gradient(
          rgba(0, 0, 0, 0.75),
          rgba(0, 0, 0, 0.75)
        ), url(${process.env.PUBLIC_URL}/images/stadium-dark.jpg)`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundAttachment: "fixed",
        backgroundRepeat: "no-repeat"
      }}
    >
      <div className="login-container">
        <div className="login-panel">
          <div className="login-header">
            <div className="brand-logo">
              <FaTrophy className="brand-icon" />
            </div>
            <h1>African Nations League</h1>
            <p className="tagline">Access Your Tournament Portal</p>
          </div>
          
          <form onSubmit={handleLogin} className="login-form">
            {error && (
              <div className="error-message">
                <FaTimesCircle className="error-icon" />
                <span>{error}</span>
              </div>
            )}
            
            <div className="form-group">
              <label htmlFor="email">
                <FaEnvelope className="label-icon" /> Email Address
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                required
                autoComplete="email"
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="password">
                <FaLock className="label-icon" /> Password
              </label>
              <div className="password-input-wrapper">
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  required
                  autoComplete="current-password"
                />
                <span 
                  className="password-toggle-icon" 
                  onClick={togglePasswordVisibility}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <IoEyeOffOutline /> : <IoEyeOutline />}
                </span>
              </div>
            </div>
            
            <button type="submit" className="login-btn" disabled={loading}>
              {loading ? (
                <>
                  <FaSpinner className="spinner-icon" /> Signing in...
                </>
              ) : (
                <>
                  <FaSignInAlt /> Sign In
                </>
              )}
            </button>
          </form>
          
          <div className="login-footer">
            <p>
              Don't have an account?{" "}
              <Link to="/signup">Sign up here</Link>
            </p>
          </div>
          
          <div className="demo-credentials">
            <h4><FaInfoCircle /> Demo Accounts</h4>
            <div className="demo-account">
              <div className="demo-icon admin">
                <FaUserShield />
              </div>
              <div className="demo-details">
                <div className="demo-role">Admin</div>
                <div className="demo-email">admin@afnl.com</div>
                <div className="demo-password">admin123</div>
              </div>
            </div>
            <div className="demo-account">
              <div className="demo-icon rep">
                <FaFootballBall />
              </div>
              <div className="demo-details">
                <div className="demo-role">Representative</div>
                <div className="demo-email">southafrica@afnl.com</div>
                <div className="demo-password">sa123456</div>
              </div>
            </div>
            <p className="demo-note">
              <FaInfoCircle /> For demonstration purposes only
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;