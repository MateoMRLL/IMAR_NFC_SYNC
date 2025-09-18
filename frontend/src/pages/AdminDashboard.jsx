import { useNavigate } from "react-router-dom";
import Dashboard from "../components/Dashboard.jsx"; // Assure-toi que le chemin est correct
import HomeButton from "../components/HomeButton.jsx";
import "./AdminDashboard.css";

export default function AdminDashboard() {
 const navigate = useNavigate();

 return (
  <div className="admin-dashboard-container">
   <HomeButton />
   <Dashboard />
  </div>
 );
}