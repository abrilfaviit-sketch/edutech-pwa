const jwt = require('jsonwebtoken');

// Middleware para verificar que el usuario esté autenticado mediante JWT
const verificarToken = (req, res, next) => {
  // Leemos 'authorization' o 'Authorization' por compatibilidad de servidores
  const authHeader = req.headers['authorization'] || req.headers['Authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  // Si no hay token, denegar el acceso
  if (!token) {
    return res.status(401).json({ 
      exito: false, 
      mensaje: 'Acceso denegado. No se proporcionó un token de autenticación.' 
    });
  }

  try {
    const secretKey = process.env.JWT_SECRET || 'secreto_super_seguro';
    const verificado = jwt.verify(token, secretKey);
    
    req.usuario = verificado; // Guardar los datos en req
    next();
  } catch (error) {
    console.error('Error al verificar token JWT:', error.message);
    return res.status(401).json({ 
      exito: false, 
      mensaje: 'Token inválido o expirado.' 
    });
  }
};

module.exports = {
  verificarToken
};