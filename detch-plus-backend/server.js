import "dotenv/config";
import express from "express";
import path from "path";
import { fileURLToPath } from "url";

import corsMiddleware from "./middleware/cors.js";
import registerRoutes from "./routes/index.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Middlewares base
app.use(corsMiddleware);
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// Servir archivos subidos
app.use("/uploads", express.static(path.resolve(__dirname, "uploads")));

// Rutas de la API (tu routes/index.js ya define /api/auth, /api/productos, etc.)
registerRoutes(app);

// Salud
app.get("/", (_req, res) => res.json({ ok: true, name: "detch-plus-backend" }));

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`API escuchando en http://localhost:${PORT}`);
  console.log(`Uploads servidos en http://localhost:${PORT}/uploads`);
});