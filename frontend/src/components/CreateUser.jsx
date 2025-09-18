import { Check, Mail, User, XCircle } from "lucide-react";
import { useState } from "react";
import "./CreateUser.css";


import { API_URL } from "../config";

export default function CreateUserTile() {
 const [formData, setFormData] = useState({
  lastname: "",
  email: "",
  nfcUid: "",
 });

 const [isSubmitted, setIsSubmitted] = useState(false);
 const [errorMessage, setErrorMessage] = useState("");

 const handleChange = (e) => {
  const { name, value } = e.target;
  setFormData((prev) => ({
   ...prev,
   [name]: value,
  }));
 };

 const handleSubmit = async (e) => {
  e.preventDefault();
  const { lastname, email } = formData;

  const payload = {
   name: lastname,
   email,
  };

  if (!lastname || !email) return;

  try {
   const response = await fetch(`${API_URL}/api/users/`, {
    method: "POST",
    headers: {
     "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
   });

   if (!response.ok) {
    const errorData = await response.json();
    setErrorMessage(errorData.message || "Failed to save data");
    setTimeout(() => setErrorMessage(""), 4000);
    return;
   }

   setIsSubmitted(true);
   setTimeout(() => setIsSubmitted(false), 3000);
  } catch (error) {
   console.error("Network error:", error);
   setErrorMessage("A network error occurred. Please try again later.");
   setTimeout(() => setErrorMessage(""), 4000);
  }
 };

 return (
  <div className="user-info-page">
   <div className="user-info-card">
    <div className="user-info-header">
     <div className="icon-circle">
      <User className="icon-main" />
     </div>
     <h2>User Information</h2>
     <p>Please fill in your details</p>
    </div>

    {isSubmitted ? (
     <div className="submitted-message">
      <div className="icon-circle success">
       <Check className="icon-success" />
      </div>
      <h3>Saved!</h3>
      <p>Thank you {formData.lastname}</p>
     </div>
    ) : errorMessage ? (
     <div className="error-message">
      <div className="icon-circle error">
       <XCircle className="icon-error" />
      </div>
      <h3>The user you entered already exists</h3>
     </div>
    ) : (
     <form onSubmit={handleSubmit} className="user-info-form">
      <div className="form-group">
       <label htmlFor="lastname">Last Name</label>
       <div className="input-wrapper">
        <User className="input-icon" />
        <input
         type="text"
         id="lastname"
         name="lastname"
         value={formData.lastname}
         onChange={handleChange}
         placeholder="Doe"
         required
        />
       </div>
      </div>

      <div className="form-group">
       <label htmlFor="email">Email Address</label>
       <div className="input-wrapper">
        <Mail className="input-icon" />
        <input
         type="email"
         id="email"
         name="email"
         value={formData.email}
         onChange={handleChange}
         placeholder="john.doe@example.com"
         required
        />
       </div>
      </div>

      <button type="submit" className="submit-btn">
       Save Information
      </button>
     </form>
    )}

    <div className="user-info-footer">
     <p>Your information is handled securely and confidentially.</p>
    </div>
   </div>
  </div>
 );
}
