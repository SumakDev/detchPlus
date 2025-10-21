import { Router } from "express";
import * as productosController from "../controllers/productos.controller.js";

const router = Router();

router.get("/", productosController.getAll);
router.get("/:id", productosController.getOne);
router.post("/", productosController.create);
router.put("/:id", productosController.update);
router.delete("/:id", productosController.remove);

export default router;
