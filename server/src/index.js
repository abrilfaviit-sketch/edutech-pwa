const express = require('express');
const cors = require('cors');
require('dotenv').config();

// 1. Importar rutas
const authRoutes = require('./routes/authRoutes');
const alumnosRoutes = require('./routes/alumnosRoutes');
const asistenciasRoutes = require('./routes/asistenciasRoutes');
const notasRoutes = require('./routes/notasRoutes');

const app = express();

app.use(cors());
app.use(express.json());

// 2. Conectar endpoints
app.use('/api/auth', authRoutes);
app.use('/api/alumnos', alumnosRoutes);
app.use('/api/asistencias', asistenciasRoutes);
app.use('/api/notas', notasRoutes);

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});