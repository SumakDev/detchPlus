import { Router } from "express";
import * as modelosController from "../controllers/modelos.controller.js";

const router = Router();

router.get("/", modelosController.getAll);
router.get("/:id", modelosController.getOne);
router.post("/", modelosController.create);
router.put("/:id", modelosController.update);
router.delete("/:id", modelosController.remove);

export default router;
