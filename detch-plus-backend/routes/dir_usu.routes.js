import { Router } from "express";
import * as dir_usuController from "../controllers/dir_usu.controller.js";

const router = Router();

router.get("/", dir_usuController.getAll);
router.get("/:id", dir_usuController.getOne);
router.post("/", dir_usuController.create);
router.put("/:id", dir_usuController.update);
router.delete("/:id", dir_usuController.remove);

export default router;
