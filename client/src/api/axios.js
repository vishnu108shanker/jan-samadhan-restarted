import axios from 'axios';

const apiBaseURL = import.meta.env.DEV
  ? 'http://localhost:5000/api'
  : (import.meta.env.VITE_API_URL || 'http://localhost:5000/api');

const api = axios.create({
  baseURL: apiBaseURL,
});

// create an interceptor to add the token to the headers of each request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default api;