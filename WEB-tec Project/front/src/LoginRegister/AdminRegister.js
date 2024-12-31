import React, { useState } from 'react';
import '../styles/AdminRegister.css';

function AdminRegister() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [position, setPosition] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
  
    const adminData = {
      name,
      email,
      password,
      phone_number: phoneNumber,
      position,
    };
  
    fetch('http://localhost:5000/register_admin', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(adminData),
    })
      .then(response => response.json())
      .then(data => {
        if (data.message === 'Registration successful') {
          alert('Registration successful!');
          window.location.href = '/admin-login';
        } else {
          alert('Registration failed. Please try again.');
        }
      })
      .catch((error) => {
        console.error('Error:', error);
        alert('An error occurred. Please try again.');
      });
  };
  
  return (
    <div className="register-container">
      <div className="right-section">
        <div className="logo">
          <img src="/image.png" alt="HostelHub Logo" />
        </div>

        <div className="form-container">
          <h2>Create Admin Account</h2>
          <p>
            Already Registered? <a href="/admin-login">Login as Admin</a>
          </p>
          <form onSubmit={handleSubmit}>
            <input
              type="text"
              name="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Please enter your full name"
              required
            />
            <input
              type="email"
              name="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Please enter your email"
              required
            />
            <input
              type="password"
              name="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Please enter your password"
              required
            />
            <input
              type="tel"
              name="phone_number"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              placeholder="Please enter your phone number"
              required
            />
            <input
              type="text"
              name="position"
              value={position}
              onChange={(e) => setPosition(e.target.value)}
              placeholder="Please enter your position"
              required
            />
            <button type="submit" className="register-button">Register</button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default AdminRegister;
