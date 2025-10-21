import { Router } from "express";
import * as det_teleController from "../controllers/det_tele.controller.js";

const router = Router();

router.get("/", det_teleController.getAll);
router.get("/:id", det_teleController.getOne);
router.post("/", det_teleController.create);
router.put("/:id", det_teleController.update);
router.delete("/:id", det_teleController.remove);

export default router;
