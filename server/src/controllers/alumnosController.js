const pool = require('../db.js'); 

// Obtener la lista de alumnos desde la base de datos
exports.obtenerAlumnos = async (req, res) => {
  try {
    // Consultamos directamente con SQL a la tabla usuarios
    const query = 'SELECT id, nombre, apellido, email, rol_id FROM usuarios WHERE rol_id = $1';
    const { rows: alumnos } = await pool.query(query, [1]);

    return res.json({
      exito: true,
      alumnos
    });

  } catch (err) {
    console.error('CRASH EN OBTENER ALUMNOS:', err);

    return res.status(500).json({ 
      exito: false, 
      mensaje: 'Error interno del servidor',
      errorDetalle: err.message || err 
    });
  }
};