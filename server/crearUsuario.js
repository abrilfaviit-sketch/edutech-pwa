const bcrypt = require('bcryptjs');
const pool = require('./src/db.js'); // Conexión a tu base de datos

async function crearUsuarioPrueba() {
  try {
    const email = 'preceptora@escuela.edu.ar';
    const passwordPlana = '123456';

    // 1. Encriptar contraseña usando bcryptjs
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(passwordPlana, salt);

    // 2. Obtener el ID del rol 'preceptor'
    const resRol = await pool.query("SELECT id FROM roles WHERE nombre = 'preceptor'");
    if (resRol.rows.length === 0) {
      console.error("El rol 'preceptor' no existe en la tabla roles.");
      process.exit(1);
    }
    const rolId = resRol.rows[0].id;

    // 3. Eliminar si ya existía para evitar duplicados
    await pool.query("DELETE FROM usuarios WHERE email = $1", [email]);

    // 4. Insertar el usuario
    const queryInsert = `
      INSERT INTO usuarios (nombre, apellido, email, password_hash, rol_id)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING id, email;
    `;
    const values = ['Maria Elena', 'Rodriguez', email, passwordHash, rolId];
    const resInsert = await pool.query(queryInsert, values);

    console.log('USUARIO CREADO CON ÉXITO:');
    console.log(resInsert.rows[0]);
    console.log(' Credenciales para loguearte:');
    console.log(' Email:', email);
    console.log(' Password:', passwordPlana);

  } catch (error) {
    console.error('Error al crear usuario:', error);
  } finally {
    await pool.end();
  }
}

crearUsuarioPrueba();