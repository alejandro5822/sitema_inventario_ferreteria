// backend/src/controllers/proveedoresController.js
import pool from '../config/db.js';

export const obtenerProveedores = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM proveedores ORDER BY id');
    res.json(result.rows);
  } catch (error) {
    console.error('Error al obtener proveedores:', error);
    res.status(500).json({ error: 'Error al obtener proveedores' });
  }
};

export const crearProveedor = async (req, res) => {
  const { nombre, telefono, correo, direccion } = req.body;
  try {
    const result = await pool.query(
      `INSERT INTO proveedores(nombre, telefono, correo, direccion)
       VALUES($1, $2, $3, $4) RETURNING *`,
      [nombre, telefono, correo, direccion]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error al crear proveedor:', error);
    res.status(500).json({ error: 'Error al crear proveedor' });
  }
};

export const obtenerProveedorPorId = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query('SELECT * FROM proveedores WHERE id = $1', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Proveedor no encontrado' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error al obtener proveedor:', error);
    res.status(500).json({ error: 'Error al obtener proveedor' });
  }
};

export const actualizarProveedor = async (req, res) => {
  const { id } = req.params;
  const { nombre, telefono, correo, direccion } = req.body;
  try {
    const result = await pool.query(
      `UPDATE proveedores
       SET nombre = $1, telefono = $2, correo = $3, direccion = $4
       WHERE id = $5 RETURNING *`,
      [nombre, telefono, correo, direccion, id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Proveedor no encontrado' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error al actualizar proveedor:', error);
    res.status(500).json({ error: 'Error al actualizar proveedor' });
  }
};

export const eliminarProveedor = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query('DELETE FROM proveedores WHERE id = $1 RETURNING *', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Proveedor no encontrado' });
    }
    res.json({ mensaje: 'Proveedor eliminado correctamente' });
  } catch (error) {
    console.error('Error al eliminar proveedor:', error);
    res.status(500).json({ error: 'Error al eliminar proveedor' });
  }
};
