import api from './api';

// Función para obtener la lista de alumnos desde el Backend
export const obtenerAlumnos = async () => {
  try {
    const respuesta = await api.get('/alumnos');
    return respuesta.data.alumnos;
  } catch (error) {
    console.error('Error al obtener la lista de alumnos:', error);
    throw error;
  }
};