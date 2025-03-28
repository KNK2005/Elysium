import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../api/apiClient';

const ProfilePage = () => {
  const [user, setUser] = useState(null);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const fetchUserProfile = async () => {
    try {
      const { data } = await apiClient.get('/users/profile', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      setUser(data);
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to fetch profile.');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    alert('Logged out successfully!');
    navigate('/login');
  };

  useEffect(() => {
    fetchUserProfile();
  }, []);

  return (
    <div className="profile-container">
      <h2>Your Profile</h2>
      {error && <p className="error">{error}</p>}
      {user ? (
        <div>
          <p><strong>Name:</strong> {user.name}</p>
          <p><strong>Email:</strong> {user.email}</p>
          <p><strong>Role:</strong> {user.role}</p>
          <p><strong>Sex:</strong> {user.sex}</p>
          <p><strong>Addiction:</strong> {user.addiction || 'N/A'}</p>
          <p><strong>Disease:</strong> {user.disease || 'N/A'}</p>
          <p><strong>Occupation:</strong> {user.occupation}</p>
          <p><strong>Job:</strong> {user.job || 'N/A'}</p>
          <p><strong>Background:</strong> {user.background}</p>
          <button onClick={handleLogout}>Logout</button>
        </div>
      ) : (
        <p>Loading your profile...</p>
      )}
    </div>
  );
};

export default ProfilePage;
