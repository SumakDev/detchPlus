import { Router } from "express";
import { getCategorias, getMarcas, getModelos } from "../controllers/catalogos.controller.js";

const router = Router();

router.get("/categorias", getCategorias);
router.get("/marcas", getMarcas);
router.get("/modelos", getModelos);

export default router;