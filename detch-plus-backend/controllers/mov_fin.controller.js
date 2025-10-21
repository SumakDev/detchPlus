import { MOV_FIN } from "../models/index.js";

export async function getAll(req, res) {
  try {
    const data = await MOV_FIN.findAll();
    return res.json(data);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}

export async function getOne(req, res) {
  try {
    const data = await MOV_FIN.findByPk(req.params.id);
    return data ? res.json(data) : res.status(404).json({ error: "No encontrado" });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}

export async function create(req, res) {
  try {
    const created = await MOV_FIN.create(req.body);
    return res.status(201).json(created);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}

export async function update(req, res) {
  try {
    const [updated] = await MOV_FIN.update(req.body, { where: { ID_MOV_FIN: req.params.id } });
    if (!updated) return res.status(404).json({ error: "No encontrado" });
    const refreshed = await MOV_FIN.findByPk(req.params.id);
    return res.json(refreshed);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}

export async function remove(req, res) {
  try {
    const deleted = await MOV_FIN.destroy({ where: { ID_MOV_FIN: req.params.id } });
    return deleted ? res.json({ message: "Eliminado correctamente" }) : res.status(404).json({ error: "No encontrado" });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
