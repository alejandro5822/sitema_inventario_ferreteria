// backend/src/routes/usuariosRoutes.js
import express from "express";
import {
  obtenerUsuarios,
  crearUsuario,
  obtenerUsuarioPorId,
  actualizarUsuario,
  eliminarUsuario,
  obtenerPerfil,
  actualizarPerfil,
} from "../controllers/usuariosController.js";
import { verificarToken } from "../middlewares/authMiddleware.js";
import { verificarRol } from "../middlewares/verificarRol.js";

const router = express.Router();

router.get('/perfil', verificarToken, obtenerPerfil);
router.put('/perfil', verificarToken, actualizarPerfil);

router.get("/", verificarToken, verificarRol(['Administrador']), obtenerUsuarios);
router.post("/", verificarToken, verificarRol(['Administrador']), crearUsuario);
router.get("/:id", verificarToken, verificarRol(['Administrador']), obtenerUsuarioPorId);
router.put("/:id", verificarToken, verificarRol(['Administrador']), actualizarUsuario);
router.delete("/:id", verificarToken, verificarRol(['Administrador']), eliminarUsuario);

export default router;
