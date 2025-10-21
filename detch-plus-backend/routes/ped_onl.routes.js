import { Router } from "express";
import * as ped_onlController from "../controllers/ped_onl.controller.js";

const router = Router();

router.get("/", ped_onlController.getAll);
router.get("/:id", ped_onlController.getOne);
router.post("/", ped_onlController.create);
router.put("/:id", ped_onlController.update);
router.delete("/:id", ped_onlController.remove);

export default router;
