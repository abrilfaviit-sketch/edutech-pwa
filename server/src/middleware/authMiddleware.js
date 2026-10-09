const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
  const authHeader = req.headers['authorization'] || req.headers['Authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ 
      exito: false, 
      mensaje: 'Acceso denegado. No se proporcionó un token de autenticación.' 
    });
  }

  try {
    // Validar configuración del entorno
    if (!process.env.JWT_SECRET) {
      console.error('CRÍTICO: JWT_SECRET no está definido en .env');
      return res.status(500).json({ 
        exito: false, 
        mensaje: 'Error interno de configuración en el servidor.' 
      });
    }

    const verificado = jwt.verify(token, process.env.JWT_SECRET);
    
    // Inyecta el contenido decoded del token en req.usuario 
    req.usuario = verificado; 
    next();
  } catch (error) {
    console.error('Error al verificar token JWT:', error.message);
    return res.status(401).json({ 
      exito: false, 
      mensaje: 'Token inválido o expirado.' 
    });
  }
};

module.exports = { authMiddleware };