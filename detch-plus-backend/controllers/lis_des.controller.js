import { LIS_DES, PRODUCTOS, PRECIOS, STOCK, MARCAS, MODELOS } from "../models/index.js";

export async function getAll(req, res) {
  try {
    const where = {};
    if (req.query.idUsu) where.ID_USU = Number(req.query.idUsu);

    const data = await LIS_DES.findAll({
      where,
      include: [
        {
          model: PRODUCTOS,
          as: "producto",
          include: [
            { model: PRECIOS, as: "precios" },
            { model: STOCK, as: "stock" },
            { model: MARCAS, as: "marca" },
            { model: MODELOS, as: "modelo" },
          ],
        },
      ],
      order: [["FEC_AGR_LIS_DES", "DESC"]],
    });
    return res.json(data);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}

export async function getOne(req, res) {
  try {
    const data = await LIS_DES.findByPk(req.params.id, {
      include: [{ model: PRODUCTOS, as: "producto" }],
    });
    return data ? res.json(data) : res.status(404).json({ error: "No encontrado" });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}

export async function create(req, res) {
  try {
    const { ID_USU, ID_PRO, toggle } = req.body;
    if (!ID_USU || !ID_PRO) {
      return res.status(400).json({ error: "ID_USU e ID_PRO son obligatorios" });
    }

    const existing = await LIS_DES.findOne({
      where: { ID_USU: Number(ID_USU), ID_PRO: Number(ID_PRO) },
    });

    if (existing) {
      if (toggle !== false) {
        await existing.destroy();
        return res.json({ removed: true, ID_PRO: Number(ID_PRO), message: "Eliminado de la lista de deseos" });
      }
      return res.json({ removed: false, item: existing });
    }

    const created = await LIS_DES.create({
      ID_USU: Number(ID_USU),
      ID_PRO: Number(ID_PRO),
      FEC_AGR_LIS_DES: new Date(),
    });
    return res.status(201).json({ removed: false, item: created, ...created.toJSON() });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}

export async function update(req, res) {
  try {
    const [updated] = await LIS_DES.update(req.body, { where: { ID_LIS_DES: req.params.id } });
    if (!updated) return res.status(404).json({ error: "No encontrado" });
    const refreshed = await LIS_DES.findByPk(req.params.id);
    return res.json(refreshed);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}

export async function remove(req, res) {
  try {
    const deleted = await LIS_DES.destroy({ where: { ID_LIS_DES: req.params.id } });
    return deleted ? res.json({ message: "Eliminado correctamente" }) : res.status(404).json({ error: "No encontrado" });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
