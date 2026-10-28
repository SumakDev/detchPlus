import { PAR_PAG_APL, FACTURAS, EVA_PAR_PAG, CLIENTES, PRODUCTOS } from "../models/index.js";

export async function getAll(req, res) {
  try {
    const data = await PAR_PAG_APL.findAll({
      include: [
        { model: FACTURAS, as: "factura", include: [{ model: CLIENTES, as: "cliente" }] },
        {
          model: EVA_PAR_PAG,
          as: "evaluacion",
          include: [
            { model: CLIENTES, as: "cliente" },
            { model: PRODUCTOS, as: "producto" },
          ],
        },
      ],
      order: [["FEC_APL_PAR", "DESC"]],
    });
    return res.json(data);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}

export async function getOne(req, res) {
  try {
    const data = await PAR_PAG_APL.findByPk(req.params.id);
    return data ? res.json(data) : res.status(404).json({ error: "No encontrado" });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}

export async function create(req, res) {
  try {
    const created = await PAR_PAG_APL.create(req.body);
    return res.status(201).json(created);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}

export async function update(req, res) {
  try {
    const [updated] = await PAR_PAG_APL.update(req.body, { where: { ID_PAR_PAG: req.params.id } });
    if (!updated) return res.status(404).json({ error: "No encontrado" });
    const refreshed = await PAR_PAG_APL.findByPk(req.params.id);
    return res.json(refreshed);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}

export async function remove(req, res) {
  try {
    const deleted = await PAR_PAG_APL.destroy({ where: { ID_PAR_PAG: req.params.id } });
    return deleted ? res.json({ message: "Eliminado correctamente" }) : res.status(404).json({ error: "No encontrado" });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
