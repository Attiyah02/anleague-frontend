import { HashRouter, Routes, Route } from "react-router-dom";
import "./App.css";

// Import pages
import HomePage from "./pages/HomePage";
import BracketPage from "./pages/BracketPage";
import MatchPage from "./pages/MatchPage";
import TopScorersPage from "./pages/TopScorersPage";
import LoginPage from "./pages/LoginPage";
import AdminPage from "./pages/AdminPage";
import RepresentativePage from "./pages/RepresentativePage";
import RegisterTeamPage from "./pages/RegisterTeamPage";
import SignUpPage from "./pages/SignUpPage";

// Import navbar
import Navbar from "./components/Navbar";

function App() {
  return (
    <HashRouter>
      <div className="App">
        <Navbar />

        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/bracket" element={<BracketPage />} />
          <Route path="/match/:matchId" element={<MatchPage />} />
          <Route path="/top-scorers" element={<TopScorersPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/admin" element={<AdminPage />} />
          <Route path="/representative" element={<RepresentativePage />} />
          <Route path="/register-team" element={<RegisterTeamPage />} />
          <Route path="/signup" element={<SignUpPage />} />
        </Routes>
      </div>
    </HashRouter>
  );
}

export default App;
