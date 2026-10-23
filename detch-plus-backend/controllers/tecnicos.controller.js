import { Op } from "sequelize";
import { TECNICOS } from "../models/index.js";

export async function getAll(req, res) {
  try {
    const { q, act } = req.query;
    const where = {};
    if (act === "true") {
      where.EST_TEC = true;
    } else if (act === "false") {
      where.EST_TEC = false;
    } else if (act === "all" || act === "") {
      // Si se solicita explícitamente "all" o "", no filtrar por estado
    } else {
      // Por defecto solo técnicos activos (no eliminados lógicamente)
      where.EST_TEC = true;
    }
    if (q) {
      where[Op.or] = [
        { NOM_TEC: { [Op.like]: `%${q}%` } },
        { TEL_TEC: { [Op.like]: `%${q}%` } },
        { ESP_TEC: { [Op.like]: `%${q}%` } },
      ];
    }
    const data = await TECNICOS.findAll({ where, order: [["NOM_TEC", "ASC"]] });
    return res.json(data);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}

export async function getOne(req, res) {
  try {
    const data = await TECNICOS.findByPk(req.params.id);
    return data ? res.json(data) : res.status(404).json({ error: "No encontrado" });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}

export async function create(req, res) {
  try {
    const created = await TECNICOS.create(req.body);
    return res.status(201).json(created);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}

export async function update(req, res) {
  try {
    const [updated] = await TECNICOS.update(req.body, { where: { ID_TEC: req.params.id } });
    if (!updated) return res.status(404).json({ error: "No encontrado" });
    const refreshed = await TECNICOS.findByPk(req.params.id);
    return res.json(refreshed);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}

export async function patchEstado(req, res) {
  try {
    const { id } = req.params;
    const { activo } = req.body || {};
    const row = await TECNICOS.findByPk(id);
    if (!row) return res.status(404).json({ error: "No encontrado" });
    await row.update({ EST_TEC: Boolean(activo) });
    return res.json({ message: "Estado actualizado", EST_TEC: row.EST_TEC });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}

export async function remove(req, res) {
  try {
    const row = await TECNICOS.findByPk(req.params.id);
    if (!row) return res.status(404).json({ error: "No encontrado" });
    // Eliminado lógico: se marca como inactivo (false) para que no figure en el sistema
    await row.update({ EST_TEC: false });
    return res.json({ message: "Técnico eliminado correctamente", ID_TEC: row.ID_TEC });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
