import jwt from "jsonwebtoken";
import { USUARIOS, CLIENTES, DIR_USU } from "../models/index.js";

const JWT_SECRET = process.env.JWT_SECRET || "dev-secret";

// Autenticación: adjunta req.user con { ID_USU, ID_ROL, ... }
export function requireAuth() {
  return async (req, res, next) => {
    try {
      const auth = req.headers.authorization || "";
      const token = auth.startsWith("Bearer ") ? auth.slice(7) : null;
      if (!token) return res.status(401).json({ error: "No autenticado" });

      const payload = jwt.verify(token, JWT_SECRET);
      const user = await USUARIOS.findByPk(payload.sub, {
        attributes: [
          "ID_USU", "USR_USU", "COR_USU", "NOM_USU", "APE_USU",
          "ID_ROL", "EST_USU", "AVA_USU", "TEL_USU", "ID_PERSONA"
        ],
      });
      if (!user) return res.status(401).json({ error: "No autenticado" });
      if (user.EST_USU === "INACTIVO") return res.status(403).json({ error: "Usuario inactivo" });

      let cedula = user.ID_PERSONA || "";
      let telefono = user.TEL_USU || "";
      let direccion = "";
      let ciudad = "";
      let provincia = "";

      // Si no tiene cédula o teléfono en USUARIOS, buscar en CLIENTES
      try {
        const cli = await CLIENTES.findOne({ where: { COR_CLI: user.COR_USU } });
        if (cli) {
          if (!cedula) cedula = cli.CED_CLI || "";
          if (!telefono) telefono = cli.NUM_CLI || "";
          if (!direccion) direccion = cli.DIR_CLI || "";
        }
      } catch {}

      // Buscar última dirección en DIR_USU
      try {
        const dir = await DIR_USU.findOne({
          where: { ID_USU: user.ID_USU },
          order: [["ES_PRE_DIR_USU", "DESC"], ["ID_DIR_USU", "DESC"]],
        });
        if (dir) {
          if (!direccion) direccion = dir.DIR_LIN1_USU || "";
          ciudad = dir.CIU_USU || "";
          provincia = dir.PROV_USU || "";
          if (!telefono) telefono = dir.TEL_CON_USU || "";
        }
      } catch {}

      req.user = {
        ID_USU: user.ID_USU,
        ID_ROL: user.ID_ROL,
        USUARIO: user.USR_USU,
        EMAIL: user.COR_USU,
        COR_USU: user.COR_USU,
        NOM_USU: user.NOM_USU,
        APE_USU: user.APE_USU,
        AVA_USU: user.AVA_USU || null,
        USR_USU: user.USR_USU || "-",
        TEL_USU: telefono,
        CEDULA: cedula,
        ID_PERSONA: cedula,
        DIRECCION: direccion,
        CIUDAD: ciudad,
        PROVINCIA: provincia,
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