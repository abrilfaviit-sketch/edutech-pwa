const { supabase } = require('../../config/supabase');

// Obtener lista alumnos general
const obtenerAlumnos = async (req, res) => {
  try {
    // filtra por rol
    const { data: alumnos, error } = await supabase
      .from('usuarios')
      .select('id, nombre, apellido, email, rol_id')
      .eq('rol_id', 1);

    if (error) throw error;

    return res.status(200).json(alumnos || []);
  } catch (error) {
    console.error('CRASH EN OBTENER ALUMNOS:', error.message);
    return res.status(500).json({ 
      exito: false, 
      mensaje: 'Error interno del servidor',
      errorDetalle: error.message 
    });
  }
};

// Materias del alumno
const getMisMaterias = async (req, res) => {
  try {
    const alumnoId = req.user.id;

    const { data, error } = await supabase
      .from('inscripciones_alumnos')
      .select('materia_id, materias(*, cursos(nombre, turno))')
      .eq('alumno_id', alumnoId);

    if (error) throw error;

    const materias = data ? data.map(item => item.materias) : [];
    return res.status(200).json(materias);
  } catch (error) {
    console.error('Error al obtener materias del alumno:', error.message);
    return res.status(500).json({ error: 'Error al consultar las materias.' });
  }
};

// Asistencias del alumno
const getMisAsistencias = async (req, res) => {
  try {
    const alumnoId = req.user.id;
    const { materiaId } = req.query;

    let query = supabase
      .from('asistencias')
      .select('*')
      .eq('alumno_id', alumnoId);

    if (materiaId) {
      query = query.eq('materia_id', materiaId);
    }

    const { data, error } = await query;
    if (error) throw error;

    return res.status(200).json(data || []);
  } catch (error) {
    console.error('Error al consultar asistencias:', error.message);
    return res.status(500).json({ error: 'Error al obtener asistencias.' });
  }
};

// Calificaciones del alumno
const getMisCalificaciones = async (req, res) => {
  try {
    const alumnoId = req.user.id;

    const { data, error } = await supabase
      .from('calificaciones')
      .select('*, materias(nombre)')
      .eq('alumno_id', alumnoId);

    if (error) throw error;

    return res.status(200).json(data || []);
  } catch (error) {
    console.error('Error al obtener calificaciones:', error.message);
    return res.status(500).json({ error: 'Error al obtener calificaciones.' });
  }
};

// tareas pendientes o dadas
const getMisTareas = async (req, res) => {
  try {
    const alumnoId = req.user.id;

    const { data: inscripciones, error: errInsc } = await supabase
      .from('inscripciones_alumnos')
      .select('materia_id')
      .eq('alumno_id', alumnoId);

    if (errInsc) throw errInsc;

    const materiasIds = inscripciones.map(i => i.materia_id);

    if (materiasIds.length === 0) {
      return res.status(200).json([]);
    }

    const { data: tareas, error: errTareas } = await supabase
      .from('tareas')
      .select('*, entregas_tareas(*)')
      .in('materia_id', materiasIds);

    if (errTareas) throw errTareas;

    return res.status(200).json(tareas || []);
  } catch (error) {
    console.error('Error al obtener tareas:', error.message);
    return res.status(500).json({ error: 'Error al consultar las tareas.' });
  }
};

// Entrega de una tarea
const entregarTarea = async (req, res) => {
  try {
    const alumnoId = req.user.id;
    const { tareaId, archivoUrl } = req.body;

    if (!tareaId) {
      return res.status(400).json({ error: 'El ID de la tarea es obligatorio.' });
    }

    const { data, error } = await supabase
      .from('entregas_tareas')
      .upsert(
        {
          tarea_id: tareaId,
          alumno_id: alumnoId,
          archivo_url: archivoUrl || null,
          fecha_entrega: new Date().toISOString(),
          estado: 'Entregado'
        },
        { onConflict: 'tarea_id, alumno_id' }
      )
      .select();

    if (error) throw error;

    return res.status(200).json({ mensaje: 'Tarea entregada con éxito', data: data[0] });
  } catch (error) {
    console.error('Error al entregar tarea:', error.message);
    return res.status(500).json({ error: 'Error al registrar la entrega.' });
  }
};

module.exports = {
  obtenerAlumnos,
  getMisMaterias,
  getMisAsistencias,
  getMisCalificaciones,
  getMisTareas,
  entregarTarea
};