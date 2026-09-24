const { supabase } = require('../../config/supabase');

// obtener dashboard
const getDashboardCompleto = async (req, res) => {
  try {
    const profesorId = req.user.id; // Obtenido desde authMiddleware

    // Cargar materias dictadas por el docente
    const { data: materias, error: errorMaterias } = await supabase
      .from('materias')
      .select('*, cursos(nombre, turno)')
      .eq('profesor_id', profesorId);

    if (errorMaterias) throw errorMaterias;

    // Cargar tareas sobre las materias del docente
    const { data: tareas, error: errorTareas } = await supabase
      .from('tareas')
      .select('*');

    if (errorTareas) throw errorTareas;

    // Cargar planificaciones subidas del docente
    const { data: planificaciones, error: errorPlan } = await supabase
      .from('planificaciones')
      .select('*')
      .eq('profesor_id', profesorId);

    if (errorPlan) throw errorPlan;

    // Cargar mesas de examen
    const { data: mesasExamen, error: errorMesas } = await supabase
      .from('mesas_examen')
      .select('*');

    if (errorMesas) throw errorMesas;

    // Cargar alertas académicas
    const { data: alertasAcademicas, error: errorAlertas } = await supabase
      .from('alertas_academicas')
      .select('*');

    if (errorAlertas) throw errorAlertas;

    return res.status(200).json({
      materias: materias || [],
      tareasPorMateria: tareas || {},
      planificacionesPorMateria: planificaciones || {},
      mesasExamen: mesasExamen || [],
      alertasAcademicas: alertasAcademicas || []
    });
  } catch (error) {
    console.error('Error al cargar dashboard del profesor:', error.message);
    return res.status(500).json({ error: 'Error interno del servidor al consultar Supabase.' });
  }
};

//registrar o actualizar asistencia
const registrarAsistencia = async (req, res) => {
  try {
    const { materiaId, alumnoId, estado, fecha } = req.body;

    if (!materiaId || !alumnoId || !estado) {
      return res.status(400).json({ error: 'Faltan parámetros obligatorios.' });
    }

    const fechaRegistro = fecha ? fecha.split('T')[0] : new Date().toISOString().split('T')[0];

    const { data, error } = await supabase
      .from('asistencias')
      .upsert(
        { materia_id: materiaId, alumno_id: alumnoId, estado, fecha: fechaRegistro },
        { onConflict: 'materia_id, alumno_id, fecha' }
      )
      .select();

    if (error) throw error;

    return res.status(200).json({ mensaje: 'Asistencia registrada con éxito', data });
  } catch (error) {
    console.error('Error al guardar asistencia:', error.message);
    return res.status(500).json({ error: 'Error al registrar la asistencia.' });
  }
};

// publicar tarea nueva
const crearTarea = async (req, res) => {
  try {
    const { materiaId, titulo, consigna, fechaEntrega, archivoNombre } = req.body;

    if (!materiaId || !titulo || !consigna) {
      return res.status(400).json({ error: 'Título, consigna y materia son obligatorios.' });
    }

    const { data, error } = await supabase
      .from('tareas')
      .insert([
        {
          materia_id: materiaId,
          titulo,
          consigna,
          fecha_entrega: fechaEntrega || null,
          archivo_nombre: archivoNombre || null
        }
      ])
      .select();

    if (error) throw error;

    return res.status(201).json({ mensaje: 'Tarea publicada correctamente', data: data[0] });
  } catch (error) {
    console.error('Error al publicar tarea:', error.message);
    return res.status(500).json({ error: 'Error al crear la tarea.' });
  }
};

// subir planificación
const registrarPlanificacion = async (req, res) => {
  try {
    const profesorId = req.user.id;
    const { materiaId, periodo, descripcion, archivoNombre } = req.body;

    const { data, error } = await supabase
      .from('planificaciones')
      .insert([
        {
          materia_id: materiaId,
          profesor_id: profesorId,
          periodo,
          descripcion,
          archivo_nombre: archivoNombre,
          estado: 'En Revisión'
        }
      ])
      .select();

    if (error) throw error;

    return res.status(201).json({ mensaje: 'Planificación enviada a revisión', data: data[0] });
  } catch (error) {
    console.error('Error al registrar planificación:', error.message);
    return res.status(500).json({ error: 'Error al guardar la planificación.' });
  }
};

// hacer o actualizar notas
const actualizarNota = async (req, res) => {
  try {
    const { materiaId, alumnoId, trimestre, campo, valor } = req.body;

    if (!materiaId || !alumnoId || !trimestre) {
      return res.status(400).json({ error: 'Faltan campos obligatorios para guardar la nota.' });
    }

    const { data, error } = await supabase
      .from('calificaciones')
      .upsert(
        {
          materia_id: materiaId,
          alumno_id: alumnoId,
          trimestre: trimestre || '1° Trimestre',
          [campo]: valor,
          updated_at: new Date().toISOString()
        },
        { onConflict: 'materia_id, alumno_id, trimestre' }
      )
      .select();

    if (error) throw error;

    return res.status(200).json({ mensaje: 'Calificación actualizada con éxito', data });
  } catch (error) {
    console.error('Error al actualizar nota:', error.message);
    return res.status(500).json({ error: 'Error al actualizar la nota.' });
  }
};

module.exports = {
  getDashboardCompleto,
  registrarAsistencia,
  crearTarea,
  registrarPlanificacion,
  actualizarNota
};