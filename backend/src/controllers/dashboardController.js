import pool from "../config/db.js";

export const obtenerResumenDashboard = async (req, res) => {
  try {
    // Productos totales
    const { rows: productosTotales } = await pool.query(
      "SELECT COUNT(*) AS total FROM productos WHERE estado = true"
    );

    const { rows: totalStock } = await pool.query(
      "SELECT SUM(stock) AS total FROM productos WHERE estado = true"
    );

    // Reposiciones pendientes
    const { rows: reposPendientes } = await pool.query(
      "SELECT COUNT(*) AS total FROM reposiciones WHERE estado = 'pendiente'"
    );

    // Movimientos del día
    const { rows: movHoy } = await pool.query(
      "SELECT COUNT(*) AS total FROM movimientos WHERE DATE(fecha) = CURRENT_DATE"
    );

    // Productos con bajo stock
    const { rows: productosBajoStock } = await pool.query(
      "SELECT id, nombre, stock FROM productos WHERE estado = true AND stock < 10 ORDER BY stock ASC LIMIT 5"
    );

    // Movimientos del mes
    const { rows: movimientosMes } = await pool.query(
      "SELECT DATE(fecha) AS dia, SUM(CASE WHEN tipo_movimiento = 'entrada' THEN cantidad ELSE 0 END) AS entradas, SUM(CASE WHEN tipo_movimiento = 'salida' THEN cantidad ELSE 0 END) AS salidas FROM movimientos WHERE DATE(fecha) >= DATE_TRUNC('month', CURRENT_DATE) GROUP BY dia ORDER BY dia"
    );

    res.json({
      productosTotales: parseInt(productosTotales[0].total),
      totalStock: parseInt(totalStock[0].total),
      reposPendientes: parseInt(reposPendientes[0].total),
      movHoy: parseInt(movHoy[0].total),
      productosBajoStock,
      movimientosMes,
    });
  } catch (error) {
    console.error("Error obteniendo resumen dashboard:", error);
    res.status(500).json({ error: "Error obteniendo resumen dashboard" });
  }
};
