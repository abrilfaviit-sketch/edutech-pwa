const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authMiddleware } = require('../middleware/authMiddleware'); 
const { permitirRoles } = require('../middleware/roleMiddleware');

// Rutas públicas
router.post('/registro', authController.registrar);
router.post('/login', authController.login);

// Ruta para obtener perfil del usuario logueado 
router.get('/perfil', authMiddleware, authController.getPerfil);
router.get('/me', authMiddleware, authController.getPerfil);

// Ruta de prueba para roles específicos
router.get('/panel-privado', authMiddleware, permitirRoles(2, 4, 'preceptor', 'directora'), (req, res) => {
  res.json({
    exito: true,
    mensaje: 'Bienvenido al panel privado de gestión escolar'
  });
});

module.exports = router;