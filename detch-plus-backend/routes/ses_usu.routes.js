import { Router } from "express";
import {
  getAll,
  getOne,
  getMine,
  create,
  heartbeat,
  closeOne,
  closeOthersMine,
  closeAllForUser,
  remove,
} from "../controllers/ses_usu.controller.js";
import { requireAuth, requireRoles, denyWebUser } from "../middleware/auth.js";

const router = Router();

// Todas requieren sesión
router.use(requireAuth());

// Admin: listar/gestionar sesiones de cualquiera
router.get("/", requireRoles([1, 2]), getAll);
router.get("/:id", requireRoles([1, 2]), getOne);
router.post("/", requireRoles([1, 2]), create);
router.delete("/:id", requireRoles([1, 2]), remove);
router.post("/usuario/:userId/cerrar-todas", requireRoles([1, 2]), closeAllForUser);

// Usuario: gestionar sus propias sesiones
router.get("/me/list", getMine);
router.patch("/:id/heartbeat", heartbeat);
router.patch("/:id/cerrar", closeOne);
router.post("/cerrar-otras", closeOthersMine);

export default router;