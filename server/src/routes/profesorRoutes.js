const express = require('express');
const router = express.Router();
const multer = require('multer')
const { 
  getDashboardCompleto, 
  registrarAsistencia, 
  crearTarea, 
  registrarPlanificacion, 
  actualizarNota 
} = require('../controllers/profesorController');

const { authMiddleware } = require('../middleware/authMiddleware');

const upload = multer({ storage: multer.memoryStorage() });

// Proteger todas las rutas con middleware JWT
router.use(authMiddleware);

router.get('/dashboard-completo', getDashboardCompleto);
router.post('/asistencia', registrarAsistencia);
router.post('/tareas', crearTarea);
router.post('/planificaciones', registrarPlanificacion);
router.patch('/notas', actualizarNota);

//Interceptamos los archivos
router.post('/tareas', upload.single('archivo'), crearTarea);
router.post('/planificaciones', upload.single('archivo'), registrarPlanificacion);

module.exports = router;