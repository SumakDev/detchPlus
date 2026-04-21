import jwt from "jsonwebtoken";
import { USUARIOS, SES_USU } from "../models/index.js";

const JWT_SECRET = process.env.JWT_SECRET || "dev-secret";
const SESSION_ROLLING_SEC = Number(process.env.SESSION_ROLLING_SEC || 0);

// Autenticación: adjunta req.user con { ID_USU, ID_ROL, ..., jti }
// y valida la sesión (SES_USU) si existe jti
export function requireAuth() {
  return async (req, res, next) => {
    try {
      const auth = req.headers.authorization || "";
      const token = auth.startsWith("Bearer ") ? auth.slice(7) : null;
      if (!token) return res.status(401).json({ error: "No autenticado" });

      const payload = jwt.verify(token, JWT_SECRET); // { sub, jti, rol, usr, iat, exp }

      const user = await USUARIOS.findByPk(payload.sub, {
        attributes: ["ID_USU", "USR_USU", "COR_USU", "NOM_USU", "APE_USU", "ID_ROL", "EST_USU", "AVA_USU"],
      });
      if (!user) return res.status(401).json({ error: "No autenticado" });
      if (user.EST_USU === "INACTIVO") return res.status(403).json({ error: "Usuario inactivo" });

      // Validación de sesión por jti (si está presente)
      if (payload.jti) {
        const ses = await SES_USU.findByPk(payload.jti);
        if (!ses || !ses.ACT_SES_USU) {
          return res.status(401).json({ error: "Sesión cerrada o inválida" });
        }
        if (new Date(ses.EXP_SES_USU).getTime() <= Date.now()) {
          // marca inactiva si expiró
          await ses.update({ ACT_SES_USU: false });
          return res.status(401).json({ error: "Sesión expirada" });
        }
        // Heartbeat + rolling (opcional)
        const patch = { FEC_ULG_SES: new Date() };
        if (SESSION_ROLLING_SEC > 0) {
          patch.EXP_SES_USU = new Date(new Date(ses.EXP_SES_USU).getTime() + SESSION_ROLLING_SEC * 1000);
        }
        await ses.update(patch);
      }

      req.user = {
        ID_USU: user.ID_USU,
        ID_ROL: user.ID_ROL,
        USUARIO: user.USR_USU,
        EMAIL: user.COR_USU,
        NOM_USU: user.NOM_USU,
        APE_USU: user.APE_USU,
        AVA_USU: user.AVA_USU || null,
        jti: payload.jti || null,
      };
      next();
    } catch (e) {
      return res.status(401).json({ error: "Token inválido" });
    }
  };
}

// Autorización: permite solo ciertos roles (lista de IDs)
export function requireRoles(rolesPermitidos = []) {
  return (req, res, next) => {
    const rol = req.user?.ID_ROL;
    if (!rol) return res.status(401).json({ error: "No autenticado" });
    if (!rolesPermitidos.includes(rol)) return res.status(403).json({ error: "No autorizado" });
    next();
  };
}

// Atajo: bloquear rol web (ID_ROL = 4)
export function denyWebUser() {
  return (req, res, next) => {
    if (req.user?.ID_ROL === 4) return res.status(403).json({ error: "No autorizado" });
    next();
  };
}