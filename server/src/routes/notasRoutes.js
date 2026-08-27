const express = require('express');
const router = express.Router();
const { verificarToken } = require('../middleware/authMiddleware.js');

router.get('/', verificarToken, (req, res) => {
  res.json({ exito: true, mensaje: 'Ruta de notas activa' });
});

module.exports = router;