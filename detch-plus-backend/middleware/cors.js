import cors from "cors";

// Puedes permitir uno o varios orígenes separados por coma en WEB_ORIGIN
// Ej: WEB_ORIGIN=http://localhost:3000,https://mi-dominio.com
const configuredOrigins = (process.env.WEB_ORIGIN || "http://localhost:3000,https://detchplus.plus,https://www.detchplus.plus")
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);

const defaultOrigins = [
  "http://localhost:3000",
  "https://detchplus.plus",
  "https://www.detchplus.plus",
];

const allAllowed = Array.from(new Set([...defaultOrigins, ...configuredOrigins]));

const corsMiddleware = cors({
  origin: (origin, callback) => {
    // Permitir peticiones sin origen (como apps móviles, curl o SSR)
    if (!origin) return callback(null, true);
    if (
      allAllowed.includes(origin) ||
      origin.endsWith(".detchplus.plus") ||
      origin.endsWith(".onrender.com")
    ) {
      return callback(null, true);
    }
    return callback(new Error(`CORS bloqueado para el origen: ${origin}`));
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
});

export default corsMiddleware;