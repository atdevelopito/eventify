import axios from 'axios';

// Determines API URL based on current browser location
const getBaseUrl = () => {
    const hostname = window.location.hostname;
    // If running solely on localhost, point to localhost API
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
        return 'http://localhost:5000/api';
    }
    // Otherwise, assume the backend is on the same machine (on port 5000)
    // This allows it to work on .109, .107, or any future IP automatically.
    return `http://${hostname}:5000/api`;
};

const api = axios.create({
    baseURL: getBaseUrl(),
    headers: {
        'Content-Type': 'application/json',
    },
    withCredentials: true, // Enable credentials for CORS
});

api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export default api;
