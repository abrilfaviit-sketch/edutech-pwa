//import api from './api';


export const obtenerAlumnos = async () => {
  // Mock temporal hasta conectar con la API
  return [
    { id: 1, nombre: 'Alumno 1' },
    { id: 2, nombre: 'Alumno 2' }
  ];

  // Cuando el backend esté listo
  // const respuesta = await api.get('/alumnos');
  // return respuesta.data;
};

export const sincronizarBorradores = async () => {
  const borradorAsistencias = localStorage.getItem('borrador_asistencias');

  if (borradorAsistencias) {
    try {
      const datos = JSON.parse(borradorAsistencias);
      console.log('Borrador detectado para sincronizar:', datos);

      // await api.post('/asistencias/sincronizar', datos);

      console.log('Sincronización simulada con éxito.');
      localStorage.removeItem('borrador_asistencias');
      
    } catch (error) {
      console.error('Error al intentar sincronizar el borrador:', error);
    }
  }
};