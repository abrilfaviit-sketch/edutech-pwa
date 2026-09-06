import api from './api'; 

export const obtenerAlumnos = async () => {
  try {
    const respuesta = await api.get('/alumnos');
    return respuesta.data.alumnos || respuesta.data;
  } catch (error) {
    console.error('Error al obtener la lista de alumnos:', error);
    throw error;
  }
};