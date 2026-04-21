import { Router } from "express";
import { requireAuth, denyWebUser } from "../middleware/auth.js";
import {
  getAll,
  getOne,
  getByProducto,
  create,
  update,
  upsertPorTipo,
  remove,
} from "../controllers/precios.controller.js";

const router = Router();

// Protegido: panel admin (bloquea rol 4)
router.use(requireAuth(), denyWebUser());

router.get("/", getAll);
router.get("/:id", getOne);

// Operaciones por producto
router.get("/producto/:id", getByProducto);
router.put("/producto/:id/tipo/:tipo", upsertPorTipo); // upsert por tipo

// CRUD base
router.post("/", create);
router.put("/:id", update);
router.delete("/:id", remove);

export default router;