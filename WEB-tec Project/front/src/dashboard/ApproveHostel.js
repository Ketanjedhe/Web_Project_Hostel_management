import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../styles/ApproveHostel.css'; // Add custom styles here

const ApproveHostel = () => {
  const [approvedHostels, setApprovedHostels] = useState([]);
  const [selectedHostel, setSelectedHostel] = useState(null);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const ownerId = localStorage.getItem('owner_id');

  useEffect(() => {
    const fetchApprovedHostels = async () => {
      if (!ownerId) {
        setError('Owner ID not found. Please log in again.');
        setIsLoading(false);
        return;
      }

      try {
        const response = await axios.get(`http://localhost:5000/owner-hostels/${ownerId}`);
        // Filter only approved hostels
        const approved = response.data.filter((hostel) => hostel.approval_status === 'approved');
        setApprovedHostels(approved);
      } catch (err) {
        setError('Error fetching hostels: ' + err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchApprovedHostels();
  }, [ownerId]);

  if (error) {
    return <div>Error: {error}</div>;
  }

  if (isLoading) {
    return <div>Loading approved hostels...</div>;
  }

  const handleViewDetails = (hostel) => {
    setSelectedHostel(hostel);
  };

  const handleBack = () => {
    setSelectedHostel(null);
  };

  return (
    <div className="approve-hostels-container">
      <h1>Approved Hostels</h1>

      {!selectedHostel ? (
        <ul className="hostel-list">
          {approvedHostels.length > 0 ? (
            approvedHostels.map((hostel, index) => (
              <li key={hostel.hostel_id} className="hostel-item">
                <span>{index + 1}. {hostel.name}</span>
                <button onClick={() => handleViewDetails(hostel)} className="view-details-btn">
                  View Hostel
                </button>
              </li>
            ))
          ) : (
            <p>No approved hostels found for this owner.</p>
          )}
        </ul>
      ) : (
        <div className="hostel-details">
          <h2>{selectedHostel.name}</h2>

          {selectedHostel.image_path ? (
            <img
              src={`http://localhost:5000${selectedHostel.image_path}`}
              alt={`${selectedHostel.name} Image`}
              className="hostel-image"
              onError={(e) => { e.target.src = 'path/to/placeholder.jpg'; }} // fallback image
            />
          ) : (
            <p>No image available for this hostel.</p>
          )}

          <p><strong>Address:</strong> {selectedHostel.address}</p>
          <p><strong>Description:</strong> {selectedHostel.description}</p>
          <p><strong>Rent:</strong> {selectedHostel.rent || 'N/A'}</p>
          <p><strong>Total Rooms:</strong> {selectedHostel.total_rooms || 'N/A'}</p>
          <p><strong>Available Rooms:</strong> {selectedHostel.available_rooms || 'N/A'}</p>
          <p><strong>Approval Status:</strong> {selectedHostel.approval_status || 'Pending'}</p>

          <button onClick={handleBack} className="back-btn">
            Back to Approved Hostels
          </button>
        </div>
      )}
    </div>
  );
};

export default ApproveHostel;
