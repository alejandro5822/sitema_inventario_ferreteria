// backend/src/routes/rolesRoutes.js
import express from 'express';
import {
  obtenerRoles,
  crearRol,
  obtenerRolPorId,
  actualizarRol,
  eliminarRol
} from '../controllers/rolesController.js';

const router = express.Router();

router.get('/', obtenerRoles);
router.post('/', crearRol);
router.get('/:id', obtenerRolPorId);
router.put('/:id', actualizarRol);
router.delete('/:id', eliminarRol);

export default router;
