const supabase = require('../db.js'); 

// Obtener la lista de alumnos desde Supabase
exports.obtenerAlumnos = async (req, res) => {
  try {
    // Consultamos la tabla usuarios donde rol_id sea 1 (Alumno)
    const { data: alumnos, error } = await supabase
      .from('usuarios')
      .select('id, nombre, apellido, email, rol_id')
      .eq('rol_id', 1);

    if (error) {
      return res.status(400).json({ exito: false, mensaje: error.message });
    }

    return res.json({
      exito: true,
      alumnos
    });
  } catch (err) {
    return res.status(500).json({ exito: false, mensaje: 'Error interno del servidor' });
  }
};