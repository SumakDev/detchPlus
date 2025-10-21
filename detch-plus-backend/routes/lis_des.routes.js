import { Router } from "express";
import * as lis_desController from "../controllers/lis_des.controller.js";

const router = Router();

router.get("/", lis_desController.getAll);
router.get("/:id", lis_desController.getOne);
router.post("/", lis_desController.create);
router.put("/:id", lis_desController.update);
router.delete("/:id", lis_desController.remove);

export default router;
