import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './NavBar.css'; // Ensure correct CSS import

const Navbar = () => {
  const navigate = useNavigate();
  const isAuthenticated = !!localStorage.getItem('token');
  const [showDropdown, setShowDropdown] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  return (
    <nav className="navbar">
      {/* Site Name on the Left */}
      <Link to="/" className="navbar-logo">Elysium</Link>

      {/* Other Links in the Center */}
      <ul className="navbar-links">
        <li><Link to="/about">About</Link></li>
        <li><Link to="/chatbot">Chatbot</Link></li>
        <li><Link to="/chat">Chat with Others</Link></li>
      </ul>

      {/* Profile Section on the Right */}
      {isAuthenticated ? (
        <div className="profile-dropdown" onMouseEnter={() => setShowDropdown(true)} onMouseLeave={() => setShowDropdown(false)}>
          <button className="navbar-btn profile-btn">Profile ▼</button>
          {showDropdown && (
            <div className="dropdown-menu">
              <Link to="/profile" className="dropdown-item">Go to Profile</Link>
              <button onClick={handleLogout} className="dropdown-item logout">Logout</button>
            </div>
          )}
        </div>
      ) : (
        <div className="auth-buttons">
          <Link to="/login" className="navbar-btn">Login</Link>
          <Link to="/signup" className="navbar-btn">Signup</Link>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
