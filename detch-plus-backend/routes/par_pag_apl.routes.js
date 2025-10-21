import { Router } from "express";
import * as par_pag_aplController from "../controllers/par_pag_apl.controller.js";

const router = Router();

router.get("/", par_pag_aplController.getAll);
router.get("/:id", par_pag_aplController.getOne);
router.post("/", par_pag_aplController.create);
router.put("/:id", par_pag_aplController.update);
router.delete("/:id", par_pag_aplController.remove);

export default router;
