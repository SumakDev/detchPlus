import { Router } from "express";
import * as det_conController from "../controllers/det_con.controller.js";

const router = Router();

router.get("/", det_conController.getAll);
router.get("/:id", det_conController.getOne);
router.post("/", det_conController.create);
router.put("/:id", det_conController.update);
router.delete("/:id", det_conController.remove);

export default router;
