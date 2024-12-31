import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/OwnerRegister.css'; // Ensure this path is correct

const OwnerRegister = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [address, setAddress] = useState('');

  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();

    const ownerData = {
      name,
      email,
      password,
      phone_number: phoneNumber,
      address,
    };

    fetch('http://localhost:5000/register_owner', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(ownerData),
    })
      .then(response => {
        if (!response.ok) {
          return response.text().then(text => {
            throw new Error(text);
          });
        }
        return response.json();
      })
      .then(data => {
        if (data.message === 'Registration successful') {
          alert('Registration successful!');
          navigate('/owner-login');
        } else {
          alert('Registration failed: ' + data.message);
        }
      })
      .catch(error => {
        console.error('Error:', error);
        alert('An error occurred during registration: ' + error.message);
      });
  };

  return (
    <div className="register-container">
      <div className="right-section">
        <div className="logo">
          <img src="/image.png" alt="HostelHub Logo" />
        </div>
        <div className="form-container">
          <h2>Create New Account</h2>
          <p>
            Already have an account? <a href="/owner-login">Log in here</a>
          </p>
          <form onSubmit={handleSubmit}>
            <input
              type="text"
              name="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Please enter your name"
              required
            />
            <input
              type="email"
              name="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Please enter Email"
              required
            />
            <input
              type="password"
              name="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Please enter password"
              required
            />
            <input
              type="tel"
              name="phone_number"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              placeholder="Please enter phone number"
              required
            />
            <textarea
              name="address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Please enter your address"
              rows="3"
              required
            />
            <button type="submit" className="register-button">Sign Up</button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default OwnerRegister;
