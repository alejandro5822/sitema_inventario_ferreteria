import jwt from 'jsonwebtoken';

export const verificarToken = (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Token no proporcionado' });
    }

    const token = authHeader.split(' ')[1];

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.usuario = {
      id: decoded.id,
      nombre: decoded.nombre,
      correo: decoded.correo,
      rol_id: decoded.rol_id,
      rol_nombre: decoded.rol_nombre
    };

    next();
  } catch (error) {
    console.error('Error al verificar token:', error.message);
    return res.status(403).json({ error: 'Token inválido o expirado' });
  }
};
