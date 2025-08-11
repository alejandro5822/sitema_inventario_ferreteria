import { Router } from 'express';
import { login, obtenerPerfil } from '../controllers/authController.js';
import { verificarToken } from '../middlewares/authMiddleware.js';
import jwt from 'jsonwebtoken'

const router = Router();

router.get("/verificar", (req, res) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ error: "Token no proporcionado" });
  }

  const token = authHeader.split(" ")[1];

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(401).json({ error: err.message });
    }
    res.json({ valido: true, usuario: decoded });
  });
});

router.post('/login', login);
router.get('/perfil', verificarToken, obtenerPerfil);

export default router;
