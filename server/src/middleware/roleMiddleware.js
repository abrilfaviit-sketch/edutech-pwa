// Middleware para restringir el acceso según roles específicos
const permitirRoles = (...rolesPermitidos) => {
  return (req, res, next) => {
    // 1. Verificar que req.usuario exista
    if (!req.usuario || !req.usuario.rol) {
      return res.status(401).json({ 
        exito: false, 
        mensaje: 'Acceso denegado. Información de usuario o rol no disponible.' 
      });
    }

    // 2. Comprobar si el rol del usuario está dentro de los roles autorizados
    const tienePermiso = rolesPermitidos.includes(req.usuario.rol);

    if (!tienePermiso) {
      return res.status(403).json({ 
        exito: false, 
        mensaje: 'No tenés los permisos necesarios para realizar esta acción.' 
      });
    }

    // 3. Si tiene permiso, continuar
    next();
  };
};

module.exports = {
  permitirRoles
};