import { Router } from "express";
import { requireAuth, denyWebUser } from "../middleware/auth.js";
import { getAll, getOne, create, update, updateEstado, remove } from "../controllers/proveedores.controller.js";

const router = Router();

// Protección: solo panel admin (bloquea rol 4)
router.use(requireAuth(), denyWebUser());

router.get("/", getAll);
router.get("/:id", getOne);
router.post("/", create);
router.put("/:id", update);
router.patch("/:id/estado", updateEstado);
router.delete("/:id", remove);

export default router;