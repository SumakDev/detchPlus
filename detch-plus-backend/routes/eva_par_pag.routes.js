import { Router } from "express";
import * as eva_par_pagController from "../controllers/eva_par_pag.controller.js";

const router = Router();

router.get("/", eva_par_pagController.getAll);
router.get("/:id", eva_par_pagController.getOne);
router.post("/", eva_par_pagController.create);
router.put("/:id", eva_par_pagController.update);
router.delete("/:id", eva_par_pagController.remove);

export default router;
