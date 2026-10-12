import { Router } from "express";
import { getResumen, getDatos } from "../controllers/reportes.controller.js";
import { requireAuth, denyWebUser } from "../middleware/auth.js";

const router = Router();

router.get("/resumen", requireAuth(), denyWebUser(), getResumen);
router.get("/datos", requireAuth(), denyWebUser(), getDatos);

export default router;
