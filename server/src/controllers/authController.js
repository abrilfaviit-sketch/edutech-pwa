const { supabase } = require('../../config/supabase');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Regitro de usuario
const registrar = async (req, res) => {
  const { nombre, apellido, email, password, rol_id } = req.body;

  try {
    // Verificar si el email ya existe
    const { data: existe } = await supabase
      .from('usuarios')
      .select('id')
      .eq('email', email)
      .single();

    if (existe) {
      return res.status(400).json({ error: 'El email ya está registrado' });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    // Insertar nuevo usuario
    const { data: nuevoUsuario, error } = await supabase
      .from('usuarios')
      .insert([
        {
          nombre,
          apellido,
          email,
          password_hash: passwordHash,
          rol_id
        }
      ])
      .select('id, nombre, apellido, email, rol_id')
      .single();

    if (error) throw error;

    return res.status(201).json({
      mensaje: 'Usuario registrado con éxito',
      usuario: nuevoUsuario
    });
  } catch (error) {
    console.error('Error en registrar:', error.message);
    return res.status(500).json({ error: 'Error al registrar el usuario' });
  }
};

// Logion del usuario
const login = async (req, res) => {
  const { email, usuario, password } = req.body;
  const identificador = email || usuario;

  if (!identificador || !password) {
    return res.status(400).json({ error: 'Por favor ingresá usuario/email y contraseña' });
  }

  try {
    const { data: usuarioEncontrado, error } = await supabase
      .from('usuarios')
      .select('*')
      .eq('email', identificador)
      .maybeSingle();

    if (error) throw error;

    if (!usuarioEncontrado) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

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

    return res.json({
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
    console.error('Error interno en login:', error.message);
    return res.status(500).json({
      error: 'Error interno en login',
      detalle: error.message
    });
  }
};

// verifica si la sesión esta activa
const getPerfil = async (req, res) => {
  try {
    const usuarioId = req.user.id;

    const { data: usuario, error } = await supabase
      .from('usuarios')
      .select('id, nombre, apellido, email, rol_id, roles(nombre)')
      .eq('id', usuarioId)
      .single();

    if (error || !usuario) {
      return res.status(404).json({ error: 'Usuario no encontrado.' });
    }

    return res.status(200).json({
      id: usuario.id,
      nombre: usuario.nombre,
      apellido: usuario.apellido,
      email: usuario.email,
      rol: usuario.roles?.nombre || 'usuario'
    });
  } catch (error) {
    console.error('Error al obtener perfil:', error.message);
    return res.status(500).json({ error: 'Error interno del servidor.' });
  }
};

module.exports = {
  registrar,
  login,
  getPerfil
};