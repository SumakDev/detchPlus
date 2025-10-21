import { Router } from "express";
import * as usuariosController from "../controllers/usuarios.controller.js";

const router = Router();

router.get("/", usuariosController.getAll);
router.get("/:id", usuariosController.getOne);
router.post("/", usuariosController.create);
router.put("/:id", usuariosController.update);
router.delete("/:id", usuariosController.remove);

export default router;
