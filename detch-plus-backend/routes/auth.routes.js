import { Router } from "express";
import { login, register, me, forgotPassword, resetPassword, verifyEmail } from "../controllers/auth.controller.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();

router.post("/login", login);
router.post("/register", register);
router.get("/me", requireAuth(), me);

// Recuperación de contraseña
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);

// Verificación de email
router.get("/verify-email", verifyEmail);
router.post("/verify-email", verifyEmail);

export default router;