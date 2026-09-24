// Middleware para restringir el acceso según roles específicos
const permitirRoles = (...rolesPermitidos) => {
  return (req, res, next) => {
    // 1. Extraer el rol del token (soporta 'rol_id' o 'rol')
    const rolUsuario = req.usuario?.rol_id ?? req.usuario?.rol;

    // 2. Verificar que exista información de rol en el usuario
    if (!req.usuario || rolUsuario === undefined || rolUsuario === null) {
      return res.status(401).json({ 
        exito: false, 
        mensaje: 'Acceso denegado. Información de usuario o rol no disponible.' 
      });
    }

    // 3. Normalizar array de roles permitidos y comparar números y strings
    const rolesNormalizados = rolesPermitidos.flatMap(r => [r, String(r), Number(r)].filter(v => !isNaN(v) || typeof v === 'string'));

    // 4. Comprobar si el rol del usuario está dentro de los autorizados
    const tienePermiso = rolesNormalizados.includes(rolUsuario);

    if (!tienePermiso) {
      return res.status(403).json({ 
        exito: false, 
        mensaje: 'No tenés los permisos necesarios para realizar esta acción.' 
      });
    }

    // 5. Si tiene permiso, continuar
    next();
  };
};

module.exports = {
  permitirRoles
};