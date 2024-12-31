import React from 'react';
import '../styles/Homepage.css'; // Updated CSS file path
import Navbar from './Navbar';
import Footer from './Footer';
import { useNavigate } from 'react-router-dom';

const HomePage = () => {
  const navigate = useNavigate();

  const redirectToLogin = () => {
    navigate('/login'); // Redirects to login page
  };

  return (
    <div>
      <Navbar />
      <main>
        <section className="hero">
          <h1>Welcome to Hostel Hub</h1>
          <div className="hero-text">
            <p>
              Discover a streamlined approach to managing hostels with Hostel Hub. Our platform is designed to simplify daily operations, ensuring smooth communication, effective maintenance handling, and hassle-free room management. Experience the perfect blend of innovation and efficiency tailored for students, owners, and institutions alike.
            </p>
          </div>
          <button onClick={redirectToLogin}>
            Get Started
          </button>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default HomePage;
