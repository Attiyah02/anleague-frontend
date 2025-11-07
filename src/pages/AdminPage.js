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
import { db } from "../firebase";
import { 
  collection, 
  getDocs, 
  doc, 
  getDoc, 
  updateDoc, 
  setDoc, 
  deleteDoc 
} from "firebase/firestore";

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
      // Load matches
      const matchesSnapshot = await getDocs(collection(db, "matches"));
      const matchesData = matchesSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setMatches(matchesData);

      // Load teams
      const teamsSnapshot = await getDocs(collection(db, "teams"));
      const teamsData = teamsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setTeams(teamsData);
      setTeamCount(teamsData.length);

      // Load tournament status
      const statusDoc = await getDoc(doc(db, "tournament", "status"));
      setTournamentStatus(statusDoc.exists() ? statusDoc.data() : { status: "Not Started" });

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

  // Generate bracket
  async function handleStartTournament() {
    if (teamCount !== 8) {
      showMessage(`Need exactly 8 teams. Currently: ${teamCount} teams.`, "error");
      return;
    }

    if (matches.length > 0) {
      showMessage("Tournament already started!", "error");
      return;
    }

    setActionLoading("start");
    try {
      // Get all teams
      const teamsSnapshot = await getDocs(collection(db, "teams"));
      const allTeams = teamsSnapshot.docs.map(doc => ({
        country: doc.id,
        teamId: doc.id,
        teamRating: doc.data().teamRating,
        manager: doc.data().manager,
        players: doc.data().players
      }));

      // Shuffle teams
      const shuffled = allTeams.sort(() => Math.random() - 0.5);

      // Create Quarter-Finals
      const qfMatches = [
        { matchId: "QF1", round: "Quarter-Final", matchNumber: 1, team1: shuffled[0], team2: shuffled[1] },
        { matchId: "QF2", round: "Quarter-Final", matchNumber: 2, team1: shuffled[2], team2: shuffled[3] },
        { matchId: "QF3", round: "Quarter-Final", matchNumber: 3, team1: shuffled[4], team2: shuffled[5] },
        { matchId: "QF4", round: "Quarter-Final", matchNumber: 4, team1: shuffled[6], team2: shuffled[7] }
      ];

      // Create Semi-Finals (TBD teams)
      const sfMatches = [
        { 
          matchId: "SF1", 
          round: "Semi-Final", 
          matchNumber: 1, 
          team1: { country: "TBD", teamId: "TBD" }, 
          team2: { country: "TBD", teamId: "TBD" },
          dependsOn: ["QF1", "QF2"]
        },
        { 
          matchId: "SF2", 
          round: "Semi-Final", 
          matchNumber: 2, 
          team1: { country: "TBD", teamId: "TBD" }, 
          team2: { country: "TBD", teamId: "TBD" },
          dependsOn: ["QF3", "QF4"]
        }
      ];

      // Create Final
      const finalMatch = {
        matchId: "FINAL",
        round: "Final",
        matchNumber: 1,
        team1: { country: "TBD", teamId: "TBD" },
        team2: { country: "TBD", teamId: "TBD" },
        dependsOn: ["SF1", "SF2"]
      };

      // Add common fields
      const allMatches = [...qfMatches, ...sfMatches, finalMatch].map(match => ({
        ...match,
        status: match.team1.country === "TBD" ? "locked" : "pending",
        score: { team1: null, team2: null },
        goalScorers: [],
        winner: null,
        nextMatch: null,
        timestamp: null
      }));

      // Set nextMatch references
      allMatches[0].nextMatch = "SF1";
      allMatches[1].nextMatch = "SF1";
      allMatches[2].nextMatch = "SF2";
      allMatches[3].nextMatch = "SF2";
      allMatches[4].nextMatch = "FINAL";
      allMatches[5].nextMatch = "FINAL";

      // Save to Firebase
      for (const match of allMatches) {
        await setDoc(doc(db, "matches", match.matchId), match);
      }

      // Update tournament status
      await setDoc(doc(db, "tournament", "status"), {
        status: "In Progress",
        startedAt: new Date().toISOString()
      });

      showMessage("Tournament started! Bracket generated.", "success");
      await loadData();
    } catch (error) {
      console.error("Error starting tournament:", error);
      showMessage("Failed to start tournament", "error");
    } finally {
      setActionLoading(null);
    }
  }

  // Reset tournament
  async function handleResetTournament() {
    if (!window.confirm("Reset tournament? This will clear all matches.")) return;

    setActionLoading("reset");
    try {
      // Delete all matches
      const matchesSnapshot = await getDocs(collection(db, "matches"));
      for (const matchDoc of matchesSnapshot.docs) {
        await deleteDoc(matchDoc.ref);
      }

      // Reset tournament status
      await setDoc(doc(db, "tournament", "status"), {
        status: "Not Started"
      });

      showMessage("Tournament reset successfully!", "success");
      await loadData();
    } catch (error) {
      console.error("Error resetting:", error);
      showMessage("Failed to reset", "error");
    } finally {
      setActionLoading(null);
    }
  }

  // Simulate match (client-side)
  async function handleSimulateMatch(matchId) {
    setActionLoading(`simulate-${matchId}`);
    try {
      const matchRef = doc(db, "matches", matchId);
      const matchSnap = await getDoc(matchRef);
      
      if (!matchSnap.exists()) {
        showMessage("Match not found", "error");
        return;
      }

      const match = matchSnap.data();

      if (match.status !== "pending") {
        showMessage("Match not available", "error");
        return;
      }

      // Get team ratings
      const team1Doc = await getDoc(doc(db, "teams", match.team1.teamId));
      const team2Doc = await getDoc(doc(db, "teams", match.team2.teamId));
      
      const rating1 = team1Doc.data()?.teamRating || 50;
      const rating2 = team2Doc.data()?.teamRating || 50;

      // Simple simulation
      const prob1 = rating1 / (rating1 + rating2);
      const prob2 = rating2 / (rating1 + rating2);

      let score1 = Math.round(Math.max(0, (Math.random() + prob1) * 3));
      let score2 = Math.round(Math.max(0, (Math.random() + prob2) * 3));

      // Generate goal scorers
      const goalScorers = [];
      const team1Players = team1Doc.data()?.players || [];
      const team2Players = team2Doc.data()?.players || [];

      for (let i = 0; i < score1; i++) {
        const player = team1Players[Math.floor(Math.random() * team1Players.length)];
        goalScorers.push({
          player: player?.name || "Unknown",
          team: match.team1.country,
          minute: Math.floor(Math.random() * 90) + 1
        });
      }

      for (let i = 0; i < score2; i++) {
        const player = team2Players[Math.floor(Math.random() * team2Players.length)];
        goalScorers.push({
          player: player?.name || "Unknown",
          team: match.team2.country,
          minute: Math.floor(Math.random() * 90) + 1
        });
      }

      goalScorers.sort((a, b) => a.minute - b.minute);

      // Determine winner
      let winner;
      let penaltyShootout = null;

      if (score1 > score2) {
        winner = { ...match.team1, wonBy: "normal" };
      } else if (score2 > score1) {
        winner = { ...match.team2, wonBy: "normal" };
      } else {
        // Penalties
        const team1Pens = Math.floor(Math.random() * 6);
        const team2Pens = Math.floor(Math.random() * 6);
        
        winner = team1Pens >= team2Pens ? { ...match.team1, wonBy: "penalties" } : { ...match.team2, wonBy: "penalties" };
        
        penaltyShootout = {
          score: { team1: team1Pens, team2: team2Pens },
          winner: winner.country,
          penalties: {
            team1: Array(5).fill(0).map(() => ({
              player: team1Players[Math.floor(Math.random() * team1Players.length)]?.name,
              scored: Math.random() > 0.3
            })),
            team2: Array(5).fill(0).map(() => ({
              player: team2Players[Math.floor(Math.random() * team2Players.length)]?.name,
              scored: Math.random() > 0.3
            }))
          }
        };
      }

      // Update match
      await updateDoc(matchRef, {
        status: "completed",
        score: { team1: score1, team2: score2 },
        goalScorers: goalScorers,
        winner: winner,
        penaltyShootout: penaltyShootout,
        simulationType: "simulated",
        timestamp: new Date().toISOString()
      });

      // Update next round
      if (match.nextMatch) {
        const nextMatchRef = doc(db, "matches", match.nextMatch);
        const nextMatchSnap = await getDoc(nextMatchRef);
        
        if (nextMatchSnap.exists()) {
          const nextMatch = nextMatchSnap.data();
          const updates = {};

          if (nextMatch.dependsOn[0] === matchId) {
            updates.team1 = winner;
          } else if (nextMatch.dependsOn[1] === matchId) {
            updates.team2 = winner;
          }

          // Check if both teams are ready
          if (nextMatch.team1.country !== "TBD" || updates.team1) {
            if (nextMatch.team2.country !== "TBD" || updates.team2) {
              updates.status = "pending";
            }
          }

          await updateDoc(nextMatchRef, updates);
        }
      }

      showMessage(`Match ${matchId} simulated!`, "success");
      await loadData();
    } catch (error) {
      console.error("Error simulating:", error);
      showMessage("Failed to simulate", "error");
    } finally {
      setActionLoading(null);
    }
  }

  // Play with AI (simplified - just simulates)
  async function handlePlayMatch(matchId) {
    showMessage("AI commentary not available in client-only mode. Using quick simulate.", "info");
    await handleSimulateMatch(matchId);
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