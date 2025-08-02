// backend/src/controllers/usuariosController.js
import pool from '../config/db.js';
import bcrypt from 'bcryptjs';

// Obtener todos los usuarios
export const obtenerUsuarios = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT u.id, u.nombre, u.correo, r.nombre AS rol, u.estado, u.fecha_creacion
      FROM usuarios u
      LEFT JOIN roles r ON u.rol_id = r.id
      ORDER BY u.id
    `);
    res.json(result.rows);
  } catch (error) {
    console.error('Error al obtener usuarios:', error);
    res.status(500).json({ error: 'Error al obtener usuarios' });
  }
};

// Crear un nuevo usuario
export const crearUsuario = async (req, res) => {
  try {
    const { nombre, correo, contrasena, rol_id } = req.body;

    const salt = await bcrypt.genSalt(10);
    const hashContrasena = await bcrypt.hash(contrasena, salt);

    const resultado = await pool.query(
      `INSERT INTO usuarios (nombre, correo, contrasena, rol_id)
       VALUES ($1, $2, $3, $4) RETURNING id`,
      [nombre, correo, hashContrasena, rol_id]
    );

    res.status(201).json({ mensaje: 'Usuario creado correctamente', id: resultado.rows[0].id });
  } catch (error) {
    console.error('Error al crear usuario:', error);
    res.status(500).json({ error: 'Error al crear usuario' });
  }
};

// Obtener un usuario por ID
export const obtenerUsuarioPorId = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query('SELECT * FROM usuarios WHERE id = $1', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error al obtener usuario:', error);
    res.status(500).json({ error: 'Error al obtener usuario' });
  }
};

// Actualizar usuario
export const actualizarUsuario = async (req, res) => {
  const { id } = req.params;
  const { nombre, correo, contrasena, rol_id, estado } = req.body;
  try {
    const result = await pool.query(
      'UPDATE usuarios SET nombre=$1, correo=$2, contrasena=$3, rol_id=$4, estado=$5 WHERE id=$6 RETURNING *',
      [nombre, correo, contrasena, rol_id, estado, id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error al actualizar usuario:', error);
    res.status(500).json({ error: 'Error al actualizar usuario' });
  }
};

// Eliminar usuario
export const eliminarUsuario = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query('DELETE FROM usuarios WHERE id = $1 RETURNING *', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }
    res.json({ mensaje: 'Usuario eliminado correctamente' });
  } catch (error) {
    console.error('Error al eliminar usuario:', error);
    res.status(500).json({ error: 'Error al eliminar usuario' });
  }
};
