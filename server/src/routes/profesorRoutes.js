const express = require('express');
const router = express.Router();
const { 
  getDashboardCompleto, 
  registrarAsistencia, 
  crearTarea, 
  registrarPlanificacion, 
  actualizarNota 
} = require('../controllers/profesorController');

const { authMiddleware } = require('../middleware/authMiddleware');

// Proteger todas las rutas con middleware JWT
router.use(authMiddleware);

router.get('/dashboard-completo', getDashboardCompleto);
router.post('/asistencia', registrarAsistencia);
router.post('/tareas', crearTarea);
router.post('/planificaciones', registrarPlanificacion);
router.patch('/notas', actualizarNota);

module.exports = router;