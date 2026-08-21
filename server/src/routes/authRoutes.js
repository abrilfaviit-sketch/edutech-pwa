const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { verificarToken } = require('../middleware/authMiddleware.js'); //verificar tokens
const { permitirRoles } = require('../middleware/roleMiddleware.js'); // permitir roles

router.post('/registro', authController.registrar);
router.post('/login', authController.login);

// Ruta 1: Cualquier usuario autenticado puede ver su perfil
router.get('/perfil', verificarToken, (req, res) => {
  res.json({
    exito: true,
    mensaje: 'Perfil de usuario obtenido correctamente',
    usuario: req.usuario
  });
});

// Ruta 2: Solo accesibles por directivos o preceptores (Prueba de Roles)
router.get('/panel-privado', verificarToken, permitirRoles('directora', 'preceptor'), (req, res) => {
  res.json({
    exito: true,
    mensaje: 'Bienvenido al panel privado de gestión escolar'
  });
});

module.exports = router;