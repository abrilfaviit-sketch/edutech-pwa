import jwt from 'jsonwebtoken';

// Middleware para verificar que el usuario esté autenticado mediante JWT

export const authMiddleware = (req, res, next) => {
  // Lee 'authorization' o 'Authorization' por compatibilidad de encabezados HTTP
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
    
    // Inyecta el contenido decoded del token en el objeto req
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

// Exportación secundaria por si se lo usa en otro lado
export const verificarToken = authMiddleware;

export default authMiddleware;