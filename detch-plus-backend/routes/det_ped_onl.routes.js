import { Router } from "express";
import * as det_ped_onlController from "../controllers/det_ped_onl.controller.js";

const router = Router();

router.get("/", det_ped_onlController.getAll);
router.get("/:id", det_ped_onlController.getOne);
router.post("/", det_ped_onlController.create);
router.put("/:id", det_ped_onlController.update);
router.delete("/:id", det_ped_onlController.remove);

export default router;
