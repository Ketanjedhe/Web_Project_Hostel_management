import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../styles/ViewHostels.css'; // Add custom styles here

const ViewHostels = () => {
  const [hostels, setHostels] = useState([]);
  const [selectedHostel, setSelectedHostel] = useState(null);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const ownerId = localStorage.getItem('owner_id');

  useEffect(() => {
    const fetchHostels = async () => {
      if (!ownerId) {
        setError('Owner ID not found. Please log in again.');
        setIsLoading(false);
        return;
      }

      try {
        const response = await axios.get(`http://localhost:5000/owner-hostels/${ownerId}`);
        setHostels(response.data);
        console.log(response);
      } catch (err) {
        setError('Error fetching hostels: ' + err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchHostels();
  }, [ownerId]);

  if (error) {
    return <div>Error: {error}</div>;
  }

  if (isLoading) {
    return <div>Loading hostels...</div>;
  }

  const handleViewDetails = (hostel) => {
    setSelectedHostel(hostel);
  };

  const handleBack = () => {
    setSelectedHostel(null);
  };

  return (
    <div className="view-hostels-container">
      <br /><br /><br /><br /><br /><br /><br /><br /><br /><br /><br /><br /><br /><br /><br /><br /><br /><br /><br /><br /><br /><br /><br />
      
      <h1>My Hostels</h1>


      {!selectedHostel ? (
        <ul className="hostel-list">
          {hostels.length > 0 ? (
            hostels.map((hostel, index) => (
              <li key={hostel.hostel_id} className="hostel-item">
                <span>{index + 1}. {hostel.name}</span>
                <button onClick={() => handleViewDetails(hostel)} className="view-details-btn">
                  View Hostel
                </button>
              </li>
            ))
          ) : (
            <p>No hostels found for this owner.</p>
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
              onError={(e) => { e.target.src = ''; }} // fallback image
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

          {/* Display facilities */}
          <div className="hostel-facilities">
            <h3>Facilities:</h3>
            <ul>
              {selectedHostel.facilities && selectedHostel.facilities.length > 0 ? (
                selectedHostel.facilities.map((facility, index) => (
                  <li key={index}>{facility}</li>
                ))
              ) : (
                <p>No facilities available for this hostel.</p>
              )}
            </ul>
          </div>

          <button onClick={handleBack} className="back-btn">
            Back to Hostels
          </button>
        </div>
      )}
    </div>
  );
};

export default ViewHostels;
