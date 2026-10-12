import { Router } from "express";
import * as tecnicosController from "../controllers/tecnicos.controller.js";

const router = Router();

router.get("/", tecnicosController.getAll);
router.get("/:id", tecnicosController.getOne);
router.post("/", tecnicosController.create);
router.put("/:id", tecnicosController.update);
router.patch("/:id/estado", tecnicosController.patchEstado);
router.delete("/:id", tecnicosController.remove);

export default router;
