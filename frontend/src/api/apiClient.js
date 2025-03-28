import axios from 'axios';

const apiClient = axios.create({
  baseURL: 'http://localhost:3000/api', // Adjust to match your backend port
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach Token if Available
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default apiClient;


