import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/Shc.css'; // Ensure the path is correct
import Navbar from './Navbar'; // Ensure the path is correct
import Footer from './Footer'; // Ensure the path is correct

function Shc() {
  return (
    <div className="shc-container"> 
      <Navbar />
      <div className="intro">
        <h1>HostelHub: Your Home Away From Home</h1>
        <p>Welcome to HostelHub, the ultimate solution for all your hostel needs. Whether you're a student, a hostel owner, or part of college management, we have something for you.</p>
      </div>
      <main className="main-content">
        <div className="option">
          <Link to="/student-login" className="option-link">
          <img src="student.jpg" alt="Student" />
            <h2>Student</h2>
            <p>Find and book the best hostels near your college with ease.</p>
          </Link>
        </div>
        <div className="option">
          <Link to="/owner-login" className="option-link">
            <img src="https://img.freepik.com/free-photo/3d-illustration-young-man-with-glasses-business-suit_1142-58817.jpg" alt="Hostel Owner" />
            <h2>Hostel Owner</h2>
            <p>Manage your hostel, view bookings, and connect with students.</p>
          </Link>
        </div>
        <div className="option">
          <Link to="/admin-login" className="option-link">
            <img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQynsz_8o3LWHP194VmFPIlHHhGXj-fGy3WEg&s" alt="College Management" />
            <h2>College Management</h2>
            <p>Oversee hostel operations and ensure a seamless experience for everyone.</p>
          </Link>
        </div>
      </main>
      <Footer />
    </div>
  );
}

export default Shc;
