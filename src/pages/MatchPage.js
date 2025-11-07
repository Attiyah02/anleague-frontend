import { useState, useEffect, useCallback } from "react";
import { useParams, Link } from "react-router-dom";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebase";
import "./MatchPage.css";
import { 
  FaTrophy, 
  FaFutbol, 
  FaClock, 
  FaUsers, 
  FaStar,
  FaArrowLeft,
  FaCheckCircle,
  FaTimesCircle,
  FaBolt
} from "react-icons/fa";
import { getCountryFlag } from "../utils/countryFlags";

function MatchPage() {
  const { matchId } = useParams();
  const [match, setMatch] = useState(null);
  const [loading, setLoading] = useState(true);

   const loadMatch = useCallback(async () => {
    try {
      const matchDoc = await getDoc(doc(db, "matches", matchId));
      if (matchDoc.exists()) {
        setMatch({ id: matchDoc.id, ...matchDoc.data() });
      }
      setLoading(false);
    } catch (error) {
      console.error("Error loading match:", error);
      setLoading(false);
    }
  }, [matchId]); // Add matchId as dependency

  useEffect(() => {
    loadMatch();
  }, [loadMatch]);
  

  if (loading) {
    return (
      <div className="match-page">
        <div className="loading-container">
          <div className="spinner"></div>
          <h2>Loading match details...</h2>
        </div>
      </div>
    );
  }

  if (!match) {
    return (
      <div className="match-page">
        <div className="error-container">
          <h2>Match not found</h2>
          <Link to="/bracket" className="back-link">
            <FaArrowLeft /> Back to Bracket
          </Link>
        </div>
      </div>
    );
  }

  const isCompleted = match.status === "completed";

  return (
    <div 
      className="match-page"
      style={{
        backgroundImage: `linear-gradient(
          rgba(0, 0, 0, 0.8),
          rgba(0, 0, 0, 0.8)
        ), url(${process.env.PUBLIC_URL}/images/stadium-dark.jpg)`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundAttachment: "fixed",
        backgroundRepeat: "no-repeat"
      }}
    >
      {/* Back Navigation */}
      <div className="back-nav">
        <Link to="/bracket" className="back-link">
          <FaArrowLeft /> Back to Bracket
        </Link>
      </div>

      {/* Match Header */}
      <div className="match-header-section">
        <div className="round-badge">{match.round}</div>
        <h1 className="match-title">Match {match.matchId}</h1>
      </div>

      {/* Match Score Card */}
      <div className="match-score-card">
        <div className="team-section team-1">
          <div className="team-flag">{getCountryFlag(match.team1.country)}</div>
          <h2 className="team-name">{match.team1.country}</h2>
          <div className="team-info">
            <div className="info-item">
              <FaUsers className="info-icon" />
              <span>{match.team1.manager || "Manager"}</span>
            </div>
            <div className="info-item">
              <FaStar className="info-icon" />
              <span>Rating: {match.team1.teamRating || "N/A"}</span>
            </div>
          </div>
        </div>

        <div className="score-section">
          {isCompleted ? (
            <>
              <div className="score-display">
                <span className="score-number">{match.score.team1}</span>
                <span className="score-separator">-</span>
                <span className="score-number">{match.score.team2}</span>
              </div>
              {match.winner && (
                <div className="winner-badge">
                  <FaTrophy className="trophy-icon" />
                  <span className="winner-text">
                    {match.winner.country} Wins!
                  </span>
                  {match.winner.wonBy === "penalties" && (
                    <span className="penalty-indicator">
                      <FaBolt /> On Penalties
                    </span>
                  )}
                </div>
              )}
            </>
          ) : (
            <div className="match-pending">
              <FaClock className="pending-icon" />
              <span className="pending-text">
                {match.status === "pending" ? "Awaiting Results" : "Match Locked"}
              </span>
            </div>
          )}
        </div>

        <div className="team-section team-2">
          <div className="team-flag">{getCountryFlag(match.team2.country)}</div>
          <h2 className="team-name">{match.team2.country}</h2>
          <div className="team-info">
            <div className="info-item">
              <FaUsers className="info-icon" />
              <span>{match.team2.manager || "Manager"}</span>
            </div>
            <div className="info-item">
              <FaStar className="info-icon" />
              <span>Rating: {match.team2.teamRating || "N/A"}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Goal Scorers */}
      {isCompleted && match.goalScorers && match.goalScorers.length > 0 && (
        <div className="match-details-card">
          <h3 className="section-title">
            <FaFutbol /> Goal Scorers
          </h3>
          <div className="goal-scorers-list">
            {match.goalScorers.map((scorer, index) => (
              <div key={index} className="goal-scorer-item">
                <div className="scorer-info">
                  <FaFutbol className="goal-icon" />
                  <span className="scorer-name">{scorer.player}</span>
                  <span className="scorer-team">({scorer.team})</span>
                </div>
                <div className="scorer-time">
                  <FaClock className="time-icon" />
                  {scorer.minute}'
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Penalty Shootout */}
      {match.winner?.wonBy === "penalties" && match.penaltyShootout && (
        <div className="match-details-card penalty-card">
          <h3 className="section-title penalty-title">
            <FaBolt /> Penalty Shootout
          </h3>
          
          <div className="penalty-score-display">
            <span className="penalty-team-name">{match.team1.country}</span>
            <div className="penalty-score-box">
              <span className="penalty-score-number">
                {match.penaltyShootout.score.team1}
              </span>
              <span className="penalty-separator">-</span>
              <span className="penalty-score-number">
                {match.penaltyShootout.score.team2}
              </span>
            </div>
            <span className="penalty-team-name">{match.team2.country}</span>
          </div>

          {match.penaltyShootout.rounds > 5 && (
            <div className="sudden-death-banner">
              💥 Sudden Death - {match.penaltyShootout.rounds} rounds!
            </div>
          )}

          <div className="penalty-shootout-grid">
            <div className="penalty-column">
              <h4 className="penalty-column-title">{match.team1.country}</h4>
              {match.penaltyShootout.penalties.team1.map((penalty, i) => (
                <div 
                  key={i} 
                  className={`penalty-kick ${penalty.scored ? 'scored' : 'missed'} ${penalty.suddenDeath ? 'sudden-death' : ''}`}
                >
                  <span className="penalty-number">
                    {penalty.suddenDeath ? '💥' : `${i + 1}.`}
                  </span>
                  <span className="penalty-taker">{penalty.player}</span>
                  <span className={`penalty-outcome ${penalty.scored ? 'scored' : 'missed'}`}>
                    {penalty.scored ? (
                      <><FaCheckCircle /> Scored</>
                    ) : (
                      <><FaTimesCircle /> Missed</>
                    )}
                  </span>
                </div>
              ))}
            </div>

            <div className="penalty-column">
              <h4 className="penalty-column-title">{match.team2.country}</h4>
              {match.penaltyShootout.penalties.team2.map((penalty, i) => (
                <div 
                  key={i} 
                  className={`penalty-kick ${penalty.scored ? 'scored' : 'missed'} ${penalty.suddenDeath ? 'sudden-death' : ''}`}
                >
                  <span className="penalty-number">
                    {penalty.suddenDeath ? '💥' : `${i + 1}.`}
                  </span>
                  <span className="penalty-taker">{penalty.player}</span>
                  <span className={`penalty-outcome ${penalty.scored ? 'scored' : 'missed'}`}>
                    {penalty.scored ? (
                      <><FaCheckCircle /> Scored</>
                    ) : (
                      <><FaTimesCircle /> Missed</>
                    )}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* AI Commentary */}
      {match.commentary && (
        <div className="match-details-card commentary-card">
          <h3 className="section-title">
            <FaBolt /> AI Match Commentary
          </h3>
          <div className="commentary-text">
            {match.commentary}
          </div>
        </div>
      )}

      {/* Match Info Summary */}
      <div className="match-info-card">
        <h3 className="section-title">Match Information</h3>
        <div className="info-grid">
          <div className="info-box">
            <div className="info-label">Round</div>
            <div className="info-value">{match.round}</div>
          </div>
          <div className="info-box">
            <div className="info-label">Match ID</div>
            <div className="info-value">{match.matchId}</div>
          </div>
          <div className="info-box">
            <div className="info-label">Status</div>
            <div className="info-value status">
              {match.status === "completed" ? "✓ Completed" : 
               match.status === "pending" ? "⏳ Pending" : "🔒 Locked"}
            </div>
          </div>
          {match.timestamp && (
            <div className="info-box">
              <div className="info-label">Played On</div>
              <div className="info-value">
                {new Date(match.timestamp).toLocaleString()}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default MatchPage;