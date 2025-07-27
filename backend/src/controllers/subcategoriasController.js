// backend/src/controllers/subcategoriasController.js
import pool from '../config/db.js';

export const obtenerSubcategorias = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT s.*, c.nombre AS categoria_nombre
      FROM subcategorias s
      JOIN categorias c ON s.categoria_id = c.id
      ORDER BY s.id
    `);
    res.json(result.rows);
  } catch (error) {
    console.error('Error al obtener subcategorías:', error);
    res.status(500).json({ error: 'Error al obtener subcategorías' });
  }
};

export const crearSubcategoria = async (req, res) => {
  const { nombre, categoria_id } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO subcategorias(nombre, categoria_id) VALUES($1, $2) RETURNING *',
      [nombre, categoria_id]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error al crear subcategoría:', error);
    res.status(500).json({ error: 'Error al crear subcategoría' });
  }
};

export const obtenerSubcategoriaPorId = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query('SELECT * FROM subcategorias WHERE id = $1', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Subcategoría no encontrada' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error al obtener subcategoría:', error);
    res.status(500).json({ error: 'Error al obtener subcategoría' });
  }
};

export const actualizarSubcategoria = async (req, res) => {
  const { id } = req.params;
  const { nombre, categoria_id } = req.body;
  try {
    const result = await pool.query(
      'UPDATE subcategorias SET nombre = $1, categoria_id = $2 WHERE id = $3 RETURNING *',
      [nombre, categoria_id, id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Subcategoría no encontrada' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error al actualizar subcategoría:', error);
    res.status(500).json({ error: 'Error al actualizar subcategoría' });
  }
};

export const eliminarSubcategoria = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query('DELETE FROM subcategorias WHERE id = $1 RETURNING *', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Subcategoría no encontrada' });
    }
    res.json({ mensaje: 'Subcategoría eliminada correctamente' });
  } catch (error) {
    console.error('Error al eliminar subcategoría:', error);
    res.status(500).json({ error: 'Error al eliminar subcategoría' });
  }
};
