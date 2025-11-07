import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth, db } from "../firebase";
import { collection, query, where, getDocs } from "firebase/firestore";
import "./Navbar.css";

function Navbar() {
  const [user, setUser] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Listen for auth changes
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      
      if (currentUser) {
        // Get user role from Firestore
        try {
          const usersRef = collection(db, "users");
          const q = query(usersRef, where("uid", "==", currentUser.uid));
          const snapshot = await getDocs(q);
          
          if (!snapshot.empty) {
            const userData = snapshot.docs[0].data();
            setUserRole(userData.role);
          }
        } catch (error) {
          console.error("Error fetching user role:", error);
        }
      } else {
        setUserRole(null);
      }
    });

    return () => unsubscribe();
  }, []);

  async function handleLogout() {
    try {
      await signOut(auth);
      setUser(null);
      setUserRole(null);
      navigate("/");
      console.log("✅ Logged out successfully");
    } catch (error) {
      console.error("Error logging out:", error);
    }
  }

  return (
    <nav className="navbar">
      <Link to="/" className="navbar-brand">
        <h1>🏆 African Nations League</h1>
      </Link>
      
      <div className="nav-links">
        <Link to="/">Home</Link>
        <Link to="/bracket">Bracket</Link>
        <Link to="/top-scorers">Top Scorers</Link>
        
        {/* Show different links based on user role */}
        {user ? (
          <>
            {userRole === "admin" && (
              <Link to="/admin" className="nav-link-admin">
                Admin Dashboard
              </Link>
            )}
            
            {userRole === "representative" && (
              <>
                <Link to="/representative">My Team</Link>
                <Link to="/register-team">Register Team</Link>
              </>
            )}
            
            <button onClick={handleLogout} className="logout-btn">
              Logout
            </button>
          </>
        ) : (
          <>
            <Link to="/signup" className="nav-link-signup">Sign Up</Link>
            <Link to="/login" className="nav-link-login">Login</Link>
          </>
        )}
      </div>
    </nav>
  );
}

export default Navbar;