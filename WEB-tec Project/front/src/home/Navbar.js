import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/Navbar.css'; // Ensure the CSS path is correct

const Navbar = () => {
  return (
    <header className="custom-navbar">
      <div className="custom-navbar-logo">
        <div className="logo-container">
          <img src="image.png" alt="Hostel Hub Logo" className="logo-image" />
        </div>
        <h1>Hostel Hub</h1>
      </div>
      <nav>
        <ul className="custom-navbar-links">
          <li className="menu-item"><Link to="/">Home</Link></li>
          <li className="menu-item"><Link to="/about">About</Link></li>
          <li className="menu-item"><Link to="/reviews">Reviews</Link></li>
          <li className="menu-item"><Link to="/contact">Contact</Link></li>
        </ul>
      </nav>
    </header>
  );
};

export default Navbar;
