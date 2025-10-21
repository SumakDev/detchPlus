import { Router } from "express";
import * as ser_tecController from "../controllers/ser_tec.controller.js";

const router = Router();

router.get("/", ser_tecController.getAll);
router.get("/:id", ser_tecController.getOne);
router.post("/", ser_tecController.create);
router.put("/:id", ser_tecController.update);
router.delete("/:id", ser_tecController.remove);

export default router;
