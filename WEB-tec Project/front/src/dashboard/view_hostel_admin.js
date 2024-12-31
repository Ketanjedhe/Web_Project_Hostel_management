import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../styles/view_hostel_admin.css'; // Add custom styles here

const ViewHostels = () => {
  const [hostels, setHostels] = useState([]);
  const [selectedHostel, setSelectedHostel] = useState(null);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchHostels = async () => {
      try {
        const response = await axios.get('http://localhost:5000/all-hostels'); // Adjust URL as needed
        setHostels(response.data);
      } catch (err) {
        setError('Error fetching hostels: ' + err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchHostels();
  }, []);

  const handleViewDetails = (hostel) => {
    setSelectedHostel(hostel);
  };

  const handleBack = () => {
    setSelectedHostel(null);
  };

  const handleApprove = async (hostelId) => {
    try {
      console.log(hostelId)
      await axios.post(`http://localhost:5000/api/hostels/approve/${hostelId}`);
      alert('Hostel approved successfully');
      // Refresh the list after approval
      setHostels(hostels.map(h => h.hostel_id === hostelId ? { ...h, approval_status: 'approved' } : h));
    } catch (err) {
      console.error('Error approving hostel:', err);
      alert('Error approving hostel');
    }
  };

  const handleReject = async (hostelId) => {
    try {
      await axios.post(`http://localhost:5000/api/hostels/reject/${hostelId}`);
      alert('Hostel rejected successfully');
      // Refresh the list after rejection
      setHostels(hostels.map(h => h.hostel_id === hostelId ? { ...h, approval_status: 'rejected' } : h));
    } catch (err) {
      console.error('Error rejecting hostel:', err);
      alert('Error rejecting hostel');
    }
  };

  if (error) {
    return <div>Error: {error}</div>;
  }

  if (isLoading) {
    return <div>Loading hostels...</div>;
  }

  return (
    <div className="view-hostels-container">
      <h1>All Hostels</h1>

      {!selectedHostel ? (
        <ul className="hostel-list">
          {hostels.length > 0 ? (
            hostels.map((hostel) => (
              <li key={hostel.hostel_id} className="hostel-item">
                <div className="hostel-info">
                  <h3>
                    {hostel.approval_status ? `(${hostel.approval_status.toUpperCase()}) ` : ''}
                    {hostel.name}
                  </h3>
                  {hostel.image_path ? (
                    <img
                      src={`http://localhost:5000${hostel.image_path}`}
                      alt={`${hostel.name} Image`}
                      className="hostel-image"
                      onError={(e) => { e.target.src = 'path/to/placeholder.jpg'; }} // fallback image
                    />
                  ) : (
                    <p>No image available.</p>
                  )}
                </div>
                <button onClick={() => handleViewDetails(hostel)} className="view-details-btn">
                  View Hostel
                </button>
              </li>
            ))
          ) : (
            <p>No hostels found.</p>
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

          <div className="button-group">
            <button onClick={() => handleApprove(selectedHostel._id)} className="approve-btn">
              Approve
            </button>
            <button onClick={() => handleReject(selectedHostel._id)} className="reject-btn">
              Reject
            </button>
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
