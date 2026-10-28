import { NOTIF } from "../models/index.js";

export async function getAll(req, res) {
  try {
    const where = {};
    if (req.query.idUsu) where.ID_USU = Number(req.query.idUsu);

    const data = await NOTIF.findAll({
      where,
      order: [["FEC_CRE_NOTIF", "DESC"]],
      limit: 100,
    });
    return res.json(data);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}

export async function getOne(req, res) {
  try {
    const data = await NOTIF.findByPk(req.params.id);
    return data ? res.json(data) : res.status(404).json({ error: "No encontrado" });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}

export async function create(req, res) {
  try {
    const created = await NOTIF.create(req.body);
    return res.status(201).json(created);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}

export async function update(req, res) {
  try {
    const payload = { ...req.body };
    if (payload.LEI_NOTIF === true && !payload.FEC_LEI_NOTIF) {
      payload.FEC_LEI_NOTIF = new Date();
    }
    const [updated] = await NOTIF.update(payload, { where: { ID_NOTIF: req.params.id } });
    if (!updated) return res.status(404).json({ error: "No encontrado" });
    const refreshed = await NOTIF.findByPk(req.params.id);
    return res.json(refreshed);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}

export async function remove(req, res) {
  try {
    const deleted = await NOTIF.destroy({ where: { ID_NOTIF: req.params.id } });
    return deleted ? res.json({ message: "Eliminado correctamente" }) : res.status(404).json({ error: "No encontrado" });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
