import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; // Import for navigation
import '../styles/student-dashboard.css';

const StudentDashboard = () => {
    const [hostels, setHostels] = useState([]);
    const [originalHostels, setOriginalHostels] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedFacilities, setSelectedFacilities] = useState([]);
    const [selectedHostel, setSelectedHostel] = useState(null);
    const [paymentStatus, setPaymentStatus] = useState('');

    const navigate = useNavigate(); // Used to redirect after logout

    useEffect(() => {
        const fetchHostels = async () => {
            try {
                const response = await fetch('http://localhost:5000/stu_hostels');
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                const data = await response.json();
                const processedData = data.map(hostel => ({
                    ...hostel,
                    facilities: Array.isArray(hostel.facilities)
                        ? hostel.facilities
                        : typeof hostel.facilities === 'string'
                            ? JSON.parse(hostel.facilities || '[]')
                            : []
                }));
                setHostels(processedData);
                setOriginalHostels(processedData);
            } catch (error) {
                console.error('Error fetching hostels:', error);
            }
        };

        fetchHostels();
    }, []);

    useEffect(() => {
        applyFilters();
    }, [searchTerm, selectedFacilities]);

    const handleSearch = (e) => {
        setSearchTerm(e.target.value);
    };

    const handleFacilityChange = (facility) => {
        setSelectedFacilities(prev =>
            prev.includes(facility)
                ? prev.filter(f => f !== facility)
                : [...prev, facility]
        );
    };

    const applyFilters = () => {
        let filteredHostels = originalHostels;

        if (searchTerm) {
            filteredHostels = filteredHostels.filter(hostel =>
                hostel.name.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        if (selectedFacilities.length > 0) {
            filteredHostels = filteredHostels.filter(hostel => {
                const facilitiesArray = Array.isArray(hostel.facilities)
                    ? hostel.facilities
                    : typeof hostel.facilities === 'string'
                        ? JSON.parse(hostel.facilities || '[]')
                        : [];
                return selectedFacilities.every(facility =>
                    facilitiesArray.includes(facility)
                );
            });
        }

        setHostels(filteredHostels);
    };

    const handleBookHostel = (hostelId) => {
        const hostel = hostels.find(h => h.hostel_id === hostelId);
        setSelectedHostel(hostel);
    };

    const handleBack = () => {
        setSelectedHostel(null);
        setPaymentStatus('');
    };

    const handlePayment = async () => {
        const studentId = localStorage.getItem('student_id');
        const bookingDate = new Date().toISOString().split('T')[0]; // Gets the current date in YYYY-MM-DD format

        if (selectedHostel && studentId) {
            try {
                const bookingResponse = await fetch(`http://localhost:5000/book_hostel/${selectedHostel.hostel_id}`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        student_id: studentId,
                        rent: selectedHostel.rent,
                        room_number: selectedHostel.room_number, // Ensure room_number is included
                        booking_date: bookingDate,  // Include booking_date in the request
                        hostel_owner_id: selectedHostel.hostel_owner_id
                    })
                });

                if (!bookingResponse.ok) {
                    throw new Error('Network response was not ok');
                }

                const bookingData = await bookingResponse.json();

                const paymentResponse = await fetch(`http://localhost:5000/update_payment_status/${bookingData.booking_id}`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ payment_status: 'Pending' })
                });

                if (!paymentResponse.ok) {
                    throw new Error('Network response was not ok');
                }

                setPaymentStatus(`Successfully booked the hostel. Rent: Rs${selectedHostel.rent}`);
            } catch (error) {
                console.error('Error processing payment:', error);
                setPaymentStatus('Failed to book the hostel.');
            }
        }
    };

    const handleLogout = () => {
        // Clear authentication data and redirect to login page
        localStorage.removeItem('student_id');
        navigate('/login'); // Assuming '/login' is your login page route
    };

    return (
        <div className="dashboard">
            <header>
                <h1>Student Dashboard</h1>
                <button className="logout-btn" onClick={handleLogout}>Logout</button>
            </header>

            {!selectedHostel ? (
                <div className="search-bar">
                    <input
                        type="text"
                        placeholder="Search hostel by name..."
                        value={searchTerm}
                        onChange={handleSearch}
                    />
                </div>
            ) : (
                <button className="back-btn" onClick={handleBack}>Back to Hostels</button>
            )}

            <div className="content">
                {!selectedHostel ? (
                    <>
                        <aside className="filters">
                            <h2>Filters</h2>
                            <div className="checkbox-group">
                                <label>
                                    <input
                                        type="checkbox"
                                        value="wifi"
                                        checked={selectedFacilities.includes('wifi')}
                                        onChange={() => handleFacilityChange('wifi')}
                                    />
                                    Wi-Fi
                                </label>
                                <label>
                                    <input
                                        type="checkbox"
                                        value="gym"
                                        checked={selectedFacilities.includes('gym')}
                                        onChange={() => handleFacilityChange('gym')}
                                    />
                                    Gym
                                </label>
                                <label>
                                    <input
                                        type="checkbox"
                                        value="laundry"
                                        checked={selectedFacilities.includes('laundry')}
                                        onChange={() => handleFacilityChange('laundry')}
                                    />
                                    Laundry
                                </label>
                                <label>
                                    <input
                                        type="checkbox"
                                        value="parking"
                                        checked={selectedFacilities.includes('parking')}
                                        onChange={() => handleFacilityChange('parking')}
                                    />
                                    Parking
                                </label>
                                <label>
                                    <input
                                        type="checkbox"
                                        value="24_hr_water"
                                        checked={selectedFacilities.includes('24_hr_water')}
                                        onChange={() => handleFacilityChange('24_hr_water')}
                                    />
                                    24-Hour Water
                                </label>
                                <label>
                                    <input
                                        type="checkbox"
                                        value="hot_water"
                                        checked={selectedFacilities.includes('hot_water')}
                                        onChange={() => handleFacilityChange('hot_water')}
                                    />
                                    Hot Water
                                </label>
                            </div>
                        </aside>

                        <main className="hostels-grid">
                            {hostels.length > 0 ? (
                                hostels.map((hostel) => (
                                    <div key={hostel.hostel_id} className="hostel-card">
                                        <div className="hostel-info">
                                            <h3>{hostel.name}</h3>
                                            <p>Rent: Rs{hostel.rent}/month</p>
                                            <button onClick={() => handleBookHostel(hostel.hostel_id)}>Book Now</button>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <p>No hostels available</p>
                            )}
                        </main>
                    </>
                ) : (
                    <div className="hostel-details">
                        <h2>{selectedHostel.name}</h2>
                        <p>Rent: Rs{selectedHostel.rent}/month</p>
                        <p>{selectedHostel.description}</p>
                        <p>Facilities: {selectedHostel.facilities.join(', ')}</p>
                        {paymentStatus ? (
                            <p>{paymentStatus}</p>
                        ) : (
                            <button onClick={handlePayment}>Proceed to Payment</button>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default StudentDashboard;
