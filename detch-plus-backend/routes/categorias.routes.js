import { Router } from "express";
import * as categoriasController from "../controllers/categorias.controller.js";

const router = Router();

router.get("/", categoriasController.getAll);
router.get("/:id", categoriasController.getOne);
router.post("/", categoriasController.create);
router.put("/:id", categoriasController.update);
router.delete("/:id", categoriasController.remove);

export default router;
