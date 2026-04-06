import axios from 'axios';

// Determines API URL based on current browser location or env variable
const getBaseUrl = () => {
    // If a specific backend URL is defined in .env, use it (highest priority)
    const envUrl = import.meta.env.VITE_BACKEND_URL;
    
    if (envUrl && !envUrl.includes('localhost')) {
        // Normalize URL: remove trailing slash if present
        const normalizedUrl = envUrl.endsWith('/') ? envUrl.slice(0, -1) : envUrl;
        
        console.log('[Axios] Base API URL:', `${normalizedUrl}/api`);
        return `${normalizedUrl}/api`;
    }

    const hostname = window.location.hostname;
    // If running on localhost, use local port 5000
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
        return 'http://localhost:5000/api';
    }
    
    // Default fallback (works if backend is on same host/port)
    return '/api';
};

const api = axios.create({
    baseURL: getBaseUrl(),
    headers: {
        'Content-Type': 'application/json',
    },
    withCredentials: true,
});

// Add a request interceptor to include the JWT token
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export default api;