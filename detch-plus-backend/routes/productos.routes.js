import { Router } from "express";
import multer from "multer";
import path from "path";
import { fileURLToPath } from "url";
import { create, getAll, update, remove } from "../controllers/productos.controller.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadsDir = path.resolve(__dirname, "..", "uploads");

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadsDir),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname || "");
    const base = path.basename(file.originalname || "img", ext).replace(/\W+/g, "-").slice(0, 40);
    cb(null, `${Date.now()}-${Math.round(Math.random() * 1e6)}-${base}${ext}`);
  },
});
const fileFilter = (_req, file, cb) => {
  if (!file.mimetype.startsWith("image/")) return cb(new Error("Solo se permiten imágenes"));
  cb(null, true);
};
const upload = multer({ storage, fileFilter, limits: { fileSize: 5 * 1024 * 1024 } });

const router = Router();

router.get("/", getAll);
router.post("/", upload.single("image"), create);
router.put("/:id", upload.single("image"), update);
router.delete("/:id", remove);

export default router;