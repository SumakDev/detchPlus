import { EVA_PAR_PAG, CLIENTES, PRODUCTOS, EMPLEADOS, PAR_PAG_APL } from "../models/index.js";

export async function getAll(req, res) {
  try {
    const data = await EVA_PAR_PAG.findAll({
      include: [
        { model: CLIENTES, as: "cliente" },
        { model: PRODUCTOS, as: "producto" },
        { model: EMPLEADOS, as: "empleado" },
        { model: PAR_PAG_APL, as: "aplicaciones" },
      ],
      order: [["FEC_EVA_PAR", "DESC"]],
    });
    return res.json(data);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}

export async function getOne(req, res) {
  try {
    const data = await EVA_PAR_PAG.findByPk(req.params.id, {
      include: [
        { model: CLIENTES, as: "cliente" },
        { model: PRODUCTOS, as: "producto" },
        { model: EMPLEADOS, as: "empleado" },
        { model: PAR_PAG_APL, as: "aplicaciones" },
      ],
    });
    return data ? res.json(data) : res.status(404).json({ error: "No encontrado" });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}

export async function create(req, res) {
  try {
    const created = await EVA_PAR_PAG.create(req.body);
    return res.status(201).json(created);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}

export async function update(req, res) {
  try {
    const [updated] = await EVA_PAR_PAG.update(req.body, { where: { ID_EVA_PAR: req.params.id } });
    if (!updated) return res.status(404).json({ error: "No encontrado" });
    const refreshed = await EVA_PAR_PAG.findByPk(req.params.id);
    return res.json(refreshed);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}

export async function remove(req, res) {
  try {
    const deleted = await EVA_PAR_PAG.destroy({ where: { ID_EVA_PAR: req.params.id } });
    return deleted ? res.json({ message: "Eliminado correctamente" }) : res.status(404).json({ error: "No encontrado" });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
