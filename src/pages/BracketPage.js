import { useState, useEffect } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebase";
import { Link } from "react-router-dom";
import "./BracketPage.css";

import {
  FaTrophy,
  FaSyncAlt,
  FaSpinner,
  FaLock,
  FaCheckCircle,
  FaExclamationTriangle,
  FaEye
} from "react-icons/fa";

function BracketPage() {
  const [matches, setMatches] = useState({
    quarterFinals: [],
    semiFinals: [],
    final: null
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadBracket();
  }, []);

  async function loadBracket() {
    setLoading(true);
    setError(null);
    try {
      const matchesSnapshot = await getDocs(collection(db, "matches"));
      const qf = [];
      const sf = [];
      let final = null;

      matchesSnapshot.forEach((doc) => {
        const match = { id: doc.id, ...doc.data() };
        if (match.round === "Quarter-Final") qf.push(match);
        else if (match.round === "Semi-Final") sf.push(match);
        else if (match.round === "Final") final = match;
      });

      qf.sort((a, b) => a.matchNumber - b.matchNumber);
      sf.sort((a, b) => a.matchNumber - b.matchNumber);

      setMatches({ quarterFinals: qf, semiFinals: sf, final });
      setLoading(false);
    } catch (err) {
      console.error("Error loading bracket:", err);
      setError("Failed to load tournament bracket. Please try again.");
      setLoading(false);
    }
  }

  function MatchCard({ match }) {
    const isCompleted = match.status === "completed";
    const winnerTeam1 =
      isCompleted && match.winner?.country === match.team1.country;
    const winnerTeam2 =
      isCompleted && match.winner?.country === match.team2.country;

    const getTeamName = (teamData) => {
      return teamData?.country || teamData?.placeholder || "TBD";
    };

    return (
      <div className={`match-card ${match.status}`}>
        <div className="match-card-header">
          <span className="match-id-label">{match.matchId}</span>
          <span className={`match-status-pill ${match.status}`}>
            {match.status === "pending" && (
              <>
                <FaExclamationTriangle /> Pending
              </>
            )}
            {match.status === "completed" && (
              <>
                <FaCheckCircle /> Completed
              </>
            )}
            {match.status === "locked" && (
              <>
                <FaLock /> Locked
              </>
            )}
          </span>
        </div>

        <div className="match-teams-container">
          <div className={`team-entry ${winnerTeam1 ? "winner" : ""}`}>
            <span className="team-name">{getTeamName(match.team1)}</span>
            {isCompleted && (
              <span className="team-score">{match.score.team1}</span>
            )}
          </div>

          <div className="vs-separator">VS</div>

          <div className={`team-entry ${winnerTeam2 ? "winner" : ""}`}>
            <span className="team-name">{getTeamName(match.team2)}</span>
            {isCompleted && (
              <span className="team-score">{match.score.team2}</span>
            )}
          </div>
        </div>

        {isCompleted && (
          <Link to={`/match/${match.matchId}`} className="btn-view-details">
            <FaEye /> View Details
          </Link>
        )}
      </div>
    );
  }

  // Loading state
  if (loading) {
    return (
      <div className="bracket-page loading-state">
        <FaSpinner className="loading-spinner" />
        <h2>Loading Tournament Bracket...</h2>
        <p>Please wait while the match schedule is being loaded.</p>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="bracket-page error-state">
        <FaExclamationTriangle className="error-icon" />
        <h2>Error Loading Bracket</h2>
        <p>{error}</p>
        <button onClick={loadBracket} className="btn btn-primary refresh-btn">
          <FaSyncAlt /> Try Again
        </button>
      </div>
    );
  }

  // ✅ Background image setup here
  const backgroundStyle = {
    backgroundImage: `linear-gradient(
      rgba(0, 0, 0, 0.7),
      rgba(0, 0, 0, 0.7)
    ), url(/images/stadium-dark.jpg)`,
    backgroundSize: "cover",
    backgroundPosition: "center",
    backgroundAttachment: "fixed",
    minHeight: "100vh",
    color: "white",
    padding: "60px 20px"
  };

  return (
    <div className="bracket-page" style={backgroundStyle}>
      <div className="page-header">
        <h1>
          <FaTrophy style={{ color: "#FFD700" }} /> Tournament Bracket
        </h1>
        <p className="subtitle">
          Follow the journey to glory: Quarter-Finals, Semi-Finals, and The
          Grand Final!
        </p>
        <button onClick={loadBracket} className="btn btn-secondary refresh-btn">
          <FaSyncAlt /> Refresh Bracket
        </button>
      </div>

      <div className="bracket-container">
        <div className="round-column">
          <h2 className="round-title">Quarter-Finals</h2>
          <div className="matches-column">
            {matches.quarterFinals.map((m) => (
              <MatchCard key={m.id} match={m} />
            ))}
          </div>
        </div>

        <div className="bracket-connector"></div>

        <div className="round-column">
          <h2 className="round-title">Semi-Finals</h2>
          <div className="matches-column">
            {matches.semiFinals.map((m) => (
              <MatchCard key={m.id} match={m} />
            ))}
          </div>
        </div>

        <div className="bracket-connector"></div>

        <div className="round-column final-round">
          <h2 className="round-title">Final</h2>
          <div className="matches-column">
            {matches.final ? (
              <MatchCard match={matches.final} />
            ) : (
              <div className="no-match-card">Final Match TBD</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default BracketPage;
