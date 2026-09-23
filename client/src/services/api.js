import axios from 'axios';

// 1. Uso de variables de entorno para producción/desarrollo
const API_URL = import.meta.env?.VITE_API_URL || 'http://localhost:4000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Interceptor de Solicitud: Inyecta el JWT
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

// Control para evitar loop de redirecciones cuando fallan varias peticiones simultáneas
let isRedirecting = false;

// Interceptor de Respuesta: Manejo de 401 
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Limpiar credenciales y datos del usuario
      localStorage.removeItem('token');
      localStorage.removeItem('usuario');

      // Redirigir únicamente si no estamos en /login y no hay una redirección en marcha
      if (window.location.pathname !== '/login' && !isRedirecting) {
        isRedirecting = true;
        window.location.href = '/login?sesionExpirada=true';
      }
    }
    return Promise.reject(error);
  }
);

export default api;