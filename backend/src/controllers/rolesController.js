// backend/src/controllers/rolesController.js
import pool from '../config/db.js';

// Listar todos los roles
export const obtenerRoles = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM roles ORDER BY id');
    res.status(200).json(result.rows);
  } catch (error) {
    console.error('Error al obtener roles:', error);
    res.status(500).json({ error: 'Error al obtener roles' });
  }
};

// Crear un nuevo rol
export const crearRol = async (req, res) => {
  const { nombre } = req.body;
  const { descripcion } = req.body;
  try {
    const result = await pool.query('INSERT INTO roles(nombre, descripcion) VALUES($1, $2) RETURNING *', [nombre, descripcion]);
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error al crear rol:', error);
    res.status(500).json({ error: 'Error al crear rol' });
  }
};

// Obtener un rol por ID
export const obtenerRolPorId = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query('SELECT * FROM roles WHERE id = $1', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Rol no encontrado' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error al obtener rol:', error);
    res.status(500).json({ error: 'Error al obtener rol' });
  }
};

// Actualizar un rol
export const actualizarRol = async (req, res) => {
  const { id } = req.params;
  const { nombre, descripcion } = req.body;
  try {
    const result = await pool.query(
      'UPDATE roles SET nombre = $1, descripcion = $2 WHERE id = $3 RETURNING *',
      [nombre, descripcion, id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Rol no encontrado' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error al actualizar rol:', error);
    res.status(500).json({ error: 'Error al actualizar rol' });
  }
};

// Eliminar un rol
export const eliminarRol = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query('DELETE FROM roles WHERE id = $1 RETURNING *', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Rol no encontrado' });
    }
    res.json({ mensaje: 'Rol eliminado correctamente' });
  } catch (error) {
    console.error('Error al eliminar rol:', error);
    res.status(500).json({ error: 'Error al eliminar rol' });
  }
};
