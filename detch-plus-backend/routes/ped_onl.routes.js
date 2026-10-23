import { Router } from "express";
import * as ped_onlController from "../controllers/ped_onl.controller.js";
import { optionalAuth } from "../middleware/auth.js";

const router = Router();

router.get("/", ped_onlController.getAll);
router.get("/:id", ped_onlController.getOne);
router.post("/", optionalAuth(), ped_onlController.create);
router.patch("/:id/estado", ped_onlController.patchEstado);
router.put("/:id", ped_onlController.update);
router.delete("/:id", ped_onlController.remove);

export default router;
