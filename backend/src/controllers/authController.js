import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import pool from '../config/db.js';

export const login = async (req, res) => {
  try {
    const { correo, contrasena } = req.body;

    const resultado = await pool.query(
      `SELECT u.id, u.nombre, u.correo, u.contrasena, u.rol_id, r.nombre AS rol_nombre 
       FROM usuarios u 
       JOIN roles r ON u.rol_id = r.id 
       WHERE u.correo = $1 AND u.estado = true`,
      [correo]
    );

    const usuario = resultado.rows[0];

    if (!usuario) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    const coincide = await bcrypt.compare(contrasena, usuario.contrasena);

    if (!coincide) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    const token = jwt.sign(
      {
        id: usuario.id,
        nombre: usuario.nombre,
        correo: usuario.correo,
        rol_id: usuario.rol_id,
        rol_nombre: usuario.rol_nombre
      },
      process.env.JWT_SECRET,
      { expiresIn: '8h' }
    );

    res.json({ usuario, token });
  } catch (error) {
    console.error('Error en login:', error);
    res.status(500).json({ error: 'Error en el login' });
  }
};

export const obtenerPerfil = async (req, res) => {
  try {
    const { id } = req.usuario;

    const resultado = await pool.query(
      `SELECT u.id, u.nombre, u.correo, u.rol_id, r.nombre AS rol_nombre
       FROM usuarios u
       JOIN roles r ON u.rol_id = r.id
       WHERE u.id = $1`,
      [id]
    );

    if (resultado.rows.length === 0) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    const perfil = resultado.rows[0];
    res.json(perfil);
  } catch (error) {
    console.error('Error al obtener perfil:', error);
    res.status(500).json({ error: 'Error al obtener perfil' });
  }
};

