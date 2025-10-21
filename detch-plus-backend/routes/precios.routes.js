import { Router } from "express";
import * as preciosController from "../controllers/precios.controller.js";

const router = Router();

router.get("/", preciosController.getAll);
router.get("/:id", preciosController.getOne);
router.post("/", preciosController.create);
router.put("/:id", preciosController.update);
router.delete("/:id", preciosController.remove);

export default router;
