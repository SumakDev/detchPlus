import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { randomBytes } from "crypto";
import { Op } from "sequelize";
import { USUARIOS, SES_USU } from "../models/index.js";

const JWT_SECRET = process.env.JWT_SECRET || "dev-secret";
const SESSION_TTL_SEC = Number(process.env.SESSION_TTL_SEC || 60 * 60 * 24 * 7); // 7 días por defecto

function now() {
  return new Date();
}
function addSeconds(d, sec) {
  return new Date(d.getTime() + sec * 1000);
}
function clientIp(req) {
  const xf = req.headers["x-forwarded-for"];
  if (typeof xf === "string" && xf.length) return xf.split(",")[0].trim();
  return req.ip || req.connection?.remoteAddress || undefined;
}

function sanitizeUser(u) {
  if (!u) return null;
  const p = u.get ? u.get({ plain: true }) : u;
  delete p.PAS_HAS_USU;
  delete p.TOK_RES_USU;
  delete p.TOK_VER_USU;
  return p;
}

// POST /api/auth/login
export async function login(req, res) {
  try {
    const { usuario, password } = req.body || {};
    if (!usuario || !password) {
      return res.status(400).json({ error: "Credenciales requeridas" });
    }

    // Permite login por USR_USU o COR_USU
    const user = await USUARIOS.findOne({
      where: {
        [Op.or]: [{ USR_USU: usuario }, { COR_USU: usuario }],
      },
    });
    if (!user) return res.status(401).json({ error: "Usuario o contraseña inválidos" });

    const ok = await bcrypt.compare(password, user.PAS_HAS_USU);
    if (!ok) return res.status(401).json({ error: "Usuario o contraseña inválidos" });

    // Políticas de estado
    if (user.EST_USU === "INACTIVO") return res.status(403).json({ error: "Usuario inactivo" });
    if (user.EST_USU === "BLOQUEADO") return res.status(403).json({ error: "Usuario bloqueado" });

    // Crear sesión (SES_USU)
    const sessionId = randomBytes(24).toString("hex"); // <= 128 chars
    const start = now();
    const exp = addSeconds(start, SESSION_TTL_SEC);

    await SES_USU.create({
      ID_SES_USU: sessionId,
      ID_USU: user.ID_USU,
      IP_SES_USU: clientIp(req),
      UA_SES_USU: req.get("user-agent") || null,
      FEC_INI_SES: start,
      FEC_ULG_SES: start,
      EXP_SES_USU: exp,
      ACT_SES_USU: true,
      DAT_SES_USU: null,
    });

    await user.update({
      FEC_ULG_USU: start,
      IP_ULG_USU: clientIp(req) || null,
      INT_FAL_USU: 0,
    });

    // Emitir JWT con jti = ID_SES_USU
    const payload = {
      sub: user.ID_USU,
      jti: sessionId,
      rol: user.ID_ROL,
      usr: user.USR_USU,
    };
    const token = jwt.sign(payload, JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN || `${SESSION_TTL_SEC}s`,
    });

    return res.json({
      token,
      session_id: sessionId,
      expires_at: exp.toISOString(),
      user: sanitizeUser(user),
    });
  } catch (e) {
    console.error("auth.login", e);
    return res.status(500).json({ error: "Internal server error" });
  }
}

// POST /api/auth/logout  (requiere auth)
export async function logout(req, res) {
  try {
    // Usamos jti del token; opcionalmente aceptamos session_id del body por seguridad
    const jti = req.user?.jti || req.body?.session_id;
    if (!jti) return res.status(400).json({ error: "session_id requerido" });

    const row = await SES_USU.findByPk(jti);
    if (!row) return res.json({ message: "OK" }); // idempotente

    await row.update({ ACT_SES_USU: false, EXP_SES_USU: now(), FEC_ULG_SES: now() });
    return res.json({ message: "Sesión cerrada" });
  } catch (e) {
    console.error("auth.logout", e);
    return res.status(500).json({ error: "Internal server error" });
  }
}

// GET /api/auth/me  (requiere auth)
export async function me(req, res) {
  try {
    const user = await USUARIOS.findByPk(req.user?.ID_USU || req.user?.sub, {
      attributes: ["ID_USU", "USR_USU", "COR_USU", "NOM_USU", "APE_USU", "ID_ROL", "EST_USU", "AVA_USU"],
    });
    if (!user) return res.status(401).json({ error: "No autenticado" });
    return res.json({ user: sanitizeUser(user) });
  } catch (e) {
    console.error("auth.me", e);
    return res.status(500).json({ error: "Internal server error" });
  }
}