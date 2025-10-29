import { Router } from "express";
import { requireAuth, denyWebUser } from "../middleware/auth.js";
import {
  getAll,
  getOne,
  create,
  update,
  remove,
  upsertByProducto,
} from "../controllers/det_tele.controller.js";

const router = Router();

// Protegido para panel (bloquea rol web)
router.use(requireAuth(), denyWebUser());

// CRUD tradicional
router.get("/", getAll);
router.get("/:id", getOne);
router.post("/", create);
router.put("/:id", update);
router.delete("/:id", remove);

// Upsert por producto (ruta directa dentro del módulo)
router.put("/producto/:id", upsertByProducto);

export default router;