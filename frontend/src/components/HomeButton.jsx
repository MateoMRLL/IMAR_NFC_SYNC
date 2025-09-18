// src/components/HomeButton.jsx
import { Home } from "lucide-react";
import { useNavigate } from "react-router-dom";
import './HomeButton.css';

const HomeButton = ({
 position = "top-left",
 variant = "default",
 className = "",
 onClick = null
}) => {
 const navigate = useNavigate();

 const handleClick = () => {
  if (onClick) {
   onClick();
  } else {
   navigate("/");
  }
 };

 return (
  <div className={`home-button-container ${position} ${className}`}>
   <button
    className={`home-btn ${variant}`}
    onClick={handleClick}
    aria-label="Retour à l'accueil"
   >
    <Home className="home-icon" />
    Home
   </button>
  </div>
 );
};

export default HomeButton;