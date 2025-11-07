import { Link } from "react-router-dom";
import "./HomePage.css";
import {
  FaTrophy,
  FaChartBar,
  FaFutbol,
  FaGamepad,
  FaUsers,
  FaArrowRight,
  FaStar,
  FaBolt,
  FaShieldAlt
} from "react-icons/fa";

function HomePage() {
  return (
    <div className="home-page">
      {/* Hero Section with Animated Elements */}
      <div
        className="hero-section"
        style={{
          backgroundImage: `linear-gradient(
            rgba(0, 0, 0, 0.75),
            rgba(0, 0, 0, 0.75)
          ), url(${process.env.PUBLIC_URL}/images/stadium-dark.jpg)`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundAttachment: "fixed",
          backgroundRepeat: "no-repeat",
        }}
      >
        <div className="hero-overlay"></div>
        <div className="hero-content">
          <div className="hero-badge">
            <FaTrophy /> Official Tournament
          </div>
          <h1 className="hero-title">
            African Nations League
            <span className="year">2026</span>
          </h1>
          <p className="hero-tagline">
            Where African Football Meets Innovation on the Digital Pitch
          </p>

          <div className="hero-buttons">
            <Link to="/bracket" className="btn btn-primary hero-btn">
              <FaChartBar /> View Bracket <FaArrowRight className="btn-icon-right" />
            </Link>
            <Link to="/top-scorers" className="btn btn-secondary hero-btn">
              <FaFutbol /> Top Scorers <FaArrowRight className="btn-icon-right" />
            </Link>
          </div>

          {/* Hero Stats */}
          <div className="hero-stats">
            <div className="hero-stat">
              <FaStar className="hero-stat-icon" />
              <div className="hero-stat-value">8</div>
              <div className="hero-stat-label">Elite Teams</div>
            </div>
            <div className="hero-stat">
              <FaBolt className="hero-stat-icon" />
              <div className="hero-stat-value">7</div>
              <div className="hero-stat-label">Epic Matches</div>
            </div>
            <div className="hero-stat">
              <FaShieldAlt className="hero-stat-icon" />
              <div className="hero-stat-value">1</div>
              <div className="hero-stat-label">Champion</div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="features-section">
        <div className="section-header">
          <h2 className="section-title">Explore the Tournament</h2>
          <p className="section-subtitle">
            Experience the excitement of African football through our innovative platform
          </p>
        </div>

        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-glow"></div>
            <div className="icon-wrapper primary">
              <FaGamepad />
            </div>
            <h3>Live Simulations</h3>
            <p>Experience AI-driven match commentary and real-time outcomes with cutting-edge technology.</p>
            <Link to="/admin" className="card-link">
              Simulate Matches <FaArrowRight />
            </Link>
          </div>

          <div className="feature-card featured">
            <div className="feature-badge">MOST POPULAR</div>
            <div className="feature-glow"></div>
            <div className="icon-wrapper success">
              <FaChartBar />
            </div>
            <h3>Real-Time Stats</h3>
            <p>Track top scorers, goals, and comprehensive team performance metrics across the tournament.</p>
            <Link to="/top-scorers" className="card-link">
              View Stats <FaArrowRight />
            </Link>
          </div>

          <div className="feature-card">
            <div className="feature-glow"></div>
            <div className="icon-wrapper info">
              <FaUsers />
            </div>
            <h3>Tournament Bracket</h3>
            <p>Follow every knockout stage match from Quarter-Finals to the Grand Final in real-time.</p>
            <Link to="/bracket" className="card-link">
              See Bracket <FaArrowRight />
            </Link>
          </div>
        </div>
      </div>

      {/* Tournament Info Section */}
      <div className="info-section">
        <div className="info-content">
          <div className="info-header">
            <h2>About the Tournament</h2>
            <div className="info-underline"></div>
          </div>
          <p className="info-description">
            The African Nations League brings together the best teams from across
            the continent in an exciting knockout tournament format. From
            Quarter-Finals to the Grand Final, witness the passion, skill, and
            glory of African football like never before.
          </p>

          <div className="info-stats">
            <div className="stat-box">
              <div className="stat-icon-wrapper teams">
                <FaUsers />
              </div>
              <div className="stat-number">8</div>
              <div className="stat-label">Elite Teams</div>
            </div>
            <div className="stat-box">
              <div className="stat-icon-wrapper matches">
                <FaFutbol />
              </div>
              <div className="stat-number">7</div>
              <div className="stat-label">Total Matches</div>
            </div>
            <div className="stat-box">
              <div className="stat-icon-wrapper rounds">
                <FaTrophy />
              </div>
              <div className="stat-number">3</div>
              <div className="stat-label">Knockout Rounds</div>
            </div>
          </div>

          <div className="cta-section">
            <h3>Ready to Join the Action?</h3>
            <div className="cta-buttons">
              <Link to="/signup" className="btn btn-primary btn-large">
                <FaTrophy /> Register Your Team
              </Link>
              <Link to="/login" className="btn btn-outline btn-large">
                <FaArrowRight /> Login to Dashboard
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Banner */}
      <div className="footer-banner">
        <div className="footer-content">
          <FaTrophy className="footer-icon" />
          <h3>African Nations League 2026</h3>
          <p>Powered by Innovation • Driven by Passion • United by Football</p>
        </div>
      </div>
    </div>
  );
}

export default HomePage;