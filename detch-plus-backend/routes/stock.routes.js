import { Router } from "express";
import * as stockController from "../controllers/stock.controller.js";

const router = Router();

router.get("/", stockController.getAll);
router.get("/:id", stockController.getOne);
router.post("/", stockController.create);
router.put("/:id", stockController.update);
router.delete("/:id", stockController.remove);

export default router;
