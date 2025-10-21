import { DIR_USU } from "../models/index.js";

export async function getAll(req, res) {
  try {
    const data = await DIR_USU.findAll();
    return res.json(data);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}

export async function getOne(req, res) {
  try {
    const data = await DIR_USU.findByPk(req.params.id);
    return data ? res.json(data) : res.status(404).json({ error: "No encontrado" });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}

export async function create(req, res) {
  try {
    const created = await DIR_USU.create(req.body);
    return res.status(201).json(created);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}

export async function update(req, res) {
  try {
    const [updated] = await DIR_USU.update(req.body, { where: { ID_DIR_USU: req.params.id } });
    if (!updated) return res.status(404).json({ error: "No encontrado" });
    const refreshed = await DIR_USU.findByPk(req.params.id);
    return res.json(refreshed);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}

export async function remove(req, res) {
  try {
    const deleted = await DIR_USU.destroy({ where: { ID_DIR_USU: req.params.id } });
    return deleted ? res.json({ message: "Eliminado correctamente" }) : res.status(404).json({ error: "No encontrado" });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
