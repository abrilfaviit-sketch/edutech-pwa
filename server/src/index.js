const express = require('express');
const cors = require('cors');
require('dotenv').config();

// Importa rutas 
const authRoutes = require('./routes/authRoutes');
const alumnoRoutes = require('./routes/alumnoRoutes');
const asistenciasRoutes = require('./routes/asistenciasRoutes');
const notasRoutes = require('./routes/notasRoutes');
const preceptorRoutes = require('./routes/preceptorRoutes');
const profesorRoutes = require('./routes/profesorRoutes');

const app = express();

app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}));

app.use(express.json());

// Conecta endpoints
app.use('/api/auth', authRoutes);
app.use('/api/alumnos', alumnoRoutes);
app.use('/api/asistencias', asistenciasRoutes);
app.use('/api/notas', notasRoutes);
app.use('/api/preceptor', preceptorRoutes);
app.use('/api/profesor', profesorRoutes);

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});