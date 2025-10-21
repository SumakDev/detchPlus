import { Router } from "express";
import * as det_relController from "../controllers/det_rel.controller.js";

const router = Router();

router.get("/", det_relController.getAll);
router.get("/:id", det_relController.getOne);
router.post("/", det_relController.create);
router.put("/:id", det_relController.update);
router.delete("/:id", det_relController.remove);

export default router;
