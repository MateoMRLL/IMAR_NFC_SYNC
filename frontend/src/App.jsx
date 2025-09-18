import { ShieldCheck, User } from "lucide-react";
import { Route, BrowserRouter as Router, Routes, useNavigate } from "react-router-dom";
import "./App.css";
import Maintile from "./components/MainTile.jsx";

import AdminDashboard from "./pages/AdminDashboard.jsx";
import LinkAccount from "./pages/LinkPage.jsx";
import Registration from "./pages/RegistrationPage.jsx";

const HomePage = () => {
  const navigate = useNavigate();

  return (
    <div className="tiles-grid">
      <Maintile
        title="Create User"
        description="Testing purpose"
        buttonText="Register"
        icon={User}
        onClick={() => navigate("/register")}
      />

      <Maintile
        title="Link"
        description="Link your account to your NFC tag"
        buttonText="Register"
        icon={User}
        onClick={() => navigate("/link")}
      />


      <Maintile
        title="Admin Access"
        buttonText="Enter"
        description="Administration"
        icon={ShieldCheck}
        onClick={() => navigate("/admin")}
      />
    </div>
  );
};

const App = () => {
  return (
    <Router>
      <div className="app-container">
        <Routes>
          {/* Page d'accueil avec les tuiles */}
          <Route path="/" element={<HomePage />} />

          {/* Routes secondaires */}
          <Route path="/register" element={<Registration />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/link" element={<LinkAccount />} />
        </Routes>
      </div>
    </Router>
  );
};

export default App;
