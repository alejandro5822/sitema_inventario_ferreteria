// backend/src/routes/subcategoriasRoutes.js
import express from 'express';
import {
  obtenerSubcategorias,
  crearSubcategoria,
  obtenerSubcategoriaPorId,
  actualizarSubcategoria,
  eliminarSubcategoria
} from '../controllers/subcategoriasController.js';

const router = express.Router();

router.get('/', obtenerSubcategorias);
router.post('/', crearSubcategoria);
router.get('/:id', obtenerSubcategoriaPorId);
router.put('/:id', actualizarSubcategoria);
router.delete('/:id', eliminarSubcategoria);

export default router;
