import fs from "fs";
import path from "path";
import multer from "multer";

const uploadsDir = path.resolve(process.cwd(), "uploads");
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadsDir);
  },
  filename: function (req, file, cb) {
    const safe = (file.originalname || "file").replace(/[^\w.\-]+/g, "_");
    const name = `${Date.now()}-${Math.round(Math.random() * 1e5)}-${safe}`;
    cb(null, name);
  },
});

export const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    // imágenes comunes
    const ok = /image\/(png|jpe?g|gif|webp)/i.test(file.mimetype);
    if (!ok) return cb(new Error("Tipo de archivo no permitido"));
    cb(null, true);
  },
});