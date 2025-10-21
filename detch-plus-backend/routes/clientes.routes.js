import { Router } from "express";
import * as clientesController from "../controllers/clientes.controller.js";

const router = Router();

router.get("/", clientesController.getAll);
router.get("/:id", clientesController.getOne);
router.post("/", clientesController.create);
router.put("/:id", clientesController.update);
router.delete("/:id", clientesController.remove);

export default router;
