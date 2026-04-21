import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import {
  getMeProfile,
  updateMeProfile,
  changeMyPassword,
  updateMyAvatar,
} from "../controllers/usuarios.profile.controller.js";
import { upload } from "../middleware/upload.js";

const router = Router();

router.use(requireAuth());

router.get("/me", getMeProfile);
router.put("/me", updateMeProfile);
router.patch("/me/password", changeMyPassword);
router.post("/me/avatar", upload.single("avatar"), updateMyAvatar);

export default router;