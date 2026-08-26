const bcrypt = require('bcryptjs');
const pool = require('./src/db.js');

async function seedUsuarios() {
  try {
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash('123456', salt);

    // Lista de usuarios a cargar
    const usuarios = [
      { nombre: 'Maria Elena', apellido: 'Rodriguez', email: 'preceptora@escuela.edu.ar', rol: 'preceptor' },
      { nombre: 'Carlos', apellido: 'Docente', email: 'profesor@escuela.edu.ar', rol: 'profesor' },
      { nombre: 'Nora', apellido: 'Directora', email: 'directora@escuela.edu.ar', rol: 'directora' },
      { nombre: 'Lucas', apellido: 'Alumno', email: 'alumno@escuela.edu.ar', rol: 'alumno' }
    ];

    for (const u of usuarios) {
      // 1. Buscar el ID del rol
      const resRol = await pool.query("SELECT id FROM roles WHERE nombre = $1", [u.rol]);
      
      if (resRol.rows.length === 0) {
        console.error(` El rol '${u.rol}' no existe en la tabla roles. Saltando...`);
        continue;
      }
      const rolId = resRol.rows[0].id;

      // 2. Limpiar duplicado específico por email
      await pool.query("DELETE FROM usuarios WHERE email = $1", [u.email]);

      // 3. Insertar usuario
      const queryInsert = `
        INSERT INTO usuarios (nombre, apellido, email, password_hash, rol_id)
        VALUES ($1, $2, $3, $4, $5);
      `;
      await pool.query(queryInsert, [u.nombre, u.apellido, u.email, passwordHash, rolId]);
      console.log(` Creado: ${u.nombre} (${u.rol}) -> ${u.email}`);
    }

    console.log('\n¡Todos los usuarios fueron creados con éxito!');
    console.log('Contraseña general para todos: 123456');

  } catch (error) {
    console.error('Error al poblar la base de datos:', error);
  } finally {
    await pool.end();
  }
}

seedUsuarios();