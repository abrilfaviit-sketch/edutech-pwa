import api from './api';

export const obtenerAlumnos = async () => {
  try {
    const respuesta = await api.get('/alumnos');
    return respuesta.data;
  } catch (error) {
    console.error('Error al obtener la lista de alumnos desde la API:', error);
    return []; // En caso de error, retorna un array vacío para que el frontend no colapse.
  }
};