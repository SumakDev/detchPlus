import * as authService from "../services/auth.service.js";

function toUserResponse(row) {
  return {
    ID_USU: row.ID_USU,
    USUARIO: row.USR_USU,
    EMAIL: row.COR_USU,
    NOM_USU: row.NOM_USU,
    APE_USU: row.APE_USU,
    ID_ROL: row.ID_ROL,
    EST_USU: row.EST_USU,
    COR_VER_USU: !!row.COR_VER_USU,
    AVA_USU: row.AVA_USU || null,
    FEC_ULG_USU: row.FEC_ULG_USU || null,
  };
}

export async function register(req, res) {
  try {
    const { token, user } = await authService.register(req.body || {});
    return res.status(201).json({ token, user: toUserResponse(user) });
  } catch (error) {
    console.error("auth.register", error);
    return res.status(error.status || 500).json({ error: error.message || "Internal server error" });
  }
}

export async function login(req, res) {
  try {
    const ip = req.ip || req.headers["x-forwarded-for"] || req.socket.remoteAddress || null;
    const { token, user } = await authService.login(req.body || {}, ip);
    return res.json({ token, user: toUserResponse(user) });
  } catch (error) {
    console.error("auth.login", error);
    return res.status(error.status || 500).json({ error: error.message || "Internal server error" });
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