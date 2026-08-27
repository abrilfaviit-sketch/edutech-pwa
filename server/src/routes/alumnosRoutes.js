const express = require('express');
const router = express.Router();
const { verificarToken } = require('../middleware/authMiddleware.js');
const { permitirRoles } = require('../middleware/roleMiddleware.js');
const { obtenerAlumnos } = require('../controllers/alumnosController.js');

// Ruta protegida: trae la lista real de alumnos desde Supabase
router.get('/', verificarToken, permitirRoles(2, 3, 4, 'preceptor', 'profesor', 'directora'), obtenerAlumnos);

module.exports = router;