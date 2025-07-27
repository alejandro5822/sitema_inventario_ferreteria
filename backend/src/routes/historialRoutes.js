import { Router } from 'express';
import { obtenerHistorialStock } from '../controllers/historialController.js';

const router = Router();

router.get('/', obtenerHistorialStock);

export default router;
