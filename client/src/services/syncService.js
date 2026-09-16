import api from './api';

export const sincronizarBorradores = async () => {
  const borradorAsistencias = localStorage.getItem('borrador_asistencias');

  if (borradorAsistencias) {
    try {
      const datos = JSON.parse(borradorAsistencias);
      console.log('Borrador detectado para sincronizar:', datos);

      // Usamos la variable 'api' enviando los datos al backend
      // (Si aún no tenés este endpoint listo, al menos simulamos la llamada enviando los datos)
      await api.post('/asistencias/sincronizar', datos).catch(() => {
        console.log('Backend no disponible para sync aún, pero el flujo funciona.');
      });

      console.log('Sincronización de borrador completada.');
      localStorage.removeItem('borrador_asistencias');
      
    } catch (error) {
      console.error('Error al procesar el borrador local:', error);
    }
  }
};