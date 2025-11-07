import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth, db } from "../firebase";
import { doc, setDoc } from "firebase/firestore";
import "./SignUpPage.css";
import { 
  FaTrophy, 
  FaEnvelope, 
  FaLock, 
  FaUser, 
  FaCheckCircle,
  FaTimesCircle,
  FaUserPlus,
  FaShieldAlt
} from "react-icons/fa";
import { IoEyeOffOutline, IoEyeOutline } from 'react-icons/io5';

function SignUpPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const navigate = useNavigate();

  async function handleSignUp(e) {
    e.preventDefault();
    setError("");

    // Validation
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    setLoading(true);

    try {
      // Create Firebase Auth account
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Create custom document ID (readable format)
      const docId = email.split("@")[0].toLowerCase().replace(/[^a-z0-9]/g, "-") + "-rep";

      // Save user data to Firestore
      await setDoc(doc(db, "users", docId), {
        uid: user.uid,
        email: email,
        displayName: displayName || email.split("@")[0],
        role: "representative",
        createdAt: new Date().toISOString(),
        hasTeam: false
      });

      console.log("✅ Account created successfully!");
      
      // Redirect to team registration
      navigate("/register-team");
    } catch (err) {
      console.error("Sign up error:", err);
      
      if (err.code === "auth/email-already-in-use") {
        setError("This email is already registered. Try logging in instead.");
      } else if (err.code === "auth/invalid-email") {
        setError("Invalid email address");
      } else if (err.code === "auth/weak-password") {
        setError("Password is too weak");
      } else {
        setError("Failed to create account. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div 
      className="signup-page"
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
      <div className="signup-container">
        <div className="signup-panel">
          <div className="signup-header">
            <div className="brand-logo">
              <FaTrophy className="brand-icon" />
            </div>
            <h1>Join African Nations League</h1>
            <p className="tagline">Create Your Representative Account</p>
          </div>

          <form onSubmit={handleSignUp} className="signup-form">
            {error && (
              <div className="error-message">
                <FaTimesCircle className="error-icon" />
                <span>{error}</span>
              </div>
            )}

            <div className="form-group">
              <label htmlFor="displayName">
                <FaUser className="label-icon" /> Display Name
              </label>
              <input
                type="text"
                id="displayName"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Your name"
                autoComplete="name"
              />
            </div>

            <div className="form-group">
              <label htmlFor="email">
                <FaEnvelope className="label-icon" /> Email Address *
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your-email@example.com"
                required
                autoComplete="email"
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">
                <FaLock className="label-icon" /> Password *
              </label>
              <div className="password-input-wrapper">
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 6 characters"
                  required
                  autoComplete="new-password"
                />
                <span 
                  className="password-toggle-icon" 
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <IoEyeOffOutline /> : <IoEyeOutline />}
                </span>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="confirmPassword">
                <FaLock className="label-icon" /> Confirm Password *
              </label>
              <div className="password-input-wrapper">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  id="confirmPassword"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter your password"
                  required
                  autoComplete="new-password"
                />
                <span 
                  className="password-toggle-icon" 
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                >
                  {showConfirmPassword ? <IoEyeOffOutline /> : <IoEyeOutline />}
                </span>
              </div>
            </div>

            <button type="submit" className="signup-btn" disabled={loading}>
              {loading ? (
                <>
                  <div className="btn-spinner"></div> Creating Account...
                </>
              ) : (
                <>
                  <FaUserPlus /> Create Account
                </>
              )}
            </button>
          </form>

          <div className="signup-footer">
            <p>
              Already have an account?{" "}
              <Link to="/login">Sign in here</Link>
            </p>
          </div>

          <div className="info-box">
            <div className="info-header">
              <FaShieldAlt className="info-icon" />
              <h4>What Happens Next?</h4>
            </div>
            <div className="info-steps">
              <div className="info-step">
                <FaCheckCircle className="step-icon" />
                <span>Account created instantly</span>
              </div>
              <div className="info-step">
                <FaCheckCircle className="step-icon" />
                <span>Register your national team</span>
              </div>
              <div className="info-step">
                <FaCheckCircle className="step-icon" />
                <span>Participate in the tournament</span>
              </div>
              <div className="info-step">
                <FaCheckCircle className="step-icon" />
                <span>Track your team's performance</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SignUpPage;