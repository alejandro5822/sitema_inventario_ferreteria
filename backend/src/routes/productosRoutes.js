import express from 'express';
import { upload } from '../middlewares/upload.js';
import { crearProducto, listarProductos } from '../controllers/productosController.js';

const router = express.Router();

// Ruta POST con imagen
router.post('/', upload.single('imagen'), crearProducto);
// Ruta GET para listar productos
router.get('/', listarProductos);


export default router;
