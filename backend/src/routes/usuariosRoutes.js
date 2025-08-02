// backend/src/routes/usuariosRoutes.js
import express from "express";
import {
  obtenerUsuarios,
  crearUsuario,
  obtenerUsuarioPorId,
  actualizarUsuario,
  eliminarUsuario,
} from "../controllers/usuariosController.js";
import { verificarToken } from "../middlewares/authMiddleware.js";
import { verificarRol } from "../middlewares/verificarRol.js";

const router = express.Router();

router.get("/", verificarToken, verificarRol(['administrador']), obtenerUsuarios);
router.post("/", verificarToken, verificarRol(['administrador']), crearUsuario);
router.get("/:id", verificarToken, verificarRol(['administrador']), obtenerUsuarioPorId);
router.put("/:id", verificarToken, verificarRol(['administrador']), actualizarUsuario);
router.delete("/:id", verificarToken, verificarRol(['administrador']), eliminarUsuario);

export default router;
