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
    let query, params;

    if (contrasena) {
      // Si se envía nueva contraseña, encriptar
      const salt = await bcrypt.genSalt(10);
      const hashContrasena = await bcrypt.hash(contrasena, salt);

      query = `
        UPDATE usuarios
        SET nombre=$1, correo=$2, contrasena=$3, rol_id=$4, estado=$5
        WHERE id=$6 RETURNING *
      `;
      params = [nombre, correo, hashContrasena, rol_id, estado, id];
    } else {
      // Si no se envía, no actualizar la contraseña
      query = `
        UPDATE usuarios
        SET nombre=$1, correo=$2, rol_id=$3, estado=$4
        WHERE id=$5 RETURNING *
      `;
      params = [nombre, correo, rol_id, estado, id];
    }

    const result = await pool.query(query, params);
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

// Obtener perfil del usuario logueado
export const obtenerPerfil = async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, nombre, correo, rol_id, estado, fecha_creacion FROM usuarios WHERE id = $1',
      [req.usuario.id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error al obtener perfil:', error);
    res.status(500).json({ error: 'Error al obtener perfil' });
  }
};

// Actualizar perfil del usuario logueado
export const actualizarPerfil = async (req, res) => {
  const { nombre, correo, contrasena } = req.body;
  try {
    let query, params;

    if (contrasena) {
      const salt = await bcrypt.genSalt(10);
      const hashContrasena = await bcrypt.hash(contrasena, salt);
      query = `
        UPDATE usuarios
        SET nombre=$1, correo=$2, contrasena=$3
        WHERE id=$4 RETURNING id, nombre, correo, rol_id, estado, fecha_creacion
      `;
      params = [nombre, correo, hashContrasena, req.usuario.id];
    } else {
      query = `
        UPDATE usuarios
        SET nombre=$1, correo=$2
        WHERE id=$3 RETURNING id, nombre, correo, rol_id, estado, fecha_creacion
      `;
      params = [nombre, correo, req.usuario.id];
    }

    const result = await pool.query(query, params);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error al actualizar perfil:', error);
    res.status(500).json({ error: 'Error al actualizar perfil' });
  }
};

