import { Op } from "sequelize";
import { randomBytes } from "crypto";
import { SES_USU, USUARIOS } from "../models/index.js";

// Helpers
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

// GET /api/sesiones?q=&user=&act=&exp=
export async function getAll(req, res) {
  try {
    const { q, user, act, exp } = req.query;

    const where = {};
    if (user && !Number.isNaN(Number(user))) where.ID_USU = Number(user);
    if (act === "true") where.ACT_SES_USU = true;
    if (act === "false") where.ACT_SES_USU = false;

    if (exp === "true") where.EXP_SES_USU = { [Op.lte]: now() };
    if (exp === "false") where.EXP_SES_USU = { [Op.gt]: now() };

    if (q) {
      const like = `%${q}%`;
      where[Op.or] = [
        { ID_SES_USU: { [Op.like]: like } },
        { IP_SES_USU: { [Op.like]: like } },
        { UA_SES_USU: { [Op.like]: like } },
      ];
    }

    const rows = await SES_USU.findAll({
      where,
      include: [{ model: USUARIOS, as: "usuario", attributes: ["ID_USU", "USR_USU", "NOM_USU", "APE_USU", "ID_ROL"] }],
      order: [["FEC_ULG_SES", "DESC"]],
    });
    return res.json(rows.map((r) => r.get({ plain: true })));
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}

// GET /api/sesiones/:id
export async function getOne(req, res) {
  try {
    const row = await SES_USU.findByPk(req.params.id, {
      include: [{ model: USUARIOS, as: "usuario", attributes: ["ID_USU", "USR_USU", "NOM_USU", "APE_USU", "ID_ROL"] }],
    });
    return row ? res.json(row.get({ plain: true })) : res.status(404).json({ error: "No encontrado" });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}

// GET /api/sesiones/me  (sesiones del usuario autenticado)
export async function getMine(req, res) {
  try {
    const uid = req.user?.ID_USU;
    if (!uid) return res.status(401).json({ error: "No autenticado" });

    const rows = await SES_USU.findAll({
      where: { ID_USU: uid },
      order: [["FEC_ULG_SES", "DESC"]],
    });
    return res.json(rows.map((r) => r.get({ plain: true })));
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}

// POST /api/sesiones
// Crea una sesión activa con expiración (por defecto, 7 días)
export async function create(req, res) {
  try {
    const { ID_USU, ttlSec, DAT_SES_USU } = req.body || {};
    if (!ID_USU) return res.status(400).json({ error: "ID_USU es obligatorio" });

    const user = await USUARIOS.findByPk(ID_USU);
    if (!user) return res.status(400).json({ error: "Usuario no existe" });

    const id = randomBytes(24).toString("hex"); // 48 chars (<= 128)
    const start = now();
    const ttl = Number.isFinite(Number(ttlSec)) ? Number(ttlSec) : Number(process.env.SESSION_TTL_SEC || 604800); // 7d
    const exp = addSeconds(start, ttl);

    const created = await SES_USU.create({
      ID_SES_USU: id,
      ID_USU: Number(ID_USU),
      IP_SES_USU: clientIp(req),
      UA_SES_USU: req.get("user-agent") || null,
      FEC_INI_SES: start,
      FEC_ULG_SES: start,
      EXP_SES_USU: exp,
      ACT_SES_USU: true,
      DAT_SES_USU: DAT_SES_USU || null,
    });

    return res.status(201).json(created.get({ plain: true }));
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}

// PATCH /api/sesiones/:id/heartbeat  { extendSec?: number }
export async function heartbeat(req, res) {
  try {
    const { id } = req.params;
    const { extendSec } = req.body || {};

    const row = await SES_USU.findByPk(id);
    if (!row) return res.status(404).json({ error: "No encontrado" });
    if (!row.ACT_SES_USU) return res.status(400).json({ error: "Sesión inactiva" });

    const updates = { FEC_ULG_SES: now() };
    if (extendSec && Number.isFinite(Number(extendSec)) && Number(extendSec) > 0) {
      const curExp = new Date(row.EXP_SES_USU);
      updates.EXP_SES_USU = addSeconds(curExp, Number(extendSec));
    }

    await row.update(updates);
    return res.json(row.get({ plain: true }));
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}

// PATCH /api/sesiones/:id/cerrar
export async function closeOne(req, res) {
  try {
    const { id } = req.params;
    const row = await SES_USU.findByPk(id);
    if (!row) return res.status(404).json({ error: "No encontrado" });

    await row.update({ ACT_SES_USU: false, EXP_SES_USU: now(), FEC_ULG_SES: now() });
    return res.json({ message: "Sesión cerrada", ID_SES_USU: id });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}

// POST /api/sesiones/cerrar-otras  { keepId: string }  (para el usuario actual)
export async function closeOthersMine(req, res) {
  try {
    const uid = req.user?.ID_USU;
    if (!uid) return res.status(401).json({ error: "No autenticado" });
    const { keepId } = req.body || {};

    const where = keepId ? { ID_USU: uid, ID_SES_USU: { [Op.ne]: keepId } } : { ID_USU: uid };
    const [count] = await SES_USU.update(
      { ACT_SES_USU: false, EXP_SES_USU: now(), FEC_ULG_SES: now() },
      { where }
    );
    return res.json({ message: "Sesiones cerradas", count });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}

// POST /api/sesiones/usuario/:userId/cerrar-todas (admin)
export async function closeAllForUser(req, res) {
  try {
    const { userId } = req.params;
    const [count] = await SES_USU.update(
      { ACT_SES_USU: false, EXP_SES_USU: now(), FEC_ULG_SES: now() },
      { where: { ID_USU: Number(userId) } }
    );
    return res.json({ message: "Sesiones cerradas", count });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}

// DELETE /api/sesiones/:id (admin) - eliminación física (opcional)
export async function remove(req, res) {
  try {
    const deleted = await SES_USU.destroy({ where: { ID_SES_USU: req.params.id } });
    return deleted ? res.json({ message: "Eliminado correctamente" }) : res.status(404).json({ error: "No encontrado" });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}