import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../styles/UpdateHostel.css';

function UpdateHostel() {
  const [hostels, setHostels] = useState([]);
  const [selectedHostel, setSelectedHostel] = useState(null);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [totalRooms, setTotalRooms] = useState('');
  const [rent, setRent] = useState('');
  const [address, setAddress] = useState('');
  const [description, setDescription] = useState('');
  const [facilities, setFacilities] = useState([]);
  const availableFacilities = ["WiFi", "Laundry", "Kitchen", "Gym", "Parking"]; // Example facilities

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
      } catch (err) {
        setError('Error fetching hostels: ' + err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchHostels();
  }, [ownerId]);

  const handleUpdateClick = (hostel) => {
    setSelectedHostel(hostel);
    setTotalRooms(hostel.total_rooms || '');
    setRent(hostel.rent || '');
    setAddress(hostel.address || '');
    setDescription(hostel.description || '');
    setFacilities(hostel.facilities || []); // Pre-fill selected facilities
  };

  const handleBack = () => {
    setSelectedHostel(null);
    setMessage('');
  };

  const handleFacilityChange = (facility) => {
    setFacilities((prev) =>
      prev.includes(facility) ? prev.filter(f => f !== facility) : [...prev, facility]
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const updatedHostelData = {
      hostel_id: selectedHostel._id,
      total_rooms: totalRooms,
      rent: rent,
      address: address,
      description: description,
      facilities: facilities, // Include selected facilities
    };

    try {
      const response = await axios.put('http://localhost:5000/update-hostel', updatedHostelData);
      if (response.data.message) {
        setMessage('Hostel updated successfully!');
        setTimeout(() => {
          setSelectedHostel(null);
          setMessage(''); // Clear message after a few seconds
        }, 2000);
      } else {
        setMessage('Error updating hostel details');
      }
    } catch (error) {
      console.error('Error:', error);
      setMessage('Error updating hostel details');
    }
  };

  if (error) {
    return <div>Error: {error}</div>;
  }

  if (isLoading) {
    return <div>Loading hostels...</div>;
  }

  return (
    <div className="update-hostel-container">
      <br /><br /><br /><br /><br /><br /><br /><br /><br /><br /><br /><br /><br /><br /><br /><br /><br /><br /><br /><br /><br /><br /><br /><br /><br /><br /><br /><br /><br /><br />
      <h1>Update Hostel Details</h1>

      {!selectedHostel ? (
        <ul className="hostel-list">
          {hostels.length > 0 ? (
            hostels.map((hostel) => (
              <li key={hostel.hostel_id} className="hostel-item">
                <span>{hostel.name} (ID: {hostel.hostel_id})</span>
                <button onClick={() => handleUpdateClick(hostel)}>Update</button>
              </li>
            ))
          ) : (
            <p>No hostels found for this owner.</p>
          )}
        </ul>
      ) : (
        <div className="hostel-update-form">
          
          <form onSubmit={handleSubmit}>
          
            <h2>Update Details for {selectedHostel.name}</h2>

            <label>Address:
              <input type="text" value={address} onChange={(e) => setAddress(e.target.value)} required />
            </label>
            <label>Description:
              <textarea value={description} onChange={(e) => setDescription(e.target.value)} required />
            </label>
            <label>Total Rooms:
              <input type="number" value={totalRooms} onChange={(e) => setTotalRooms(e.target.value)} required />
            </label>
            <label>Rent:
              <input type="number" value={rent} onChange={(e) => setRent(e.target.value)} required />
            </label>

            <h3>Facilities:</h3>
            {availableFacilities.map((facility) => (
              <label key={facility}>
                <input 
                  type="checkbox" 
                  checked={facilities.includes(facility)} 
                  onChange={() => handleFacilityChange(facility)} 
                />
                {facility}
              </label>
            ))}

            <button type="submit">Update Hostel</button>
          </form>
          <button onClick={handleBack}>Back to List</button>
          {message && <p className="message">{message}</p>} {/* Display success message */}
        </div>
      )}
    </div>
  );
}

export default UpdateHostel;
