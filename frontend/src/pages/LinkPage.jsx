import { useNavigate } from "react-router-dom";
import HomeButton from "../components/HomeButton";
import LinkAccountForm from "../components/LinkForm";
import "./LinkPage.css";

export default function LinkAccount() {
 const navigate = useNavigate();

 return (
  <div className="linkpage-container">
   <div className="home-button-wrapper">
    <HomeButton />
   </div>
   <LinkAccountForm />
  </div>
 );
}
