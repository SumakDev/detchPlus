import { Router } from "express";
import * as car_comController from "../controllers/car_com.controller.js";

const router = Router();

router.get("/", car_comController.getAll);
router.get("/:id", car_comController.getOne);
router.post("/", car_comController.create);
router.put("/:id", car_comController.update);
router.delete("/:id", car_comController.remove);

export default router;
