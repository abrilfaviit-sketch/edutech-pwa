const { Router } = require('express');
const { authMiddleware } = require('../middleware/authMiddleware.js');
const preceptorController = require('../controllers/preceptorController.js');

const router = Router();
router.use(authMiddleware);

router.get('/cursos', preceptorController.getCursos);
router.get('/alumnos', preceptorController.getAlumnos);
router.post('/asistencia', preceptorController.registrarAsistencia);
router.get('/sanciones', preceptorController.getSanciones);
router.post('/sanciones', preceptorController.registrarSancion);

module.exports = router;