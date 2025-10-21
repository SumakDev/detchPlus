import { Router } from "express";
import * as notifController from "../controllers/notif.controller.js";

const router = Router();

router.get("/", notifController.getAll);
router.get("/:id", notifController.getOne);
router.post("/", notifController.create);
router.put("/:id", notifController.update);
router.delete("/:id", notifController.remove);

export default router;
