import pool from '../config/db.js';

export const crearMovimiento = async (req, res) => {
  const { producto_id, tipo_movimiento, cantidad, descripcion, usuario_id, proveedor_id } = req.body;

  try {
    // Verificar si el producto existe
    const producto = await pool.query('SELECT * FROM productos WHERE id = $1', [producto_id]);
    if (producto.rowCount === 0) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }

    const stockActual = producto.rows[0].stock;
    let nuevoStock = stockActual;

    // Calcular el nuevo stock
    if (tipo_movimiento === 'entrada') {
      nuevoStock += parseInt(cantidad);
    } else if (tipo_movimiento === 'salida') {
      if (cantidad > stockActual) {
        return res.status(400).json({ error: 'Stock insuficiente para salida' });
      }
      nuevoStock -= parseInt(cantidad);
    } else {
      return res.status(400).json({ error: 'Tipo de movimiento inválido' });
    }

    // Iniciar transacción
    await pool.query('BEGIN');

    // Insertar en movimientos
    await pool.query(`
      INSERT INTO movimientos (producto_id, tipo_movimiento, cantidad, descripcion, usuario_id, proveedor_id)
      VALUES ($1, $2, $3, $4, $5, $6)
    `, [producto_id, tipo_movimiento, cantidad, descripcion, usuario_id, proveedor_id || null]);

    // Actualizar stock del producto
    await pool.query(`
      UPDATE productos SET stock = $1 WHERE id = $2
    `, [nuevoStock, producto_id]);

    // Registrar en historial_stock
    await pool.query(`
      INSERT INTO historial_stock (producto_id, stock_anterior, stock_nuevo, motivo, usuario_id)
      VALUES ($1, $2, $3, $4, $5)
    `, [producto_id, stockActual, nuevoStock, descripcion || tipo_movimiento, usuario_id]);

    // Confirmar transacción
    await pool.query('COMMIT');

    res.status(201).json({ mensaje: 'Movimiento registrado correctamente', nuevo_stock: nuevoStock });
  } catch (error) {
    await pool.query('ROLLBACK');
    console.error('Error al registrar movimiento:', error);
    res.status(500).json({ error: 'Error al registrar el movimiento' });
  }
};

export const obtenerMovimientos = async (req, res) => {
  try {
    const resultado = await pool.query(`
      SELECT 
        m.id,
        m.tipo_movimiento,
        m.cantidad,
        m.descripcion,
        m.fecha,
        p.nombre AS nombre_producto,
        u.nombre AS nombre_usuario,
        pr.nombre AS nombre_proveedor
      FROM movimientos m
      JOIN productos p ON m.producto_id = p.id
      JOIN usuarios u ON m.usuario_id = u.id
      LEFT JOIN proveedores pr ON m.proveedor_id = pr.id
      ORDER BY m.fecha DESC
    `);

    res.json(resultado.rows);
  } catch (error) {
    console.error('Error al obtener movimientos:', error);
    res.status(500).json({ error: 'Error al obtener movimientos' });
  }
};
