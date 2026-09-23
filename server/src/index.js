import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

// Importar rutas
import authRoutes from './routes/authRoutes.js';
import alumnosRoutes from './routes/alumnosRoutes.js';
import asistenciasRoutes from './routes/asistenciasRoutes.js';
import notasRoutes from './routes/notasRoutes.js';
import preceptorRoutes from './routes/preceptorRoutes.js';

dotenv.config();

const app = express();

app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}));

app.use(express.json());

// Conectar endpoints
app.use('/api/auth', authRoutes);
app.use('/api/alumnos', alumnosRoutes);
app.use('/api/asistencias', asistenciasRoutes);
app.use('/api/notas', notasRoutes);
app.use('/api/preceptor', preceptorRoutes);

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});