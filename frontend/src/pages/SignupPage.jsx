import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom'; // Import Link for navigation
import apiClient from '../api/apiClient';

const SignupPage = () => {
  // ASSUMPTION: Backend expects capitalized roles. Replace with your actual backend enum values.
  const backendRoles = {
    PATIENT: 'Patient', // Example: Use the exact string from backend enum
    PEER_SUPPORTER: 'Peer Supporter' // Example: Use the exact string from backend enum
  };

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    // CHANGE: Initialize with the correct backend enum value
    role: backendRoles.PATIENT,
    sex: 'male', // Keep initial values for other fields as needed
    addiction: '',
    disease: '',
    occupation: '',
    job: '',
    background: '',
  });

  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError(''); // Clear error when user types
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setError(''); // Clear previous errors
    try {
      // Make sure the formData being sent contains the correct enum values
      console.log("Submitting formData:", formData); // Good for debugging
      await apiClient.post('/auth/register', formData);
      alert('Signup successful! Please login.'); // Consider using a less disruptive notification
      navigate('/login');
    } catch (error) {
      console.error("Signup Error:", error.response || error);
      setError(error.response?.data?.message || 'Signup failed. Please try again.');
    }
  };

  return (
    <div className="signup-container" style={{ maxWidth: '400px', margin: '2rem auto', padding: '2rem', border: '1px solid #ccc', borderRadius: '8px' }}>
      <h2>Create an Account</h2>
      {error && <p className="error" style={{ color: 'red', marginBottom: '1rem' }}>{error}</p>}
      <form onSubmit={handleSignup}>
        {/* Add divs for better structure and styling */}
        <div style={{ marginBottom: '1rem' }}>
          <label htmlFor="nameInput">Name</label>
          <input id="nameInput" style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }} type="text" name="name" value={formData.name} onChange={handleChange} required />
        </div>

        <div style={{ marginBottom: '1rem' }}>
          <label htmlFor="emailInput">Email</label>
          <input id="emailInput" style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }} type="email" name="email" value={formData.email} onChange={handleChange} required />
        </div>

        <div style={{ marginBottom: '1rem' }}>
          <label htmlFor="passwordInput">Password</label>
          <input id="passwordInput" style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }} type="password" name="password" value={formData.password} onChange={handleChange} required />
        </div>

        <div style={{ marginBottom: '1rem' }}>
          <label htmlFor="roleSelect">Role</label>
          <select id="roleSelect" style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }} name="role" value={formData.role} onChange={handleChange}>
            {/* CHANGE: Use the exact backend enum values */}
            <option value={backendRoles.PATIENT}>{backendRoles.PATIENT}</option> {/* Display text can be user-friendly */}
            <option value={backendRoles.PEER_SUPPORTER}>{backendRoles.PEER_SUPPORTER}</option>
            {/* Add other roles if defined in backend enum */}
          </select>
        </div>

        <div style={{ marginBottom: '1rem' }}>
          <label htmlFor="sexSelect">Sex</label>
          <select id="sexSelect" style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }} name="sex" value={formData.sex} onChange={handleChange}>
            {/* Assuming these lowercase values are correct for the backend 'sex' enum */}
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="other">Other</option>
          </select>
        </div>

        {/* Optional fields - consider conditionally rendering based on role */}
        <div style={{ marginBottom: '1rem' }}>
          <label htmlFor="addictionInput">Addiction (if applicable)</label>
          <input id="addictionInput" style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }} type="text" name="addiction" value={formData.addiction} onChange={handleChange} />
        </div>

        <div style={{ marginBottom: '1rem' }}>
          <label htmlFor="diseaseInput">Disease (if applicable)</label>
          <input id="diseaseInput" style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }} type="text" name="disease" value={formData.disease} onChange={handleChange} />
        </div>

        <div style={{ marginBottom: '1rem' }}>
          <label htmlFor="occupationInput">Occupation</label>
          <input id="occupationInput" style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }} type="text" name="occupation" value={formData.occupation} onChange={handleChange} />
        </div>

        <div style={{ marginBottom: '1rem' }}>
          <label htmlFor="jobInput">Job</label>
          <input id="jobInput" style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }} type="text" name="job" value={formData.job} onChange={handleChange} />
        </div>

        <div style={{ marginBottom: '1rem' }}>
          <label htmlFor="backgroundInput">Background</label>
          <textarea id="backgroundInput" style={{ width: '100%', padding: '8px', boxSizing: 'border-box', minHeight: '60px' }} name="background" value={formData.background} onChange={handleChange} />
        </div>

        <button type="submit" style={{ padding: '10px 15px', cursor: 'pointer' }}>Sign Up</button>
      </form>
      <p style={{ marginTop: '1rem', textAlign: 'center' }}>
        Already have an account? <Link to="/login">Login here</Link> {/* Use Link for client-side routing */}
      </p>
    </div>
  );
};

export default SignupPage;