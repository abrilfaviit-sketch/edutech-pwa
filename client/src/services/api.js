import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:4000/api'
});

// Interceptor de Solicitud, inyecta el JWT en cada petición
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor de respuesta: Manejo de expiración (401)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // quitar únicamente la credencial
      localStorage.removeItem('token');
      
      // Redirigir notificando la expiración sin refrescar si ya estamos en /login
      if (window.location.pathname !== '/login') {
        window.location.href = '/login?sesionExpirada=true';
      }
    }
    return Promise.reject(error);
  }
);

export default api;