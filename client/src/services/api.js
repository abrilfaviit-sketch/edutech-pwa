import axios from 'axios';

// Creamos una instancia de axios apuntando a tu servidor backend
const api = axios.create({
  baseURL: 'http://localhost:4000/api'
});

// Interceptor para enviar el token JWT automáticamente en cada petición si existe
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;