const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware/authMiddleware');
const { permitirRoles } = require('../middleware/roleMiddleware');
const { 
  obtenerAlumnos,
  getMisMaterias, 
  getMisAsistencias, 
  getMisCalificaciones, 
  getMisTareas, 
  entregarTarea 
} = require('../controllers/alumnoController');

// Proteger todas las rutas de alumnos con JWT
router.use(authMiddleware);

// Ruta protegida para preceptores/profesores/directores: trae la lista general de alumnos
router.get('/', permitirRoles(2, 3, 4, 'preceptor', 'profesor', 'directora'), obtenerAlumnos);

// Rutas privadas para el panel del alumno logueado
router.get('/materias', getMisMaterias);
router.get('/asistencias', getMisAsistencias);
router.get('/calificaciones', getMisCalificaciones);
router.get('/tareas', getMisTareas);
router.post('/entregar-tarea', entregarTarea);

module.exports = router;