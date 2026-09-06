const db = require('../db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Registrar usuario
exports.registrar = async (req, res) => {
  const { nombre, apellido, email, password, rol_id } = req.body;

  try {
    const existe = await db.query('SELECT id FROM usuarios WHERE email = $1', [email]);
    if (existe.rows.length > 0) {
      return res.status(400).json({ error: 'El email ya está registrado' });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const query = `
      INSERT INTO usuarios (nombre, apellido, email, password_hash, rol_id)
      VALUES ($1, $2, $3, $4, $5) RETURNING id, nombre, apellido, email, rol_id;
    `;
    const nuevoUsuario = await db.query(query, [nombre, apellido, email, passwordHash, rol_id]);

    res.status(201).json({
      mensaje: 'Usuario registrado con éxito',
      usuario: nuevoUsuario.rows[0]
    });

  } catch (error) {
    console.error('Error en registrar:', error);
    res.status(500).json({ error: 'Error al registrar el usuario' });
  }
};

// Login de usuario
exports.login = async (req, res) => {
  const { email, usuario, password } = req.body;
  const identificador = email || usuario;

  if (!identificador || !password) {
    return res.status(400).json({ error: 'Por favor ingresá usuario/email y contraseña' });
  }

  try {
    const result = await db.query('SELECT * FROM usuarios WHERE email = $1', [identificador]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    const usuarioEncontrado = result.rows[0];
    const hashGuardado = usuarioEncontrado.password_hash || usuarioEncontrado.password;

    if (!hashGuardado) {
      return res.status(500).json({ error: 'El usuario no posee una contraseña configurada' });
    }

    const passwordValida = await bcrypt.compare(password, hashGuardado);
    if (!passwordValida) {
      return res.status(401).json({ error: 'Contraseña incorrecta' });
    }

    const token = jwt.sign(
      { id: usuarioEncontrado.id, rol_id: usuarioEncontrado.rol_id },
      process.env.JWT_SECRET || 'secreto_super_seguro',
      { expiresIn: '12h' }
    );

    res.json({
      mensaje: 'Login exitoso',
      token,
      usuario: {
        id: usuarioEncontrado.id,
        nombre: usuarioEncontrado.nombre,
        apellido: usuarioEncontrado.apellido,
        email: usuarioEncontrado.email,
        rol_id: usuarioEncontrado.rol_id
      }
    });

  } catch (error) {
    // ENVIAMOS EL MENSAJE REAL DIRECTAMENTE AL NAVEGADOR
    return res.status(500).json({ 
      error: 'Error interno en login', 
      detalle: error.message 
    });
  }
};