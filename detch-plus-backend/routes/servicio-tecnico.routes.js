import { Router } from "express";
import { requireAuth, denyWebUser } from "../middleware/auth.js";
import { getAll, getOptions, create, update, updateStatus, trackPublicService } from "../controllers/servicioTecnico.controller.js";

const router = Router();

// Ruta pública de seguimiento de servicio técnico para clientes
router.get("/seguimiento/:query", trackPublicService);
router.get("/seguimiento", trackPublicService);

// Rutas de administración (requieren auth y bloquean rol web)
router.use(requireAuth(), denyWebUser());

router.get("/", getAll);
router.get("/options", getOptions);
router.post("/", create);
router.put("/:num", update);
router.patch("/:num/estado", updateStatus);

export default router;