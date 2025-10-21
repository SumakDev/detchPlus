import { Router } from "express";
import * as ses_usuController from "../controllers/ses_usu.controller.js";

const router = Router();

router.get("/", ses_usuController.getAll);
router.get("/:id", ses_usuController.getOne);
router.post("/", ses_usuController.create);
router.put("/:id", ses_usuController.update);
router.delete("/:id", ses_usuController.remove);

export default router;
