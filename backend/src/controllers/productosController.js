import pool from '../config/db.js';

// Obtener todos los productos
export const obtenerProductos = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM productos ORDER BY id');
    res.json(result.rows);
  } catch (error) {
    console.error('Error al obtener productos:', error);
    res.status(500).json({ error: 'Error al obtener productos' });
  }
};

// Agregar un nuevo producto
export const crearProducto = async (req, res) => {
  try {
    const { nombre, descripcion, precio, stock, categoria_id, proveedor_id, subcategoria_id, imagen_url } = req.body;

    const result = await pool.query(
      `INSERT INTO productos 
       (nombre, descripcion, precio, stock, categoria_id, proveedor_id, subcategoria_id, imagen_url)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [nombre, descripcion, precio, stock, categoria_id, proveedor_id, subcategoria_id, imagen_url]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error al crear producto:', error);
    res.status(500).json({ error: error.message });
  }
};
