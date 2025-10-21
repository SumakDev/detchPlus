import { Router } from "express";
import * as res_proController from "../controllers/res_pro.controller.js";

const router = Router();

router.get("/", res_proController.getAll);
router.get("/:id", res_proController.getOne);
router.post("/", res_proController.create);
router.put("/:id", res_proController.update);
router.delete("/:id", res_proController.remove);

export default router;
