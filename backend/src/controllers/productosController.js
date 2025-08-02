import fs from 'fs';
import path from 'path';
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

export const actualizarProducto = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      nombre,
      descripcion,
      precio,
      stock,
      categoria_id,
      subcategoria_id,
      proveedor_id,
      estado
    } = req.body;

    // 1. Obtener la imagen anterior
    const { rows } = await pool.query('SELECT imagen_url FROM productos WHERE id = $1', [id]);
    const imagenAnterior = rows[0]?.imagen_url;

    // 2. Si hay nueva imagen, eliminar la anterior del disco
    let imagen_url = imagenAnterior;
    if (req.file) {
      imagen_url = `/uploads/${req.file.filename}`;
      if (imagenAnterior && imagenAnterior.startsWith('/uploads/')) {
        const rutaImagen = path.resolve('uploads', path.basename(imagenAnterior));
        fs.unlink(rutaImagen, err => {
          if (err) console.warn('No se pudo eliminar la imagen anterior:', err.message);
        });
      }
    }

    await pool.query(
      `UPDATE productos SET 
        nombre = $1,
        descripcion = $2,
        precio = $3,
        stock = $4,
        imagen_url = $5,
        categoria_id = $6,
        subcategoria_id = $7,
        proveedor_id = $8,
        estado = $9
      WHERE id = $10`,
      [
        nombre,
        descripcion,
        precio,
        stock,
        imagen_url,
        categoria_id,
        subcategoria_id,
        proveedor_id,
        estado,
        id
      ]
    );

    res.json({ mensaje: 'Producto actualizado correctamente' });
  } catch (error) {
    console.error('Error al actualizar producto:', error);
    res.status(500).json({ error: 'Error al actualizar producto' });
  }
};

// Controlador
export const cambiarEstadoProducto = async (req, res) => {
  try {
    const { id } = req.params;
    const { estado } = req.body; // true o false

    await pool.query(
      'UPDATE productos SET estado = $1 WHERE id = $2',
      [estado, id]
    );

    res.json({
      mensaje: estado
        ? 'Producto activado'
        : 'Producto desactivado (soft delete)'
    });
  } catch (error) {
    console.error('Error al cambiar estado del producto:', error);
    res.status(500).json({ error: 'Error al actualizar el estado del producto' });
  }
};


export const eliminarProducto = async (req, res) => {
  try {
    const { id } = req.params;

    // 1. Obtener ruta de la imagen
    const { rows } = await pool.query('SELECT imagen_url FROM productos WHERE id = $1', [id]);
    const imagen = rows[0]?.imagen_url;

    // 2. Eliminar del disco si existe
    if (imagen && imagen.startsWith('/uploads/')) {
      fs.unlink(path.resolve('uploads', path.basename(imagen)), err => {
        if (err) console.warn('No se pudo eliminar la imagen del producto:', err.message);
      });
    }

    // 3. Eliminar de la base de datos
    await pool.query('DELETE FROM productos WHERE id = $1', [id]);

    res.json({ mensaje: 'Producto eliminado permanentemente' });
  } catch (error) {
    console.error('Error en delete permanente:', error);
    res.status(500).json({ error: 'Error al eliminar producto' });
  }
};
