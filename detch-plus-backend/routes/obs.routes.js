import { Router } from "express";
import { requireAuth, denyWebUser } from "../middleware/auth.js";
import * as obsController from "../controllers/obs.controller.js";

const router = Router();

// Solo panel (bloquear rol web)
router.use(requireAuth(), denyWebUser());

router.get("/", obsController.getAll);
router.get("/:id", obsController.getOne);

// Por cliente
router.get("/cliente/:ced", obsController.getByCliente);
router.post("/cliente/:ced", obsController.createForCliente);

// CRUD base
router.post("/", obsController.create);
router.put("/:id", obsController.update);
router.delete("/:id", obsController.remove);

export default router;