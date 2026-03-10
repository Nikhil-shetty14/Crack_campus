import axios from 'axios';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000',
});

// Add a request interceptor to include the API key from localStorage
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('gemini_api_key');
    if (token) {
        config.headers['x-api-key'] = token;
    }
    return config;
}, (error) => {
    return Promise.reject(error);
});

export default api;
