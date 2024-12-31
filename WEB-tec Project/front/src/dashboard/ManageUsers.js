import React, { useEffect, useState } from 'react';
import axios from 'axios';
import '../styles/ManageUsers.css'; // Import the CSS file

const ManageUsers = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/students');
        console.log(students)
        setStudents(response.data);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    fetchStudents();
  }, []);

  const handleRemove = async (id) => {
    try {
      await axios.delete(`http://localhost:5000/api/students/${id}`);
      setStudents(students.filter(student => student.student_id !== id));
      alert('Student deleted successfully');
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'An error occurred';
      alert('Failed to delete student: ' + errorMessage);
    }
  };

  if (loading) return <p className="loading">Loading...</p>;
  if (error) return <p className="error">Error: {error}</p>;

  return (
    <div className="student-list-container">
      <h1>Student List</h1>
      <table>
        <thead>
          <tr>
            <th>Student ID</th>
            <th>Name</th>
            <th>Email</th>
            <th>Phone Number</th>
            <th>Address</th>
            <th>Date of Birth</th>
            <th>Gender</th>
            <th>Actions</th> {/* Add Actions column */}
          </tr>
        </thead>
        <tbody>
          {students.map((student) => (
            <tr key={student._id}>
              <td>{student._id}</td>
              <td>{student.name}</td>
              <td>{student.email}</td>
              <td>{student.phone_number}</td>
              <td>{student.address}</td>
              <td>{student.date_of_birth}</td>
              <td>{student.gender}</td>
              <td>
                <button
                  className="remove-btn"
                  onClick={() => handleRemove(student._id)}
                >
                  Remove
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ManageUsers;
