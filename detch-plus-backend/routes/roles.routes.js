import { Router } from "express";
import * as rolesController from "../controllers/roles.controller.js";

const router = Router();

router.get("/", rolesController.getAll);
router.get("/:id", rolesController.getOne);
router.post("/", rolesController.create);
router.put("/:id", rolesController.update);
router.delete("/:id", rolesController.remove);

export default router;
