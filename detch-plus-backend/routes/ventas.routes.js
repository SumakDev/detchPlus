import { Router } from "express";
import { getResumen, getAll, create } from "../controllers/ventas.controller.js";
import { requireAuth, denyWebUser } from "../middleware/auth.js";

const router = Router();

router.get("/resumen", requireAuth(), denyWebUser(), getResumen);
router.get("/", requireAuth(), denyWebUser(), getAll);
router.post("/", requireAuth(), denyWebUser(), create);

export default router;
