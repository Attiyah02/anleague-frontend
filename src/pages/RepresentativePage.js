import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { auth, db } from "../firebase";
import { collection, query, where, getDocs } from "firebase/firestore";
import "./RepresentativePage.css";
import {
  FaTrophy,
  FaUsers,
  FaFutbol,
  FaChartLine,
  FaMedal,
  FaStar,
  FaHome,
  FaCalendarAlt,
  FaExclamationCircle
} from "react-icons/fa";

function RepresentativePage() {
  const [team, setTeam] = useState(null);
  const [matches, setMatches] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadRepresentativeData = useCallback(async () => {
    try {
      if (!auth.currentUser) {
        setLoading(false);
        return;
      }

      // Get user's team
      const teamsRef = collection(db, "teams");
      const teamQuery = query(teamsRef, where("createdBy", "==", auth.currentUser.uid));
      const teamSnapshot = await getDocs(teamQuery);

      if (!teamSnapshot.empty) {
        const teamData = { id: teamSnapshot.docs[0].id, ...teamSnapshot.docs[0].data() };
        setTeam(teamData);

        // Get matches involving this team
        const matchesRef = collection(db, "matches");
        const allMatches = await getDocs(matchesRef);
        
        const teamMatches = allMatches.docs
          .map(doc => ({ id: doc.id, ...doc.data() }))
          .filter(match => 
            match.team1?.country === teamData.country || 
            match.team2?.country === teamData.country
          )
          .sort((a, b) => {
            const order = { "Quarter-Final": 1, "Semi-Final": 2, "Final": 3 };
            return order[a.round] - order[b.round];
          });

        setMatches(teamMatches);

        // Calculate statistics
        const teamStats = calculateStats(teamData, teamMatches);
        setStats(teamStats);
      }

      setLoading(false);
    } catch (error) {
      console.error("Error loading data:", error);
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadRepresentativeData();
  }, [loadRepresentativeData]);

  function calculateStats(team, matches) {
    const played = matches.filter(m => m.status === "completed").length;
    const won = matches.filter(m => 
      m.status === "completed" && m.winner?.country === team.country
    ).length;
    const lost = played - won;

    let goalsScored = 0;
    let goalsConceded = 0;

    matches.forEach(match => {
      if (match.status === "completed") {
        const isTeam1 = match.team1.country === team.country;
        goalsScored += isTeam1 ? match.score.team1 : match.score.team2;
        goalsConceded += isTeam1 ? match.score.team2 : match.score.team1;
      }
    });

    // Get top scorers from this team
    const teamScorers = {};
    matches.forEach(match => {
      if (match.goalScorers) {
        match.goalScorers
          .filter(scorer => scorer.team === team.country)
          .forEach(scorer => {
            teamScorers[scorer.player] = (teamScorers[scorer.player] || 0) + 1;
          });
      }
    });

    const topScorers = Object.entries(teamScorers)
      .map(([player, goals]) => ({ player, goals }))
      .sort((a, b) => b.goals - a.goals)
      .slice(0, 5);

    return {
      played,
      won,
      lost,
      goalsScored,
      goalsConceded,
      goalDifference: goalsScored - goalsConceded,
      topScorers
    };
  }

  if (loading) {
    return (
      <div 
        className="representative-page"
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
        <div className="loading-container">
          <div className="spinner"></div>
          <h2>Loading your dashboard...</h2>
        </div>
      </div>
    );
  }

  if (!team) {
    return (
      <div 
        className="representative-page"
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
        <div className="no-team-container">
          <div className="no-team-icon">
            <FaExclamationCircle />
          </div>
          <h2>No Team Registered</h2>
          <p>You haven't registered a team yet.</p>
          <Link to="/register-team" className="btn-register">
            <FaTrophy /> Register Your Team
          </Link>
        </div>
      </div>
    );
  }

  const captain = team.players?.find(p => p.isCaptain);
  const nextMatch = matches.find(m => m.status === "pending");
  const lastMatch = matches.filter(m => m.status === "completed").pop();

  return (
    <div 
      className="representative-page"
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
      {/* Quick Navigation */}
      <div className="quick-nav">
        <Link to="/" className="nav-link">
          <FaHome /> Home
        </Link>
        <Link to="/bracket" className="nav-link">
          <FaTrophy /> Bracket
        </Link>
        <Link to="/top-scorers" className="nav-link">
          <FaMedal /> Top Scorers
        </Link>
      </div>

      {/* Header */}
      <div className="rep-header">
        <h1>{team.country}</h1>
        <p className="manager-name">
          Manager: <strong>{team.manager}</strong>
        </p>
      </div>

      {/* Team Stats Overview */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon rating">
            <FaStar />
          </div>
          <div className="stat-value">{team.teamRating}</div>
          <div className="stat-label">Team Rating</div>
        </div>

        <div className="stat-card">
          <div className="stat-icon matches">
            <FaFutbol />
          </div>
          <div className="stat-value">{stats.played}</div>
          <div className="stat-label">Matches Played</div>
        </div>

        <div className="stat-card">
          <div className="stat-icon won">
            <FaTrophy />
          </div>
          <div className="stat-value">{stats.won}</div>
          <div className="stat-label">Wins</div>
        </div>

        <div className="stat-card">
          <div className="stat-icon goals">
            <FaChartLine />
          </div>
          <div className="stat-value">
            {stats.goalDifference > 0 ? `+${stats.goalDifference}` : stats.goalDifference}
          </div>
          <div className="stat-label">Goal Difference</div>
        </div>
      </div>

      {/* Next/Last Match */}
      <div className="match-preview-section">
        {nextMatch ? (
          <div className="match-preview next">
            <h3><FaCalendarAlt /> Next Match</h3>
            <div className="match-info">
              <div className="match-round">{nextMatch.round}</div>
              <div className="match-teams">
                <span className={nextMatch.team1.country === team.country ? "highlight" : ""}>
                  {nextMatch.team1.country}
                </span>
                <span className="vs">VS</span>
                <span className={nextMatch.team2.country === team.country ? "highlight" : ""}>
                  {nextMatch.team2.country}
                </span>
              </div>
              <div className="match-status">
                {nextMatch.status === "pending" ? "⏳ Awaiting Results" : "🔒 Locked"}
              </div>
            </div>
          </div>
        ) : lastMatch ? (
          <div className="match-preview last">
            <h3><FaFutbol /> Last Match</h3>
            <div className="match-info">
              <div className="match-round">{lastMatch.round}</div>
              <div className="match-teams">
                <span className={lastMatch.team1.country === team.country ? "highlight" : ""}>
                  {lastMatch.team1.country}
                </span>
                <span className="score">{lastMatch.score.team1} - {lastMatch.score.team2}</span>
                <span className={lastMatch.team2.country === team.country ? "highlight" : ""}>
                  {lastMatch.team2.country}
                </span>
              </div>
              <div className="match-result">
                {lastMatch.winner?.country === team.country ? (
                  <span className="won">✓ Victory!</span>
                ) : (
                  <span className="lost">✗ Defeated</span>
                )}
                {lastMatch.winner?.wonBy === "penalties" && " (Penalties)"}
              </div>
            </div>
          </div>
        ) : (
          <div className="match-preview empty">
            <h3>No Matches Yet</h3>
            <p>Tournament hasn't started. Check back soon!</p>
          </div>
        )}
      </div>

      {/* Squad Section */}
      <div className="squad-section">
        <h2><FaUsers /> Your Squad</h2>
        
        {/* Captain */}
        {captain && (
          <div className="captain-card">
            <div className="captain-badge">⭐ CAPTAIN</div>
            <h3>{captain.name}</h3>
            <div className="captain-stats">
              <div className="stat-item">
                <span className="label">Position:</span>
                <span className="value">{captain.position}</span>
              </div>
              <div className="stat-item">
                <span className="label">Rating:</span>
                <span className="value">{captain.ratings[captain.position]}</span>
              </div>
            </div>
          </div>
        )}

        {/* Players Grid */}
        <div className="players-grid">
          {team.players?.slice(0, 11).map((player, i) => (
            <div key={i} className={`player-card ${player.isCaptain ? "captain" : ""}`}>
              <div className="player-name">
                {player.isCaptain && "⭐ "}{player.name}
              </div>
              <div className="player-position">{player.position}</div>
              <div className="player-rating">{player.ratings[player.position]}</div>
            </div>
          ))}
        </div>

        {team.players?.length > 11 && (
          <div className="squad-note">
            + {team.players.length - 11} more players in squad
          </div>
        )}
      </div>

      {/* Top Scorers */}
      {stats.topScorers.length > 0 && (
        <div className="top-scorers-section">
          <h2><FaMedal /> Top Scorers</h2>
          <div className="scorers-list">
            {stats.topScorers.map((scorer, i) => (
              <div key={i} className="scorer-item">
                <span className="rank">{i + 1}</span>
                <span className="player-name">{scorer.player}</span>
                <span className="goals">{scorer.goals} ⚽</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Match History */}
      {matches.length > 0 && (
        <div className="match-history-section">
          <h2><FaCalendarAlt /> Match History</h2>
          <div className="matches-list">
            {matches.map((match) => (
              <Link 
                key={match.id} 
                to={`/match/${match.matchId}`}
                className={`history-match ${match.status}`}
              >
                <div className="match-round-badge">{match.round}</div>
                <div className="match-details">
                  <div className="teams">
                    {match.team1.country} vs {match.team2.country}
                  </div>
                  {match.status === "completed" ? (
                    <div className="result">
                      {match.score.team1} - {match.score.team2}
                      {match.winner && (
                        <span className={match.winner.country === team.country ? "won" : "lost"}>
                          {match.winner.country === team.country ? " ✓ Won" : " ✗ Lost"}
                        </span>
                      )}
                    </div>
                  ) : (
                    <div className="status-badge">{match.status}</div>
                  )}
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default RepresentativePage;