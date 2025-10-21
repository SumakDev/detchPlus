import { Router } from "express";
import * as mov_invController from "../controllers/mov_inv.controller.js";

const router = Router();

router.get("/", mov_invController.getAll);
router.get("/:id", mov_invController.getOne);
router.post("/", mov_invController.create);
router.put("/:id", mov_invController.update);
router.delete("/:id", mov_invController.remove);

export default router;
