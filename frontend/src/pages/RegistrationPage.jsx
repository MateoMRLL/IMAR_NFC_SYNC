import { useNavigate } from "react-router-dom";
import CreateUserTile from "../components/CreateUser";
import HomeButton from "../components/HomeButton";
import "./RegistrationPage.css";

export default function Registration() {
 const navigate = useNavigate();

 return (
  <div className="registration-container">
   <div className="home-button-wrapper">
    <HomeButton />
   </div>
   <CreateUserTile />
  </div>
 );
}
