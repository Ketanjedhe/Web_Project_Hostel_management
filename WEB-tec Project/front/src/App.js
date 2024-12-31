import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import HomePage from './home/Homepage'; // Correct path
import AboutPage from './home/Aboutpage';
import Shc from './home/Shc';
import StudentLogin from './LoginRegister/StudentLogin';
import StudentRegister from './LoginRegister/StudentRegister';
import OwnerLogin from './LoginRegister/OwnerLogin';
import OwnerRegister from './LoginRegister/OwnerRegister';
import AdminLogin from './LoginRegister/AdminLogin';
import AdminRegister from './LoginRegister/AdminRegister';
import OwnerDashboard from './dashboard/OwnerDashboard';
import AdminDashboard from './dashboard/AdminDashboard';
import StudentDashboard from './dashboard/student-dashboard';
function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/login" element={<Shc/>} />
        <Route path="/student-Login" element={<StudentLogin />} />
        <Route path="/student-register" element={<StudentRegister />} />
        <Route path="/owner-login" element={<OwnerLogin />} />
        <Route path="/owner-register" element={<OwnerRegister />} />
        <Route path="/admin-login" element={<AdminLogin />} />
        <Route path="/admin-register" element={<AdminRegister />} />
        <Route path="/owner-dashboard" element={<OwnerDashboard />} />
        <Route path="/admin-dashboard" element={<AdminDashboard />} />
        {/* Add other routes as needed */
        
        <Route path="/student-dashboard" element={<StudentDashboard />} />

        }
      </Routes>
    </Router>
  );
}

export default App;
