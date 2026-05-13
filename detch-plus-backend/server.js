import "dotenv/config";
import express from "express";
import path from "path";
import { fileURLToPath } from "url";

import corsMiddleware from "./middleware/cors.js";
import registerRoutes from "./routes/index.js";
import { testConnection } from "./config/database.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Middlewares base
app.use(corsMiddleware);
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// Servir archivos subidos
app.use("/uploads", express.static(path.resolve(__dirname, "uploads")));

// Rutas de la API
registerRoutes(app);

// Salud
app.get("/", (_req, res) => res.json({ ok: true, name: "detch-plus-backend" }));

const PORT = process.env.PORT || 4000;
const HOST = "0.0.0.0"; // ✅ IMPORTANTE: Escucha en todas las interfaces

// Iniciar con verificación de BD
(async () => {
  await testConnection();
  
  app.listen(PORT, HOST, () => {
    console.log(`✓ API escuchando en http://0.0.0.0:${PORT}`);
    console.log(`✓ Uploads servidos en http://0.0.0.0:${PORT}/uploads`);
    console.log(`✓ Variables de BD cargadas desde .env`);
  });
})();