import React, { useState, useEffect } from 'react';
import '../styles/RemoveHostel.css'; // Adjust the path as needed

const RemoveHostel = () => {
  const [hostels, setHostels] = useState([]);
  const [selectedHostelId, setSelectedHostelId] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Retrieve owner_id from localStorage
  const ownerId = localStorage.getItem('owner_id');

  // Fetch the hostels for the owner
  useEffect(() => {
    if (!ownerId) {
      setError('Error: Owner ID not found. Please log in again.');
      setIsLoading(false);
      return;
    }

    const fetchHostels = async () => {
      try {
        const response = await fetch(`http://localhost:5000/owner-hostels/${ownerId}`);
        const data = await response.json();
        if (response.ok) {
          setHostels(data);
        } else {
          alert(data.message);
        }
      } catch (error) {
        console.error('Error fetching hostels:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchHostels();
  }, [ownerId]);

  const handleDelete = async (e) => {
    e.preventDefault();

    if (!selectedHostelId) {
      alert('Please select a hostel to remove');
      return;
    }

    try {
      const response = await fetch('http://localhost:5000/remove-hostel', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ hostel_id: selectedHostelId, owner_id: ownerId }), // Pass the owner_id with the request
      });

      const data = await response.json();
      if (response.ok) {
        alert('Hostel removed successfully!');
        setHostels(hostels.filter(hostel => hostel.hostel_id !== selectedHostelId)); // Remove the deleted hostel from the list
      } else {
        alert(data.message);
      }
    } catch (error) {
      console.error('Error:', error);
      alert('An error occurred. Please try again.');
    }
  };

  if (error) {
    return <div>{error}</div>;
  }

  return (
    <div>
      <h2>Remove Hostel</h2>
      {isLoading ? (
        <p>Loading hostels...</p>
      ) : (
        <form onSubmit={handleDelete}>
          <select
            value={selectedHostelId}
            onChange={(e) => setSelectedHostelId(e.target.value)}
            required
          >
            <option value="">Select a hostel</option>
            {hostels.map((hostel) => (
              <option key={hostel.hostel_id} value={hostel._id}>
                {hostel.name}
              </option>
            ))}
          </select>
          <button type="submit">Remove Hostel</button>
        </form>
      )}
    </div>
  );
};

export default RemoveHostel;
