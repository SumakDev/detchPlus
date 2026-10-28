import { SES_USU, USUARIOS } from "../models/index.js";

export async function getAll(req, res) {
  try {
    const data = await SES_USU.findAll({
      include: [
        {
          model: USUARIOS,
          as: "usuario",
          attributes: ["ID_USU", "USR_USU", "NOM_USU", "APE_USU", "COR_USU", "ID_ROL"],
        },
      ],
      order: [["FEC_INI_SES", "DESC"]],
      limit: 200,
    });
    return res.json(data);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}

export async function getOne(req, res) {
  try {
    const data = await SES_USU.findByPk(req.params.id);
    return data ? res.json(data) : res.status(404).json({ error: "No encontrado" });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}

export async function create(req, res) {
  try {
    const created = await SES_USU.create(req.body);
    return res.status(201).json(created);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}

export async function update(req, res) {
  try {
    const [updated] = await SES_USU.update(req.body, { where: { ID_SES_USU: req.params.id } });
    if (!updated) return res.status(404).json({ error: "No encontrado" });
    const refreshed = await SES_USU.findByPk(req.params.id);
    return res.json(refreshed);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}

export async function remove(req, res) {
  try {
    const deleted = await SES_USU.destroy({ where: { ID_SES_USU: req.params.id } });
    return deleted ? res.json({ message: "Eliminado correctamente" }) : res.status(404).json({ error: "No encontrado" });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
