import express from 'express';
import path from 'path';
import cors from 'cors';
import dotenv from 'dotenv';
import pool from './config/db.js';
import rolesRoutes from './routes/rolesRoutes.js';
import usuariosRoutes from './routes/usuariosRoutes.js';
import categoriasRoutes from './routes/categoriasRoutes.js';
import subcategoriasRoutes from './routes/subcategoriasRoutes.js';
import proveedoresRoutes from './routes/proveedoresRoutes.js';
import productosRoutes from './routes/productosRoutes.js';
import { fileURLToPath } from 'url';
import movimientosRoutes from './routes/movimientosRoutes.js';
import historialRoutes from './routes/historialRoutes.js';
import authRoutes from './routes/authRoutes.js';
import protectedRoutes from './routes/protectedRoutes.js';
import reposicionesRoutes from './routes/reposicionesRoutes.js';
import dashboardRoutes from "./routes/dashboardRoutes.js";


dotenv.config();

const app = express();
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

// Ruta de prueba
app.get('/', (req, res) => {
  res.send('API Inventario Ferretería funcionando ✅');
});

// Rutas de inventario
app.use('/api/auth', authRoutes);
app.use('/api/protegido', protectedRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use('/api/roles', rolesRoutes);
app.use('/api/usuarios', usuariosRoutes);
app.use('/api/categorias', categoriasRoutes);
app.use('/api/subcategorias', subcategoriasRoutes);
app.use('/api/proveedores', proveedoresRoutes);
app.use('/api/productos', productosRoutes);
app.use('/api/reposiciones', reposicionesRoutes);
// Para servir imágenes subidas
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));
app.use('/api/movimientos', movimientosRoutes);
app.use('/api/historial-stock', historialRoutes);

// Probar conexión a la base de datos
app.get('/db-test', async (req, res) => {
  try {
    const result = await pool.query('SELECT NOW()');
    res.json({ dbTime: result.rows[0].now });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error conectando a la base de datos' });
  }
});

app.listen(PORT, () => {
  console.log(`Servidor escuchando en http://localhost:${PORT}`);
});
