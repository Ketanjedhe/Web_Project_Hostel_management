import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../styles/AdminDashboard.css';
import ViewHostels from './view_hostel_admin';
import ApproveHostel from './ApproveHostel';
import ViewStudents from './ViewStudents';

function AdminDashboard() {
  const navigate = useNavigate();
  const [selectedComponent, setSelectedComponent] = useState(null);
  const [hostels, setHostels] = useState([]);
  const [approvedCount, setApprovedCount] = useState(0);
  const [pendingCount, setPendingCount] = useState(0);
  const [rejectedCount, setRejectedCount] = useState(0);
  const [updateCount, setUpdateCount] = useState(0); // Track updates

  // Fetch hostels data when component mounts or when updateCount changes
  useEffect(() => {
    const fetchHostels = async () => {
      try {
        const response = await axios.get('http://localhost:5000/all-hostels'); // Fetch hostels
        const hostelsData = response.data;

        setHostels(hostelsData);

        // Update counts
        const approved = hostelsData.filter(hostel => hostel.approval_status === 'approved').length;
        const pending = hostelsData.filter(hostel => hostel.approval_status === 'pending').length;
        const rejected = hostelsData.filter(hostel => hostel.approval_status === 'rejected').length;

        setApprovedCount(approved);
        setPendingCount(pending);
        setRejectedCount(rejected);
      } catch (error) {
        console.error('Error fetching hostels:', error);
      }
    };

    fetchHostels(); // Fetch data initially
  }, [updateCount]); // Re-fetch when updateCount changes

  const handleLogout = () => {
    // Implement logout logic here, like clearing tokens or session
    navigate('/admin-login'); // Redirect to login page
  };

  const handleComponentChange = (component) => {
    setSelectedComponent(component);
  };

  const triggerUpdate = () => {
    setUpdateCount(prev => prev + 1); // Increment to trigger re-fetch
  };

  return (
    <div className="dashboard">
      <div className="sidebar">
        <h2>Admin Dashboard</h2>
        <ul>
          <li onClick={() => handleComponentChange('viewHostels')}>View Hostels</li>
          <li onClick={() => handleComponentChange('approveHostel')}>Approve Hostels</li>
          <li onClick={() => handleComponentChange('viewStudents')}>View Students</li>
        </ul>
        <button onClick={handleLogout} className="logout-button">Logout</button>
      </div>
      <div className="main-content">
        <header>
          <h1>Welcome, Admin!</h1>
          <p>Manage your hostels and view statistics here.</p>
        </header>
        <div className="content">
          {selectedComponent === 'viewHostels' && <ViewHostels />}
          {selectedComponent === 'approveHostel' && <ApproveHostel onAction={triggerUpdate} />} {/* Pass triggerUpdate */}
          {selectedComponent === 'viewStudents' && <ViewStudents />}
        </div>
        <div className="stats-cards">
          <div className="card">
            <h3>Total Hostels</h3>
            <p>{hostels.length}</p>
          </div>
          <div className="card">
            <h3>Pending Approvals</h3>
            <p>{pendingCount}</p>
          </div>
          <div className="card">
            <h3>Approved Hostels</h3>
            <p>{approvedCount}</p>
          </div>
          <div className="card">
            <h3>Rejected Hostels</h3>
            <p>{rejectedCount}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;
