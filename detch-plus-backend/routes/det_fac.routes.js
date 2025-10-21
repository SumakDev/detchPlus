import { Router } from "express";
import * as det_facController from "../controllers/det_fac.controller.js";

const router = Router();

router.get("/", det_facController.getAll);
router.get("/:id", det_facController.getOne);
router.post("/", det_facController.create);
router.put("/:id", det_facController.update);
router.delete("/:id", det_facController.remove);

export default router;
