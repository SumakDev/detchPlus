import { Router } from "express";
import * as obsController from "../controllers/obs.controller.js";

const router = Router();

router.get("/", obsController.getAll);
router.get("/:id", obsController.getOne);
router.post("/", obsController.create);
router.put("/:id", obsController.update);
router.delete("/:id", obsController.remove);

export default router;
