import axios from 'axios';
import Cookies from 'js-cookie';

console.log("👉 API Base URL:", import.meta.env.VITE_BACKEND_URL);
const api = axios.create({
  baseURL: import.meta.env.VITE_BACKEND_URL + '/api/',
  withCredentials: true,  // important to send cookies on cross-origin calls
});

api.interceptors.request.use((config) => {
  const token = Cookies.get('token');
  if (token) {
    config.headers.Authorization = `Token ${token}`;
  }
  return config;
});

export default api;
