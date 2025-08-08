// backend/src/controllers/categoriasController.js
import pool from '../config/db.js';

export const obtenerCategorias = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM categorias ORDER BY id');
    res.json(result.rows);
  } catch (error) {
    console.error('Error al obtener categorías:', error);
    res.status(500).json({ error: 'Error al obtener categorías' });
  }
};

export const crearCategoria = async (req, res) => {
  const { nombre, descripcion } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO categorias(nombre, descripcion) VALUES($1, $2) RETURNING *',
      [nombre, descripcion]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error al crear categoría:', error);
    res.status(500).json({ error: 'Error al crear categoría' });
  }
};

export const obtenerCategoriaPorId = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query('SELECT * FROM categorias WHERE id = $1', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Categoría no encontrada' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error al obtener categoría:', error);
    res.status(500).json({ error: 'Error al obtener categoría' });
  }
};

export const actualizarCategoria = async (req, res) => {
  const { id } = req.params;
  const { nombre, descripcion } = req.body;
  try {
    const result = await pool.query(
      'UPDATE categorias SET nombre=$1, descripcion=$2 WHERE id=$3 RETURNING *',
      [nombre, descripcion, id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Categoría no encontrada' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error al actualizar categoría:', error);
    res.status(500).json({ error: 'Error al actualizar categoría' });
  }
};

// controllers/categoriasController.js

export const eliminarCategoria = async (req, res) => {
  const { id } = req.params;

  try {
    // Verificar si hay subcategorías asociadas
    const resultado = await pool.query(
      'SELECT COUNT(*) FROM subcategorias WHERE categoria_id = $1',
      [id]
    );

    const totalSubcategorias = parseInt(resultado.rows[0].count);

    if (totalSubcategorias > 0) {
      return res.status(400).json({
        error: 'No se puede eliminar la categoría porque tiene subcategorías asociadas',
      });
    }

    // Si no hay subcategorías, eliminar la categoría
    await pool.query('DELETE FROM categorias WHERE id = $1', [id]);

    res.json({ mensaje: 'Categoría eliminada correctamente' });
  } catch (error) {
    console.error('Error al eliminar categoría:', error);
    res.status(500).json({ error: 'No se pudo eliminar la categoría' });
  }
};

