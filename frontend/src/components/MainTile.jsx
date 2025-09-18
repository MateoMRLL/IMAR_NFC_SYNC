import { User } from "lucide-react";
import { useState } from "react";
import "./MainTile.css";

export default function Maintile({
 title = "User Login",
 description = "Access the system with your credentials and NFC tag",
 buttonText = "Login",
 icon: Icon = User,
 onClick = () => { },
}) {
 const [isHovered, setIsHovered] = useState(false);

 return (
  <div className="login-container">
   <div
    className={`login-card ${isHovered ? "hovered" : ""}`}
    onMouseEnter={() => setIsHovered(true)}
    onMouseLeave={() => setIsHovered(false)}
   >
    {/* Icône */}
    <div className="icon-wrapper">
     <div className="icon-background">
      <Icon
       size={32}
       className={`user-icon ${isHovered ? "user-icon-hover" : ""}`}
      />
     </div>
    </div>

    {/* Titre */}
    <h2 className="login-title">{title}</h2>

    {/* Description */}
    <p className="login-description">{description}</p>

    {/* Bouton */}
    <button onClick={onClick} className="login-button">
     {buttonText}
    </button>

    {/* Loader */}
    <div className="loading-wrapper">
     <div className="loading-dots">
      <div className="dot"></div>
      <div className="dot delay-75"></div>
      <div className="dot delay-150"></div>
     </div>
    </div>
   </div>
  </div>
 );
}
