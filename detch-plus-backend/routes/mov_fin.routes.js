import { Router } from "express";
import * as mov_finController from "../controllers/mov_fin.controller.js";

const router = Router();

router.get("/", mov_finController.getAll);
router.get("/:id", mov_finController.getOne);
router.post("/", mov_finController.create);
router.put("/:id", mov_finController.update);
router.delete("/:id", mov_finController.remove);

export default router;
