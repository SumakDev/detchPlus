import express from "express";
import cors from "cors";
import morgan from "morgan";
import dotenv from "dotenv";
import sequelize from "./config/database.js";
import registerRoutes from "./routes/index.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;
const ORIGIN = process.env.CORS_ORIGIN || "http://localhost:3000";

app.use(cors({ origin: ORIGIN, credentials: true }));
app.use(express.json({ limit: "1mb" }));
app.use(morgan("dev"));

// Probar conexión a la DB (opcional en prod)
try {
  await sequelize.authenticate();
  console.log("✅ DB conectada");
} catch (err) {
  console.error("❌ Error conectando a DB:", err.message);
}

// Rutas API (asegúrate de tener routes/index.js exportando una función)
registerRoutes(app);

// Healthcheck
app.get("/health", (req, res) => res.json({ ok: true }));

app.listen(PORT, () => {
  console.log(`🚀 API escuchando en http://localhost:${PORT}`);
});