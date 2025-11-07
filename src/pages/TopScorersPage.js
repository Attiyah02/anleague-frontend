import { useState, useEffect } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebase";
import { FaFutbol, FaTrophy, FaMedal } from "react-icons/fa";
import "./TopScorersPage.css";

function TopScorersPage() {
  const [scorers, setScorers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTopScorers();
  }, []);

  async function loadTopScorers() {
    try {
      const matchesSnapshot = await getDocs(collection(db, "matches"));
      const scorerCounts = {};

      matchesSnapshot.forEach(doc => {
        const match = doc.data();
        if (match.goalScorers && Array.isArray(match.goalScorers)) {
          match.goalScorers.forEach(scorer => {
            const key = `${scorer.player}|${scorer.team}`;
            scorerCounts[key] = (scorerCounts[key] || 0) + 1;
          });
        }
      });

      const topScorers = Object.entries(scorerCounts)
        .map(([key, goals]) => {
          const [player, team] = key.split("|");
          return { player, team, goals };
        })
        .sort((a, b) => b.goals - a.goals);

      setScorers(topScorers);
      setLoading(false);
    } catch (error) {
      console.error("Error loading scorers:", error);
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="top-scorers-page">
        <div className="loading-container">
          <h2>Loading top scorers...</h2>
        </div>
      </div>
    );
  }

 return (
  <div className="top-scorers-page">
    {/* Hero Section with Stadium Background */}
    <div 
      className="hero-section"
      style={{
        backgroundImage: `linear-gradient(
          rgba(0, 0, 0, 0.7),
          rgba(0, 0, 0, 0.7)
        ), url(/images/stadium-dark.jpg)`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundAttachment: "fixed",
        backgroundRepeat: "no-repeat"
      }}
    >
      <div className="hero-content">
        <h1 className="hero-title">
          <FaFutbol /> Top Goal Scorers <span className="year">2026</span>
        </h1>
        <p className="hero-tagline">
          Celebrating the sharpshooters of African football
        </p>
      </div>
    </div>
    
      {/* Main Content */}
      <div className="scorers-content">
        {scorers.length > 0 ? (
          <>
            {/* Stats Summary */}
            <div className="stats-summary">
              <div className="stat-box">
                <div className="stat-icon">
                  <FaTrophy />
                </div>
                <div className="stat-number">{scorers.length}</div>
                <div className="stat-label">Total Scorers</div>
              </div>
              <div className="stat-box">
                <div className="stat-icon">
                  <FaFutbol />
                </div>
                <div className="stat-number">
                  {scorers.reduce((sum, s) => sum + s.goals, 0)}
                </div>
                <div className="stat-label">Total Goals</div>
              </div>
              <div className="stat-box">
                <div className="stat-icon">
                  <FaMedal />
                </div>
                <div className="stat-number">{scorers[0]?.goals || 0}</div>
                <div className="stat-label">Golden Boot</div>
              </div>
            </div>

            {/* Golden Boot Section (Top 3) */}
            {scorers.length >= 3 && (
              <div className="golden-boot-section">
                <h2 className="section-title">Golden Boot Race</h2>
                <div className="podium">
                  {/* 2nd Place */}
                  <div className="podium-card second">
                    <div className="podium-rank">🥈</div>
                    <div className="podium-player">{scorers[1].player}</div>
                    <div className="podium-team">{scorers[1].team}</div>
                    <div className="podium-goals">{scorers[1].goals} Goals</div>
                  </div>

                  {/* 1st Place */}
                  <div className="podium-card first">
                    <div className="podium-rank">🥇</div>
                    <div className="podium-player">{scorers[0].player}</div>
                    <div className="podium-team">{scorers[0].team}</div>
                    <div className="podium-goals">{scorers[0].goals} Goals</div>
                    <div className="golden-boot-badge">
                      <FaTrophy /> Golden Boot
                    </div>
                  </div>

                  {/* 3rd Place */}
                  <div className="podium-card third">
                    <div className="podium-rank">🥉</div>
                    <div className="podium-player">{scorers[2].player}</div>
                    <div className="podium-team">{scorers[2].team}</div>
                    <div className="podium-goals">{scorers[2].goals} Goals</div>
                  </div>
                </div>
              </div>
            )}

            {/* Complete Scorers List */}
            <div className="scorers-list-section">
              <h2 className="section-title">Complete Rankings</h2>
              
              <div className="scorers-table">
                <div className="table-header">
                  <div className="col-rank">Rank</div>
                  <div className="col-player">Player</div>
                  <div className="col-team">Team</div>
                  <div className="col-goals">Goals</div>
                </div>

                {scorers.map((scorer, index) => {
                  let medal = "";
                  if (index === 0) medal = "🥇";
                  else if (index === 1) medal = "🥈";
                  else if (index === 2) medal = "🥉";

                  return (
                    <div key={index} className={`table-row ${index < 3 ? "podium" : ""}`}>
                      <div className="col-rank">
                        <span className="rank-number">{index + 1}</span>
                        {medal && <span className="medal">{medal}</span>}
                      </div>
                      <div className="col-player">{scorer.player}</div>
                      <div className="col-team">{scorer.team}</div>
                      <div className="col-goals">
                        <span className="goals-badge">{scorer.goals}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </>
        ) : (
          <div className="no-data">
            <div className="no-data-icon">
              <FaFutbol />
            </div>
            <h3>No Goals Yet!</h3>
            <p>The tournament hasn't started or no matches have been completed.</p>
            <p>Check back soon to see the leading scorers!</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default TopScorersPage;