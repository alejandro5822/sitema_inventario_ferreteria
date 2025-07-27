import pool from '../config/db.js';

export const crearProducto = async (req, res) => {
  const {
    nombre,
    descripcion,
    precio,
    stock,
    categoria_id,
    subcategoria_id,
    proveedor_id,
  } = req.body;

  const imagen_url = req.file ? `/uploads/${req.file.filename}` : null;

  try {
    const result = await pool.query(
      `INSERT INTO productos
      (nombre, descripcion, precio, stock, imagen_url, categoria_id, subcategoria_id, proveedor_id)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *`,
      [
        nombre,
        descripcion,
        parseFloat(precio),
        parseInt(stock),
        imagen_url,
        parseInt(categoria_id),
        parseInt(subcategoria_id),
        parseInt(proveedor_id),
      ]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al crear producto' });
  }
};

export const listarProductos = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT p.*, 
             c.nombre AS categoria_nombre,
             s.nombre AS subcategoria_nombre,
             pr.nombre AS proveedor_nombre
      FROM productos p
      LEFT JOIN categorias c ON p.categoria_id = c.id
      LEFT JOIN subcategorias s ON p.subcategoria_id = s.id
      LEFT JOIN proveedores pr ON p.proveedor_id = pr.id
      ORDER BY p.id DESC
    `);
    res.json(result.rows);
  } catch (error) {
    console.error('Error al listar productos:', error);
    res.status(500).json({ error: 'Error al obtener los productos' });
  }
};

