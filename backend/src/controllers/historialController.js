import pool from '../config/db.js';

export const obtenerHistorialStock = async (req, res) => {
  try {
    const resultado = await pool.query(`
      SELECT 
        hs.id,
        hs.stock_anterior,
        hs.stock_nuevo,
        hs.motivo,
        hs.fecha,
        p.nombre AS nombre_producto,
        u.nombre AS nombre_usuario
      FROM historial_stock hs
      JOIN productos p ON hs.producto_id = p.id
      JOIN usuarios u ON hs.usuario_id = u.id
      ORDER BY hs.fecha DESC
    `);

    res.json(resultado.rows);
  } catch (error) {
    console.error('Error al obtener historial de stock:', error);
    res.status(500).json({ error: 'Error al obtener historial de stock' });
  }
};
