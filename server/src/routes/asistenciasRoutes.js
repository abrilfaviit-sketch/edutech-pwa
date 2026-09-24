const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware/authMiddleware.js');
const { permitirRoles } = require('../middleware/roleMiddleware.js');

router.get('/', authMiddleware, (req, res) => {
  res.json({ exito: true, mensaje: 'Ruta de asistencias activa' });
});

module.exports = router;