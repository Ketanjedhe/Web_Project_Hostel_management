import React, { useState } from 'react';
import '../styles/AddHostel.css';

function AddHostel() {
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [description, setDescription] = useState('');
  const [totalRooms, setTotalRooms] = useState('');
  const [availableRooms, setAvailableRooms] = useState('');
  const [rent, setRent] = useState(''); // This will be the number
  const [image, setImage] = useState(null); // New state for image
  const [facilities, setFacilities] = useState([]); // New state for facilities

  const ownerId = localStorage.getItem('owner_id');

  if (!ownerId) {
    return <div>Error: Owner ID not found. Please log in again.</div>;
  }

  const handleCheckboxChange = (e) => {
    const { value, checked } = e.target;
    setFacilities(prevFacilities =>
      checked
        ? [...prevFacilities, value]
        : prevFacilities.filter(facility => facility !== value)
    );
  };

  const handleSubmit = (e) => {
    e.preventDefault();
  
    const formData = new FormData();
    formData.append('name', name);
    formData.append('address', address);
    formData.append('description', description);
    formData.append('total_rooms', totalRooms);
    formData.append('available_rooms', availableRooms);
    formData.append('rent', rent); // Submit as a number
    formData.append('owner_id', ownerId);
    formData.append('facilities', JSON.stringify(facilities)); // Append facilities as JSON
    if (image) {
      formData.append('image', image); // Append image file
    }
  
    fetch('http://localhost:5000/add-hostel', {
      method: 'POST',
      body: formData,
    })
      .then(response => response.json())
      .then(data => {
        console.log('Response from server:', data); // Log the response
        if (data.message) {
          alert(data.message);
          window.location.href = '/owner-dashboard';
        }
      })
      .catch(error => {
        console.error('Error:', error);
      });
  };

  return (
    
    <div>
      <br/><br/> 
      <br/><br/>
      <br/><br/> 
      <br/><br/>
      <br/><br/> 
      <br/><br/>
      <br/><br/> 
      <br/><br/>
      <br/><br/> 
      <br/><br/>
      <form className="form" onSubmit={handleSubmit} encType="multipart/form-data">
        <h2>Add New Hostel</h2>
        <input
          type="text"
          name="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Hostel Name"
          required
        />
        <input
          type="text"
          name="address"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          placeholder="Address"
          required
        />
        <textarea
          name="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Description"
          rows="3"
          required
        />
        <input
          type="number"
          name="total_rooms"
          value={totalRooms}
          onChange={(e) => setTotalRooms(e.target.value)}
          placeholder="Total Rooms"
          required
        />
        <input
          type="number"
          name="available_rooms"
          value={availableRooms}
          onChange={(e) => setAvailableRooms(e.target.value)}
          placeholder="Available Rooms"
          required
        />
        <input
          type="number"
          name="rent"
          value={rent}
          onChange={(e) => setRent(e.target.value)}
          placeholder="Rent (₹)"
          required
        />
        <input
          type="file"
          name="image"
          onChange={(e) => setImage(e.target.files[0])}
          required
        />
        <div className="facilities">
          <label>Facilities:</label>
          <div>
            <input
              type="checkbox"
              id="wifi"
              value="wifi"
              checked={facilities.includes('wifi')}
              onChange={handleCheckboxChange}
            />
            <label htmlFor="wifi">WiFi</label>
          </div>
          <div>
            <input
              type="checkbox"
              id="hot_water"
              value="hot_water"
              checked={facilities.includes('hot_water')}
              onChange={handleCheckboxChange}
            />
            <label htmlFor="hot_water">Hot Water</label>
          </div>
          <div>
            <input
              type="checkbox"
              id="24_hr_water"
              value="24_hr_water"
              checked={facilities.includes('24_hr_water')}
              onChange={handleCheckboxChange}
            />
            <label htmlFor="24_hr_water">24 Hr Water</label>
          </div>
          <div>
            <input
              type="checkbox"
              id="parking"
              value="parking"
              checked={facilities.includes('parking')}
              onChange={handleCheckboxChange}
            />
            <label htmlFor="parking">Parking</label>
          </div>
          <div>
            <input
              type="checkbox"
              id="Laundary"
              value="Laundary"
              checked={facilities.includes('Laundary')}
              onChange={handleCheckboxChange}
            />
            <label htmlFor="Laundary">Laundary</label>
          </div>
          <div>
            <input
              type="checkbox"
              id="Gym"
              value="Gym"
              checked={facilities.includes('Gym')}
              onChange={handleCheckboxChange}
            />
            <label htmlFor="Gym">Gym</label>
          </div>
        </div>
        
        <button type="submit" className="submit-button">Add Hostel</button>
      </form>
    </div>
  );
}

export default AddHostel;
