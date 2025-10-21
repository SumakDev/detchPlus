import { Router } from "express";
import * as marcasController from "../controllers/marcas.controller.js";

const router = Router();

router.get("/", marcasController.getAll);
router.get("/:id", marcasController.getOne);
router.post("/", marcasController.create);
router.put("/:id", marcasController.update);
router.delete("/:id", marcasController.remove);

export default router;
