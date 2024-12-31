import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/OwnerLogin.css'; // Ensure the path is correct

function OwnerLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate(); // Hook for navigation

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch('http://localhost:5000/owner-login', { // Adjust URL as needed
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        // Check if owner_id is included in the response and is valid
        if (data.owner_id) {
          localStorage.setItem('owner_id', data.owner_id);
          console.log('Owner ID:', data.owner_id); // Log the owner_id
          navigate('/owner-dashboard');
        } else {
          setError('Owner ID not found in response.');
        }
      } else {
        setError(data.message || 'Login failed');
      }
    } catch (error) {
      console.error('Error logging in:', error);
      setError('An error occurred during login.');
    }
  };

  const handleRegistration = () => {
    navigate('/owner-register'); // Navigate to the registration page
  };

  const handleLoginClick = () => {
    navigate('/login'); // Navigate back to the login page
  };

  return (
    <div className="login-container">
      <form onSubmit={handleSubmit} className="login-form">
        <h1>HostelHub - Owner Login</h1>
        <input
          type="email"
          id="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          placeholder="Email"
        />
        <input
          type="password"
          id="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          placeholder="Password"
        />
        <button type="submit" className="login-button">Login</button>
        {error && <p className="error-message">{error}</p>}
        <div className="info">
          <p>Don't have an account? <button onClick={handleRegistration} className="link-button">Register here</button></p>
        </div>
        <button type="button" className="back-button" onClick={handleLoginClick}>Back to Website</button>
      </form>
    </div>
  );
}

export default OwnerLogin;
