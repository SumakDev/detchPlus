import { Op } from "sequelize";
import { OBS } from "../models/index.js";

// Helper para identificar empleado que registra
function resolveCedEmp(req) {
  // Prioridad: CED_EMP del user => USUARIO (username) => "admin"
  return (req.user && (req.user.CED_EMP || req.user.USUARIO)) || "admin";
}

// GET /api/obs
// Opcional: ?tip=CLIENTE&ced_cli=...&q=...
export async function getAll(req, res) {
  try {
    const { tip, ced_cli, q } = req.query || {};
    const where = {};
    if (tip) where.TIP_OBS = tip;
    if (ced_cli) where.CED_CLI = ced_cli;
    if (q) {
      const like = `%${q}%`;
      where[Op.or] = [{ DES_OBS: { [Op.like]: like } }, { NUM_REF_OBS: { [Op.like]: like } }];
    }
    const data = await OBS.findAll({
      where,
      order: [["FEC_OBS", "DESC"], ["ID_OBS", "DESC"]],
    });
    return res.json(data);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}

// GET /api/obs/:id
export async function getOne(req, res) {
  try {
    const data = await OBS.findByPk(req.params.id);
    return data ? res.json(data) : res.status(404).json({ error: "No encontrado" });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}

// GET /api/obs/cliente/:ced
export async function getByCliente(req, res) {
  try {
    const { ced } = req.params;
    const data = await OBS.findAll({
      where: { TIP_OBS: "CLIENTE", CED_CLI: ced },
      order: [["FEC_OBS", "DESC"], ["ID_OBS", "DESC"]],
    });
    return res.json(data);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}

// POST /api/obs
export async function create(req, res) {
  try {
    const body = req.body || {};
    if (!body.TIP_OBS) return res.status(400).json({ error: "TIP_OBS es obligatorio" });
    if (!body.DES_OBS || !String(body.DES_OBS).trim()) {
      return res.status(400).json({ error: "DES_OBS es obligatorio" });
    }
    const created = await OBS.create({
      TIP_OBS: body.TIP_OBS,
      DES_OBS: String(body.DES_OBS).trim(),
      FEC_OBS: new Date(),
      CED_CLI: body.CED_CLI || null,
      CED_EMP: resolveCedEmp(req),
      NUM_REF_OBS: body.NUM_REF_OBS || null,
    });
    return res.status(201).json(created);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}

// POST /api/obs/cliente/:ced
// Fuerza TIP_OBS=CLIENTE y CED_CLI=:ced
export async function createForCliente(req, res) {
  try {
    const { ced } = req.params;
    const { DES_OBS, NUM_REF_OBS } = req.body || {};
    if (!DES_OBS || !String(DES_OBS).trim()) {
      return res.status(400).json({ error: "DES_OBS es obligatorio" });
    }
    const created = await OBS.create({
      TIP_OBS: "CLIENTE",
      DES_OBS: String(DES_OBS).trim(),
      FEC_OBS: new Date(),
      CED_CLI: ced,
      CED_EMP: resolveCedEmp(req),
      NUM_REF_OBS: NUM_REF_OBS || null,
    });
    return res.status(201).json(created);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}

// PUT /api/obs/:id
export async function update(req, res) {
  try {
    const id = req.params.id;
    const current = await OBS.findByPk(id);
    if (!current) return res.status(404).json({ error: "No encontrado" });

    // solo permitimos editar DES_OBS y NUM_REF_OBS
    const patch = {};
    if (req.body.DES_OBS !== undefined) {
      if (!String(req.body.DES_OBS).trim()) {
        return res.status(400).json({ error: "DES_OBS no puede estar vacío" });
      }
      patch.DES_OBS = String(req.body.DES_OBS).trim();
    }
    if (req.body.NUM_REF_OBS !== undefined) {
      patch.NUM_REF_OBS = req.body.NUM_REF_OBS || null;
    }

    await current.update(patch);
    const refreshed = await OBS.findByPk(id);
    return res.json(refreshed);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}

// DELETE /api/obs/:id
export async function remove(req, res) {
  try {
    const deleted = await OBS.destroy({ where: { ID_OBS: req.params.id } });
    return deleted ? res.json({ message: "Eliminado correctamente" }) : res.status(404).json({ error: "No encontrado" });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}