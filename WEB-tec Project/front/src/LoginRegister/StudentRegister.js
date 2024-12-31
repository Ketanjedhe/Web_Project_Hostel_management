import React, { useState } from 'react';
import '../styles/StudentRegister.css';

function StudentRegister() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [gender, setGender] = useState('');
  const [address, setAddress] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
  
    const studentData = {
      name,
      email,
      password,
      date_of_birth: dateOfBirth,
      phone_number: phoneNumber,
      gender,
      address,
    };
  
    fetch('http://localhost:5000/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(studentData),
    })
      .then(response => response.json())
      .then(data => {
        if (data.message) {
          alert('Registration successful!'); // Show success alert
          window.location.href = '/student-login'; // Redirect to login page
        }
      })
      .catch((error) => {
        console.error('Error:', error);
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
            Already Registered? <a href="/student-login">Login as Student</a> 
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
              type="date"
              name="date_of_birth"
              value={dateOfBirth}
              onChange={(e) => setDateOfBirth(e.target.value)}
              placeholder="Please enter date of birth"
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
            <select
              name="gender"
              value={gender}
              onChange={(e) => setGender(e.target.value)}
              required
            >
              <option value="" disabled>Select your gender</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
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
}

export default StudentRegister;
