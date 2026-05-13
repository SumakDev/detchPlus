import cors from "cors";

// Puedes permitir uno o varios orígenes separados por coma en WEB_ORIGIN
// Ej: WEB_ORIGIN=http://localhost:3000,https://mi-dominio.com
const origins = (process.env.WEB_ORIGIN || "http://localhost:3000")
  .split(",")
  .map((s) => s.trim());

const corsMiddleware = cors({
  origin: process.env.WEB_ORIGIN || "http://localhost:3000",
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
  allowedHeaders: ["Content-Type", "Authorization"],
});

export default corsMiddleware;