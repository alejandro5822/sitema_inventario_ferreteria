// backend/src/routes/categoriasRoutes.js
import express from 'express';
import {
  obtenerCategorias,
  crearCategoria,
  obtenerCategoriaPorId,
  actualizarCategoria,
  eliminarCategoria
} from '../controllers/categoriasController.js';

const router = express.Router();

router.get('/', obtenerCategorias);
router.post('/', crearCategoria);
router.get('/:id', obtenerCategoriaPorId);
router.put('/:id', actualizarCategoria);
router.delete('/:id', eliminarCategoria);

export default router;
