import cors from "cors";

// Puedes permitir uno o varios orígenes separados por coma en WEB_ORIGIN
// Ej: WEB_ORIGIN=http://localhost:3000,https://mi-dominio.com
const origins = (process.env.WEB_ORIGIN || "http://localhost:3000")
  .split(",")
  .map((s) => s.trim());

const corsMiddleware = cors({
  origin: origins,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"], // importante para tokens
  credentials: false, // pon true solo si vas a usar cookies con credenciales
});

export default corsMiddleware;