import React, { useState, useEffect } from 'react';
import '../styles/OwnerDashboard.css';
import AddHostel from './AddHostel';
import RemoveHostel from './RemoveHostel';
import ViewHostels from './ViewHostels';
import UpdateHostel from './UpdateHostel';
import ManageUsers from './ManageUsers';
import ViewStudents from './ViewStudents';

const OwnerDashboard = () => {
  const [formType, setFormType] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const checkSession = async () => {
      try {
        const response = await fetch('/owner-session', {
          method: 'GET',
          credentials: 'include',
        });
        if (response.ok) {
          setIsLoggedIn(true);
        } else {
          setIsLoggedIn(false);
        }
      } catch (error) {
        console.error('Error checking session:', error);
        setIsLoggedIn(false);
      }
    };

    checkSession();
  }, []);

  const handleButtonClick = (type) => {
    setFormType(type);
  };

  const handleLogout = async () => {
    try {
      await fetch('/owner-logout', {
        method: 'POST',
        credentials: 'include',
      });
      window.location.href = '/owner-login';
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  if (!isLoggedIn) {
    return <div>Please log in to access the dashboard.</div>;
  }

  return (
    <div className="dashboard">
      <header className="navbar">
        <div className="navbar-container">
          <h1>Hostel Owner Dashboard</h1>
          <button onClick={handleLogout} className="logout-button">Logout</button>
        </div>
      </header>
      <div className="dashboard-content">
        <aside className="sidebar">
          <h2>Select Menu :</h2>
          <ul>
            <li><button onClick={() => handleButtonClick('add')}>Add Hostel</button></li>
            <li><button onClick={() => handleButtonClick('remove')}>Remove Hostel</button></li>
            <li><button onClick={() => handleButtonClick('view')}>View Hostels</button></li>
            <li><button onClick={() => handleButtonClick('viewstu')}>View Students</button></li>
            <li><button onClick={() => handleButtonClick('update')}>Update Hostel</button></li>
            <li><button onClick={() => handleButtonClick('manageUsers')}>Manage Students</button></li>
          </ul>
        </aside>
        <main className="main-content">
          <div className="form-container">
            {formType === 'add' && <AddHostel />}
            {formType === 'remove' && <RemoveHostel />}
            {formType === 'view' && <ViewHostels />}
            {formType === 'viewstu' && <ViewStudents />}
            {formType === 'update' && <UpdateHostel />}
            {formType === 'manageUsers' && <ManageUsers />}
          </div>
        </main>
      </div>
    </div>
  );
};

export default OwnerDashboard;
