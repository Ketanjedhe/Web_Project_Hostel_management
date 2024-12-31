// frontend/AboutPage.js
import React from 'react';
import '../styles/AboutPage.css'; // Import the corresponding CSS file
import Navbar from './Navbar';
import Footer from './Footer';

const AboutPage = () => {
  return (
    <>
    <div>
        <Navbar/>
      <main>
        <div className="about-section">
          <h1>About Us</h1>
          <p>
            Hostel Hub is dedicated to providing the best hostel management solutions for owners, colleges, and students. Our platform streamlines operations, enhances communication, and provides a seamless experience for all users.
          </p>
          <h2>Our Mission</h2>
          <p>
            Our mission is to make hostel management easy and efficient, allowing owners to focus on providing great experiences for their guests. We believe in using technology to simplify complex processes and improve overall service quality.
          </p>
          <h2>Meet the Team</h2>
          <p>
            Our team is made up of dedicated professionals with extensive experience in hospitality and technology. We are passionate about creating solutions that make a real difference in the lives of our users.
          </p>
        </div>
      </main>
      <div><Footer/></div>
    </div>
    
    </>
  );
};

export default AboutPage;
