const jwt = require('jsonwebtoken');

// Middleware para verificar que el usuario esté autenticado mediante JWT
const verificarToken = (req, res, next) => {
  // 1. Obtener el token del encabezado (Header) de la petición
  const authHeader = req.headers['authorization'];
  
  // El header viene con formato: "Bearer <TOKEN>"
  const token = authHeader && authHeader.split(' ')[1];

  // 2. Si no hay token, denegar el acceso
  if (!token) {
    return res.status(401).json({ 
      exito: false, 
      mensaje: 'Acceso denegado. No se proporcionó un token de autenticación.' 
    });
  }

  try {
    // 3. Verificar y decodificar el token
    const decodificado = jwt.verify(token, process.env.JWT_SECRET || 'clave_secreta_provisoria');
    
    // 4. Guardar los datos del usuario en el objeto `req` para que las siguientes rutas los usen
    req.usuario = decodificado;

    // 5. Continuar a la siguiente función/ruta
    next();
  } catch (error) {
    return res.status(403).json({ 
      exito: false, 
      mensaje: 'Token inválido o expirado.' 
    });
  }
};

module.exports = {
  verificarToken
};