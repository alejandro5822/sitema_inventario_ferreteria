export const verificarRol = (rolesPermitidos = []) => {
  return (req, res, next) => {
    const rolUsuario = req.usuario?.rol_nombre;

    if (!rolesPermitidos.includes(rolUsuario)) {
      return res.status(403).json({ error: 'Acceso denegado. Rol no autorizado' });
    }

    next();
  };
};
