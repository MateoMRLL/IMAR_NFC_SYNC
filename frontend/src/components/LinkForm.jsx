import { Check, CreditCard, Mail, User, XCircle } from "lucide-react";
import { useState } from "react";
import "./LinkForm.css";

import { API_URL } from "../config";

export default function LinkAccountForm() {
 const [formData, setFormData] = useState({
  lastname: "",
  email: "",
  nfcUid: "",
  verificationCode: "",
 });

 const [step, setStep] = useState(1);
 const [message, setMessage] = useState("");
 const [errorMessage, setErrorMessage] = useState("");

 const handleChange = (e) => {
  const { name, value } = e.target;
  setFormData((prev) => ({ ...prev, [name]: value }));
 };

 const handleSubmitInfo = async (e) => {
  e.preventDefault();
  setMessage("");
  setErrorMessage("");

  try {
   // Vérifier si tag déjà assigné
   const checkRes = await fetch(`${API_URL}/api/assign/check`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
     email: formData.email,
     tag_id: formData.nfcUid,
    }),
   });

   const checkData = await checkRes.json();
   if (!checkRes.ok) {
    setErrorMessage(checkData.error || "Unable to verify tag assignment. Please try again.");
    return;
   }

   if (checkData.assigned) {
    setErrorMessage("This NFC tag is already linked to another account.");
    return;
   }
   // Envoyer email de vérification
   const sendRes = await fetch(`${API_URL}/api/auth/send-code`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
     name: formData.lastname,
     email: formData.email,
     tagId: formData.nfcUid,
    }),
   });

   const sendData = await sendRes.json();
   if (!sendRes.ok) {
    setErrorMessage(sendData.message || "Unable to send verification email. Please try again.");
    return;
   }

   setMessage("Verification email has been sent. Please check your inbox.");
   setStep(2);
  } catch (err) {
   console.error(err);
   setErrorMessage("Cannot connect to the server. Please check your internet connection or try again later.");
  }
 };

 // Step 2: Vérifier code + assigner tag
 const handleVerifyCode = async (e) => {
  e.preventDefault();
  setMessage("");
  setErrorMessage("");

  try {
   const verifyRes = await fetch(`${API_URL}/api/auth/verify-code`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
     email: formData.email,
     code: formData.verificationCode,
    }),
   });

   const verifyData = await verifyRes.json();
   if (!verifyRes.ok) {
    setErrorMessage(verifyData.message || "Invalid or expired verification code.");
    return;
   }

   const assignRes = await fetch(`${API_URL}/api/assign/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
     email: formData.email,
     nfc_uid: formData.nfcUid,
    }),
   });

   const assignData = await assignRes.json();
   console.log(assignData);

   console.log(assignData.message);
   if (!assignRes.ok) {
    setErrorMessage(assignData.message || "Failed to link the NFC tag. Please try again.");
    return;
   }

   setMessage(`Success! Your tag ${formData.nfcUid} is now linked to your account.`);
   setStep(3);
  } catch (err) {
   console.error(err);
   setErrorMessage("Cannot reach the server. Please check your connection or try again later.");
  }
 };

 // Resend code
 const handleResendCode = async () => {
  try {
   const res = await fetch(`${API_URL}/api/auth/resend-code`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: formData.email }),
   });

   const data = await res.json();
   if (!res.ok) {
    setErrorMessage(data.message || "Failed to resend verification code.");
    return;
   }

   setMessage("A new verification code has been sent to your email.");
   setTimeout(() => setMessage(""), 4000);
  } catch (err) {
   console.error(err);
   setErrorMessage("Unable to contact the server to resend the code. Please try again later.");
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

    {/* Step 1 */}
    {step === 1 && (
     <form onSubmit={handleSubmitInfo} className="user-info-form">
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

      <div className="form-group">
       <label htmlFor="nfcUid">NFC UID</label>
       <div className="input-wrapper">
        <CreditCard className="input-icon" />
        <input
         type="text"
         id="nfcUid"
         name="nfcUid"
         value={formData.nfcUid}
         onChange={handleChange}
         placeholder="e.g. ABC123DEF456"
         required
        />
       </div>
      </div>

      <button type="submit" className="submit-btn">
       Continue
      </button>
     </form>
    )}

    {/* Step 2 */}
    {step === 2 && (
     <form onSubmit={handleVerifyCode} className="user-info-form">
      <div className="form-group">
       <label htmlFor="verificationCode">Verification Code</label>
       <div className="input-wrapper">
        <XCircle className="input-icon" />
        <input
         type="text"
         id="verificationCode"
         name="verificationCode"
         value={formData.verificationCode}
         onChange={handleChange}
         placeholder="Enter code"
         required
        />
       </div>
      </div>

      <button type="submit" className="submit-btn">
       Verify & Link
      </button>

      <button
       type="button"
       onClick={handleResendCode}
       className="submit-btn resend-btn"
      >
       Resend Code
      </button>
     </form>
    )}

    {/* Step 3 */}
    {step === 3 && (
     <div className="submitted-message">
      <div className="icon-circle success">
       <Check className="icon-success" />
      </div>
      <h3>Account Linked!</h3>
      <p>Your tag {formData.nfcUid} is now linked to your account.</p>
     </div>
    )}

    {/* Notifications */}
    {step !== 3 && message && (
     <div className="success-banner">
      <Check className="success-icon" />
      <span>{message}</span>
     </div>
    )}
    {step !== 3 && errorMessage && (
     <div className="error-banner">
      <XCircle className="error-icon" />
      <span>{errorMessage}</span>
     </div>
    )}

    <div className="user-info-footer">
     <p>Your information is handled securely and confidentially.</p>
    </div>
   </div>
  </div>
 );
}
