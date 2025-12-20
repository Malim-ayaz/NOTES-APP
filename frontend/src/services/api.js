import axios from 'axios';
import { getToken, removeToken } from '../utils/token';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add token
api.interceptors.request.use(
  (config) => {
    const token = getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 || error.response?.status === 403) {
      // Token expired or invalid
      removeToken();
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  signup: async (username, email, password) => {
    const response = await api.post('/auth/signup', { username, email, password });
    return response.data;
  },
  login: async (email, password) => {
    const response = await api.post('/auth/login', { email, password });
    return response.data;
  },
};

// Notes API
export const notesAPI = {
  getAll: async () => {
    const response = await api.get('/notes');
    return response.data;
  },
  create: async (title, content) => {
    const response = await api.post('/notes', { title, content });
    return response.data;
  },
  update: async (id, title, content) => {
    const response = await api.put(`/notes/${id}`, { title, content });
    return response.data;
  },
  delete: async (id) => {
    const response = await api.delete(`/notes/${id}`);
    return response.data;
  },
};

export default api;

