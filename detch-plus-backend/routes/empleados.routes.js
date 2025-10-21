import { Router } from "express";
import * as empleadosController from "../controllers/empleados.controller.js";

const router = Router();

router.get("/", empleadosController.getAll);
router.get("/:id", empleadosController.getOne);
router.post("/", empleadosController.create);
router.put("/:id", empleadosController.update);
router.delete("/:id", empleadosController.remove);

export default router;
