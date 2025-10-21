import { Router } from "express";
import * as det_serController from "../controllers/det_ser.controller.js";

const router = Router();

router.get("/", det_serController.getAll);
router.get("/:id", det_serController.getOne);
router.post("/", det_serController.create);
router.put("/:id", det_serController.update);
router.delete("/:id", det_serController.remove);

export default router;
