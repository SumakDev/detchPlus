import { Router } from "express";
import * as cuponesController from "../controllers/cupones.controller.js";

const router = Router();

router.get("/", cuponesController.getAll);
router.post("/validar", cuponesController.validar);
router.get("/:id", cuponesController.getOne);
router.post("/", cuponesController.create);
router.put("/:id", cuponesController.update);
router.delete("/:id", cuponesController.remove);

export default router;
