import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import "./AdminPage.css";
import { 
  FaTrophy, 
  FaUsers, 
  FaFutbol, 
  FaChartBar,
  FaPlay,
  FaRobot,
  FaRedo,
  FaCheckCircle,
  FaLock,
  FaClock,
  FaHome,
  FaMedal
} from "react-icons/fa";

const API_URL = "http://localhost:3001/api";

function AdminPage() {
  const [matches, setMatches] = useState([]);
  const [teams, setTeams] = useState([]);
  const [teamCount, setTeamCount] = useState(0);
  const [tournamentStatus, setTournamentStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [message, setMessage] = useState({ text: "", type: "" });

  const loadData = useCallback(async () => {
    try {
      const [matchesRes, teamsRes, countRes, statusRes] = await Promise.all([
        fetch(`${API_URL}/matches`),
        fetch(`${API_URL}/teams`),
        fetch(`${API_URL}/teams/count`),
        fetch(`${API_URL}/tournament/status`)
      ]);

      const matchesData = await matchesRes.json();
      const teamsData = await teamsRes.json();
      const countData = await countRes.json();
      const statusData = await statusRes.json();

      setMatches(matchesData);
      setTeams(teamsData);
      setTeamCount(countData.count);
      setTournamentStatus(statusData);
      setLoading(false);
    } catch (error) {
      console.error("Error loading data:", error);
      showMessage("Failed to load data", "error");
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 5000);
    return () => clearInterval(interval);
  }, [loadData]);

  function showMessage(text, type = "success") {
    setMessage({ text, type });
    setTimeout(() => setMessage({ text: "", type: "" }), 5000);
  }

  async function handleStartTournament() {
    if (teamCount !== 8) {
      showMessage(`Need exactly 8 teams. Currently: ${teamCount} teams.`, "error");
      return;
    }

    setActionLoading("start");
    try {
      const response = await fetch(`${API_URL}/tournament/start`, { method: "POST" });
      const data = await response.json();

      if (response.ok) {
        showMessage("Tournament started! Bracket generated.", "success");
        await loadData();
      } else {
        showMessage(data.error || "Failed to start tournament", "error");
      }
    } catch (error) {
      showMessage("Error starting tournament", "error");
    } finally {
      setActionLoading(null);
    }
  }

  async function handleResetTournament() {
    if (!window.confirm("Reset tournament? This will clear all matches.")) return;

    setActionLoading("reset");
    try {
      const response = await fetch(`${API_URL}/tournament/reset`, { method: "POST" });
      const data = await response.json();

      if (response.ok) {
        showMessage("Tournament reset successfully!", "success");
        await loadData();
      } else {
        showMessage(data.error || "Failed to reset", "error");
      }
    } catch (error) {
      showMessage("Error resetting tournament", "error");
    } finally {
      setActionLoading(null);
    }
  }

  async function handleSimulateMatch(matchId) {
    setActionLoading(`simulate-${matchId}`);
    try {
      const response = await fetch(`${API_URL}/match/simulate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ matchId }),
      });

      if (response.ok) {
        showMessage(`Match ${matchId} simulated!`, "success");
        await loadData();
      } else {
        const data = await response.json();
        showMessage(data.error || "Failed to simulate", "error");
      }
    } catch (error) {
      showMessage("Error simulating match", "error");
    } finally {
      setActionLoading(null);
    }
  }

  async function handlePlayMatch(matchId) {
    setActionLoading(`play-${matchId}`);
    try {
      const response = await fetch(`${API_URL}/match/play`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ matchId }),
      });

      if (response.ok) {
        showMessage(`Match ${matchId} played with AI!`, "success");
        await loadData();
      } else {
        const data = await response.json();
        showMessage(data.error || "Failed to play", "error");
      }
    } catch (error) {
      showMessage("Error playing match", "error");
    } finally {
      setActionLoading(null);
    }
  }

  if (loading) {
    return (
      <div className="admin-page">
        <div className="loading-container">
          <div className="spinner"></div>
          <h2>Loading dashboard...</h2>
        </div>
      </div>
    );
  }

  const completedMatches = matches.filter(m => m.status === "completed").length;
  const totalMatches = matches.length;
  const progress = totalMatches > 0 ? (completedMatches / totalMatches) * 100 : 0;

  // Group matches by round
  const qfMatches = matches.filter(m => m.round === "Quarter-Final");
  const sfMatches = matches.filter(m => m.round === "Semi-Final");
  const finalMatch = matches.find(m => m.round === "Final");

  return (
    <div className="admin-page">
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
      <div className="admin-header">
        <div className="header-icon">
          <FaTrophy />
        </div>
        <h1>Admin Dashboard</h1>
        <p>Manage the African Nations League Tournament</p>
      </div>

      {/* Message Banner */}
      {message.text && (
        <div className={`message-banner ${message.type}`}>
          {message.text}
        </div>
      )}

      {/* Stats Grid */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon teams">
            <FaUsers />
          </div>
          <div className="stat-value">{teamCount}/8</div>
          <div className="stat-label">Teams Registered</div>
        </div>

        <div className="stat-card">
          <div className="stat-icon matches">
            <FaFutbol />
          </div>
          <div className="stat-value">{completedMatches}/{totalMatches}</div>
          <div className="stat-label">Matches Completed</div>
        </div>

        <div className="stat-card">
          <div className="stat-icon progress">
            <FaChartBar />
          </div>
          <div className="stat-value">{Math.round(progress)}%</div>
          <div className="stat-label">Tournament Progress</div>
        </div>

        <div className="stat-card">
          <div className="stat-icon status">
            <FaTrophy />
          </div>
          <div className="stat-value status-text">
            {tournamentStatus?.status || "Not Started"}
          </div>
          <div className="stat-label">Status</div>
        </div>
      </div>

      {/* Tournament Actions */}
      <div className="admin-actions">
        <button
          className="action-btn start"
          onClick={handleStartTournament}
          disabled={teamCount !== 8 || actionLoading === "start" || matches.length > 0}
        >
          <FaPlay /> {actionLoading === "start" ? "Starting..." : "Start Tournament"}
        </button>

        <button
          className="action-btn reset"
          onClick={handleResetTournament}
          disabled={actionLoading === "reset" || matches.length === 0}
        >
          <FaRedo /> {actionLoading === "reset" ? "Resetting..." : "Reset Tournament"}
        </button>
      </div>

      {/* Warning */}
      {teamCount !== 8 && (
        <div className="warning-box">
          ⚠️ Need exactly 8 teams to start. Currently: {teamCount} teams.
          {teamCount < 8 && ` Need ${8 - teamCount} more.`}
        </div>
      )}

      {/* Matches Section */}
      <div className="matches-section">
        <h2><FaFutbol /> Tournament Matches</h2>

        {matches.length === 0 ? (
          <div className="empty-state">
            <FaTrophy className="empty-icon" />
            <h3>No Tournament Yet</h3>
            <p>Click "Start Tournament" when 8 teams are registered.</p>
          </div>
        ) : (
          <>
            {/* Quarter-Finals */}
            {qfMatches.length > 0 && (
              <div className="round-section">
                <h3 className="round-title">Quarter-Finals</h3>
                <div className="matches-grid">
                  {qfMatches.map((match) => (
                    <MatchCard
                      key={match.id}
                      match={match}
                      actionLoading={actionLoading}
                      onSimulate={handleSimulateMatch}
                      onPlay={handlePlayMatch}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Semi-Finals */}
            {sfMatches.length > 0 && (
              <div className="round-section">
                <h3 className="round-title">Semi-Finals</h3>
                <div className="matches-grid">
                  {sfMatches.map((match) => (
                    <MatchCard
                      key={match.id}
                      match={match}
                      actionLoading={actionLoading}
                      onSimulate={handleSimulateMatch}
                      onPlay={handlePlayMatch}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Final */}
            {finalMatch && (
              <div className="round-section">
                <h3 className="round-title final">🏆 Grand Final</h3>
                <div className="matches-grid final-grid">
                  <MatchCard
                    match={finalMatch}
                    actionLoading={actionLoading}
                    onSimulate={handleSimulateMatch}
                    onPlay={handlePlayMatch}
                  />
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Teams Section */}
      <div className="teams-section">
        <h2><FaUsers /> Registered Teams ({teamCount})</h2>
        <div className="teams-grid">
          {teams.map((team) => (
            <div key={team.id} className="team-card">
              <h3>{team.country}</h3>
              <div className="team-detail">
                <strong>Manager:</strong> {team.manager}
              </div>
              <div className="team-detail">
                <strong>Rating:</strong> <span className="rating-badge">{team.teamRating}</span>
              </div>
              <div className="team-detail">
                <strong>Players:</strong> {team.players?.length || 0}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Match Card Component
function MatchCard({ match, actionLoading, onSimulate, onPlay }) {
  return (
    <div className={`match-card ${match.status}`}>
      <div className="match-header">
        <span className="match-id">{match.matchId}</span>
        <span className={`status-badge ${match.status}`}>
          {match.status === "completed" && <><FaCheckCircle /> Completed</>}
          {match.status === "pending" && <><FaClock /> Ready</>}
          {match.status === "locked" && <><FaLock /> Locked</>}
        </span>
      </div>

      <div className="match-teams">
        <div className="team">{match.team1.country}</div>
        <div className="vs">VS</div>
        <div className="team">{match.team2.country}</div>
      </div>

      {match.status === "completed" && (
        <div className="match-result">
          <div className="score">
            {match.score.team1} - {match.score.team2}
          </div>
          {match.winner && (
            <div className="winner">
              Winner: <strong>{match.winner.country}</strong>
              {match.winner.wonBy === "penalties" && " (Penalties)"}
            </div>
          )}
        </div>
      )}

      {match.status === "pending" && (
        <div className="match-actions">
          <button
            className="btn-simulate"
            onClick={() => onSimulate(match.matchId)}
            disabled={actionLoading === `simulate-${match.matchId}`}
          >
            <FaPlay /> {actionLoading === `simulate-${match.matchId}` ? "..." : "Simulate"}
          </button>
          <button
            className="btn-play"
            onClick={() => onPlay(match.matchId)}
            disabled={actionLoading === `play-${match.matchId}`}
          >
            <FaRobot /> {actionLoading === `play-${match.matchId}` ? "..." : "AI Play"}
          </button>
        </div>
      )}
    </div>
  );
}

export default AdminPage;