import express from "express";
import { verificarToken } from "../middlewares/authMiddleware.js";
import { verificarRol } from "../middlewares/verificarRol.js";
import {actualizarEstado, crearReposicion, eliminarReposicion, obtenerReposiciones} from '../controllers/reposicionesController.js'

const router = express.Router();

// GET todas
router.get("/", verificarToken, verificarRol(['Administrador', 'Encargado']), obtenerReposiciones);

// POST nueva
router.post("/", verificarToken, verificarRol(['Administrador', 'Encargado']), crearReposicion);

// PATCH actualizar estado
router.patch("/:id/estado", verificarToken, verificarRol(['Administrador', 'Encargado']), actualizarEstado);

// DELETE eliminar
router.delete("/:id", verificarToken, verificarRol(['Administrador']), eliminarReposicion);

export default router;
