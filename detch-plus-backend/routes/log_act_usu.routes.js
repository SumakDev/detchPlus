import { Router } from "express";
import * as log_act_usuController from "../controllers/log_act_usu.controller.js";

const router = Router();

router.get("/", log_act_usuController.getAll);
router.get("/:id", log_act_usuController.getOne);
router.post("/", log_act_usuController.create);
router.put("/:id", log_act_usuController.update);
router.delete("/:id", log_act_usuController.remove);

export default router;
