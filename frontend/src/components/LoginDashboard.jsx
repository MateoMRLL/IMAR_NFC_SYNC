// src/components/LoginDashboard.jsx
import { useState } from 'react';
import './LoginDashboard.css';

const LoginDashboard = () => {
 const [email, setEmail] = useState('');
 const [password, setPassword] = useState('');

 const handleSubmit = (e) => {
  e.preventDefault();
  if (email && password) {
   console.log('Attempting login with email:', email, 'and password:', password);
   alert('Login function to be implemented');
  } else {
   alert('Please enter your email and admin password');
  }
 };

 const handleCancel = () => {
  setEmail('');
  setPassword('');
  console.log('Form canceled');
 };

 return (
  <div className="login-dashboard-tile">
   <div className="shield-icon">
    <svg className="shield" viewBox="0 0 24 24">
     <path d="M12,1L3,5V11C3,16.55 6.84,21.74 12,23C17.16,21.74 21,16.55 21,11V5L12,1M12,7C13.4,7 14.8,8.6 14.8,10.1V11.1C14.9,11.1 15,11.2 15,11.3V16.6C15,16.8 14.8,17 14.6,17H9.4C9.2,17 9,16.8 9,16.6V11.3C9,11.2 9.1,11.1 9.2,11.1V10.1C9.2,8.6 10.6,7 12,7M12,8.2C11.2,8.2 10.5,8.7 10.5,10.1V11.1H13.5V10.1C13.5,8.7 12.8,8.2 12,8.2Z" />
    </svg>
   </div>

   <h1 className="title">Admin Access</h1>
   <p className="subtitle">Enter your email and administrator password to access the dashboard</p>

   <form onSubmit={handleSubmit}>
    {/* Email field */}
    <div className="form-group">
     <label className="form-label" htmlFor="admin-email">Email Address</label>
     <input
      type="email"
      id="admin-email"
      className="form-input"
      placeholder="Enter your email"
      value={email}
      onChange={(e) => setEmail(e.target.value)}
      required
     />
    </div>

    {/* Password field */}
    <div className="form-group">
     <label className="form-label" htmlFor="admin-password">Admin Password</label>
     <input
      type="password"
      id="admin-password"
      className="form-input"
      placeholder="Enter admin password"
      value={password}
      onChange={(e) => setPassword(e.target.value)}
      required
     />
    </div>

    <div className="button-group">
     <button type="submit" className="btn btn-primary">Login as Admin</button>
     <button type="button" className="btn btn-secondary" onClick={handleCancel}>Cancel</button>
    </div>
   </form>
  </div>
 );
};

export default LoginDashboard;
