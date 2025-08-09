import { Router } from "express";
import { obtenerResumenDashboard } from "../controllers/dashboardController.js";
import { verificarToken } from "../middlewares/authMiddleware.js";

const router = Router();

router.get("/resumen", verificarToken, obtenerResumenDashboard);

export default router;
