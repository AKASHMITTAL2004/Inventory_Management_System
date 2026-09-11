import axios from 'axios';

const API = axios.create({
  // This tells Vite: "If I have a production URL set in Vercel, use it. Otherwise, use my Codespace URL."
  baseURL: import.meta.env.VITE_API_URL || 'https://organic-space-bassoon-5gvg7v4qg4rwcvxq-5000.app.github.dev/api',
});

// Automatically attach JWT token to headers if it exists in localStorage
API.interceptors.request.use((req) => {
  const token = localStorage.getItem('token');
  if (token) {
    req.headers.authorization = `Bearer ${token}`;
  }
  return req;
});

export default API;
