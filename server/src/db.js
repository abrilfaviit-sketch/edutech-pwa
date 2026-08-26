require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

// Prueba rápida de conexión al iniciar
pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.error('Error al conectar con Supabase:', err.message);
  } else {
    console.log('Conexión exitosa a la base de datos Supabase');
  }
});

// Manejador de errores globales del pool
pool.on('error', (err) => {
  console.error('Error inesperado en el pool de PostgreSQL:', err.message);
});

module.exports = pool;