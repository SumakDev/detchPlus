import { Router } from "express";
import * as proveedoresController from "../controllers/proveedores.controller.js";

const router = Router();

router.get("/", proveedoresController.getAll);
router.get("/:id", proveedoresController.getOne);
router.post("/", proveedoresController.create);
router.put("/:id", proveedoresController.update);
router.delete("/:id", proveedoresController.remove);

export default router;
