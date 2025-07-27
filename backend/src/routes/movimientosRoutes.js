import express from 'express';
import { crearMovimiento, obtenerMovimientos } from '../controllers/movimientosController.js';

const router = express.Router();

router.post('/', crearMovimiento);
router.get('/', obtenerMovimientos);

export default router;
