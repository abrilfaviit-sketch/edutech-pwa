const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware/authMiddleware.js');

router.get('/', authMiddleware, (req, res) => {
  res.json({ exito: true, mensaje: 'Ruta de notas activa' });
});

module.exports = router;