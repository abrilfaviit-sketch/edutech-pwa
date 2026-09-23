import { Router } from 'express';
import { pool as supabase } from '../db.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

const router = Router();

// Aplicar autenticación JWT a todas las rutas de preceptoría
router.use(authMiddleware);

// OBTENER CURSOS
// GET /api/preceptor/cursos
router.get('/cursos', async (req, res) => {
  try {
    const todosLosCursos = [
      '1° A', '1° B', '2° A', '2° B', 
      '3° A', '3° B', '4° A', '4° B', 
      '5° A', '5° B', '5° C', '6° A'
    ];

    // Cursos por defecto asignados al preceptor
    const misCursos = ['5° A', '5° B', '5° C'];

    res.json({
      todosLosCursos,
      misCursos
    });
  } catch (error) {
    console.error('Error al obtener cursos:', error);
    res.status(500).json({ error: 'Error al obtener la lista de cursos' });
  }
});

//OBTENER ALUMNOS
// GET /api/preceptor/alumnos
router.get('/alumnos', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('alumnos')
      .select('id, nombre, dni, curso, turno, inasistencias')
      .order('nombre', { ascending: true });

    if (error) throw error;

    res.json(data);
  } catch (error) {
    console.error('Error al consultar alumnos:', error);
    res.status(500).json({ error: 'Error al obtener los alumnos' });
  }
});

// REGISTRAR ASISTENCIA
// POST /api/preceptor/asistencia

router.post('/asistencia', async (req, res) => {
  const { fecha, curso, asistencias } = req.body;

  if (!fecha || !asistencias || !Array.isArray(asistencias)) {
    return res.status(400).json({ error: 'Datos de asistencia incompletos.' });
  }

  try {
    const registros = asistencias.map(a => ({
      alumno_id: a.alumno_id,
      fecha,
      estado: a.estado
    }));

    // Guarda o actualiza según alumno y fecha
    const { data, error } = await supabase
      .from('asistencia')
      .upsert(registros, { onConflict: 'alumno_id, fecha' });

    if (error) throw error;

    res.json({ message: 'Asistencia guardada correctamente', data });
  } catch (error) {
    console.error('Error al guardar asistencia:', error);
    res.status(500).json({ error: 'Error interno al registrar la asistencia' });
  }
});

// CONSULTAR SANCIONES
// GET /api/preceptor/sanciones

router.get('/sanciones', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('sanciones')
      .select(`
        id,
        tipo,
        motivo,
        fecha,
        alumno_id,
        alumnos ( nombre, curso, turno )
      `)
      .order('fecha', { ascending: false });

    if (error) throw error;

    // Formateado limpio 
    const formateado = data.map(s => ({
      id: s.id,
      alumno_id: s.alumno_id,
      alumno_nombre: s.alumnos?.nombre || 'Estudiante no encontrado',
      curso: s.alumnos?.curso || '-',
      turno: s.alumnos?.turno || '-',
      tipo: s.tipo,
      motivo: s.motivo,
      fecha: s.fecha
    }));

    res.json(formateado);
  } catch (error) {
    console.error('Error al obtener sanciones:', error);
    res.status(500).json({ error: 'Error al consultar historial de sanciones' });
  }
});

//REGISTRAR NUEVA SANCIÓN
// POST /api/preceptor/sanciones
router.post('/sanciones', async (req, res) => {
  const { alumno_id, tipo, motivo, fecha } = req.body;

  if (!alumno_id || !tipo || !motivo) {
    return res.status(400).json({ error: 'Faltan campos obligatorios.' });
  }

  try {
    const { data, error } = await supabase
      .from('sanciones')
      .insert([{ alumno_id, tipo, motivo, fecha }])
      .select(`
        id,
        tipo,
        motivo,
        fecha,
        alumno_id,
        alumnos ( nombre, curso, turno )
      `)
      .single();

    if (error) throw error;

    const respuesta = {
      id: data.id,
      alumno_id: data.alumno_id,
      alumno_nombre: data.alumnos?.nombre || 'Estudiante no encontrado',
      curso: data.alumnos?.curso || '-',
      turno: data.alumnos?.turno || '-',
      tipo: data.tipo,
      motivo: data.motivo,
      fecha: data.fecha
    };

    res.status(201).json(respuesta);
  } catch (error) {
    console.error('Error al crear sanción:', error);
    res.status(500).json({ error: 'Error al registrar la sanción' });
  }
});

export default router;