import pool from "../config/db.js";
import nodemailer from "nodemailer";

// Obtener todas las reposiciones
export const obtenerReposiciones = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT r.*, p.nombre AS producto, pr.nombre AS proveedor, u.nombre AS solicitante
      FROM reposiciones r
      LEFT JOIN productos p ON r.producto_id = p.id
      LEFT JOIN proveedores pr ON r.proveedor_id = pr.id
      LEFT JOIN usuarios u ON r.usuario_id = u.id
      ORDER BY r.fecha_solicitud DESC
    `);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: "Error al obtener las reposiciones" });
  }
};

// Crear una nueva reposición
export const crearReposicion = async (req, res) => {
  const { producto_id, proveedor_id, cantidad_solicitada, precio_unitario } =
    req.body;

  try {
    const result = await pool.query(
      `
      INSERT INTO reposiciones 
        (producto_id, proveedor_id, cantidad_solicitada, precio_unitario, usuario_id)
      VALUES 
        ($1, $2, $3, $4, $5)
      RETURNING *;
    `,
      [
        producto_id,
        proveedor_id,
        cantidad_solicitada,
        precio_unitario,
        req.usuario.id,
      ]
    );

    const reposicion = result.rows[0];

    // 2. Obtener datos del proveedor
    const proveedorRes = await pool.query(
      "SELECT correo, nombre FROM proveedores WHERE id = $1",
      [proveedor_id]
    );
    const proveedor = proveedorRes.rows[0];

    // 2.1. Obtener nombre del producto
    const productoRes = await pool.query(
      "SELECT nombre FROM productos WHERE id = $1",
      [producto_id]
    );
    const producto = productoRes.rows[0];

    // 3. Enviar correo si el proveedor tiene correo
    if (proveedor?.correo && producto?.nombre) {
      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: "alejandroalbareztorrejon4@gmail.com",
          pass: "hhug blnb jaba mqvr",
        },
      });
      const mailOptions = {
        from: "alejandroalbareztorrejon4@gmail.com",
        to: proveedor.correo,
        subject: `Nueva solicitud de reposición`,
        text: `Estimado ${proveedor.nombre},\n\nSe ha solicitado una reposición del producto ${producto.nombre}.\nCantidad: ${cantidad_solicitada}\nPrecio unitario: ${precio_unitario} Bs.\n\nPor favor, coordine el envío.\n`,
      };

      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          console.error("Error al enviar correo:", error);
        } else {
          console.log("Correo enviado:", info.response);
        }
      });
    }

    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: "Error al crear la reposición" });
  }
};

// Actualizar estado de una reposición (por ejemplo, marcar como recibida)
export const actualizarEstado = async (req, res) => {
  const { id } = req.params;
  const { estado } = req.body;

  if (!["pendiente", "recibido", "cancelado"].includes(estado)) {
    return res.status(400).json({ error: "Estado no válido" });
  }

  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    // 1. Actualiza el estado y la fecha de recepción si corresponde
    let query, params;
    if (estado === "recibido") {
      query = `
        UPDATE reposiciones
        SET estado = $1, fecha_recepcion = CURRENT_TIMESTAMP
        WHERE id = $2
        RETURNING *;
      `;
      params = [estado, id];
    } else {
      query = `
        UPDATE reposiciones
        SET estado = $1
        WHERE id = $2
        RETURNING *;
      `;
      params = [estado, id];
    }

    const result = await client.query(query, params);
    if (result.rowCount === 0) {
      await client.query("ROLLBACK");
      return res.status(404).json({ error: "Reposición no encontrada" });
    }
    const reposicion = result.rows[0];

    // 2. Si es recibido, actualiza stock y registra movimiento/historial
    if (estado === "recibido") {
      // Obtén el stock anterior
      const prodRes = await client.query(
        "SELECT stock FROM productos WHERE id = $1 FOR UPDATE",
        [reposicion.producto_id]
      );
      const stockAnterior = prodRes.rows[0]?.stock ?? 0;

      // Actualiza el stock
      const updRes = await client.query(
        "UPDATE productos SET stock = stock + $1 WHERE id = $2 RETURNING stock",
        [reposicion.cantidad_solicitada, reposicion.producto_id]
      );
      const stockNuevo = updRes.rows[0]?.stock ?? stockAnterior;

      // Registra movimiento de entrada
      await client.query(
        `INSERT INTO movimientos (producto_id, tipo_movimiento, cantidad, descripcion, usuario_id, proveedor_id)
         VALUES ($1, 'entrada', $2, $3, $4, $5)`,
        [
          reposicion.producto_id,
          reposicion.cantidad_solicitada,
          `Reposicion`,
          reposicion.usuario_id,
          reposicion.proveedor_id,
        ]
      );

      // Registra historial de stock
      await client.query(
        `INSERT INTO historial_stock (producto_id, stock_anterior, stock_nuevo, motivo, usuario_id)
         VALUES ($1, $2, $3, $4, $5)`,
        [
          reposicion.producto_id,
          stockAnterior,
          stockNuevo,
          `Reposicion`,
          reposicion.usuario_id,
        ]
      );
    }

    await client.query("COMMIT");
    res.json(reposicion);
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("Error al actualizar estado de reposición:", err);
    res.status(500).json({ error: "Error al actualizar estado" });
  } finally {
    client.release();
  }
};

// Eliminar una reposición
export const eliminarReposicion = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query(
      "DELETE FROM reposiciones WHERE id = $1 RETURNING *",
      [id]
    );
    if (result.rowCount === 0) {
      return res.status(404).json({ error: "Reposición no encontrada" });
    }
    res.json({ mensaje: "Reposición eliminada correctamente" });
  } catch (err) {
    res.status(500).json({ error: "Error al eliminar reposición" });
  }
};
