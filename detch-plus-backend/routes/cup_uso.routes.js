import { Router } from "express";
import * as cup_usoController from "../controllers/cup_uso.controller.js";

const router = Router();

router.get("/", cup_usoController.getAll);
router.get("/:id", cup_usoController.getOne);
router.post("/", cup_usoController.create);
router.put("/:id", cup_usoController.update);
router.delete("/:id", cup_usoController.remove);

export default router;
