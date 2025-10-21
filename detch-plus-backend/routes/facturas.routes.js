import { Router } from "express";
import * as facturasController from "../controllers/facturas.controller.js";

const router = Router();

router.get("/", facturasController.getAll);
router.get("/:id", facturasController.getOne);
router.post("/", facturasController.create);
router.put("/:id", facturasController.update);
router.delete("/:id", facturasController.remove);

export default router;
