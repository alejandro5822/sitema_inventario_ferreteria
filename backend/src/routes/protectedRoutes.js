import { Router } from 'express';
import { verificarToken } from '../middlewares/authMiddleware.js';

const router = Router();

router.get('/perfil', verificarToken, (req, res) => {
  res.json({
    mensaje: 'Accediste a una ruta protegida 🎉',
    usuario: req.usuario
  });
});

export default router;
