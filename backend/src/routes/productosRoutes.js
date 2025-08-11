import express from 'express';
import { upload } from '../middlewares/upload.js';
import { crearProducto, listarProductos, actualizarProducto, cambiarEstadoProducto, eliminarProducto, buscarProductos } from '../controllers/productosController.js';

const router = express.Router();

// Ruta POST con imagen
router.post('/', upload.single('imagen'), crearProducto);
router.get('/buscar', buscarProductos);
// Ruta GET para listar productos
router.get('/', listarProductos);
router.put('/:id', upload.single('imagen'), actualizarProducto);
router.patch('/:id/estado', cambiarEstadoProducto);
router.delete('/:id', eliminarProducto);

export default router;
