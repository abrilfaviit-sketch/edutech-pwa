import api from './api'; 

export const obtenerAlumnos = async () => {
  try {
    // Buscamos el token en 'token' o dentro del objeto 'usuarioSesion'
    let token = localStorage.getItem('token');
    
    if (!token) {
      const sesion = localStorage.getItem('usuarioSesion');
      if (sesion) {
        const parsed = JSON.parse(sesion);
        token = parsed.token || parsed.jwt;
      }
    }

    // Enviamos la petición asegurando la cabecera explícita
    const respuesta = await api.get('/alumnos', {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    return respuesta.data.alumnos || respuesta.data;
  } catch (error) {
    console.error('Error al obtener la lista de alumnos:', error);
    throw error;
  }
};