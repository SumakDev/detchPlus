import { Router } from "express";
import { requireAuth, denyWebUser } from "../middleware/auth.js";
import { getAll, getOptions, create, update, updateStatus } from "../controllers/servicioTecnico.controller.js";

const router = Router();

// Todas las rutas del panel admin deben requerir auth y bloquear rol 4
router.use(requireAuth(), denyWebUser());

router.get("/", getAll);
router.get("/options", getOptions);
router.post("/", create);
router.put("/:num", update);
router.patch("/:num/estado", updateStatus);

export default router;