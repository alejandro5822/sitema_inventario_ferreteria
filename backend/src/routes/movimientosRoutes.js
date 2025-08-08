import express from 'express';
import { crearMovimiento, obtenerMovimientos, eliminarMovimiento } from '../controllers/movimientosController.js';
import { verificarToken } from "../middlewares/authMiddleware.js";
import { verificarRol } from "../middlewares/verificarRol.js";

const router = express.Router();

router.post('/', crearMovimiento);
router.get('/', obtenerMovimientos);
router.delete('/:id', verificarToken, verificarRol(['Administrador']), eliminarMovimiento);


export default router;
