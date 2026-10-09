const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware/authMiddleware.js');
const { supabase } = require('../../config/supabase');

router.get('/', authMiddleware, (req, res) => {
  res.json({ exito: true, mensaje: 'Ruta de asistencias activa' });
});

//Endpoint para recibir las sincronizaciones OFFLINE del frontend
router.post('/sincronizar', authMiddleware, async (req, res) => {
  try {
    const datos = req.body; 
    if (!Array.isArray(datos) || datos.length === 0) {
      return res.status(400).json({ error: 'No se recibieron datos para sincronizar.' });
    }

    const { data, error } = await supabase
      .from('asistencias')
      .upsert(datos, { onConflict: 'materia_id, alumno_id, fecha' });

    if (error) throw error;
    res.status(200).json({ exito: true, mensaje: 'Sincronización offline completada con éxito', data });
  } catch (error) {
    console.error('Error sincronizando datos offline:', error);
    res.status(500).json({ error: 'Error interno al sincronizar borradores.' });
  }
});

module.exports = router;