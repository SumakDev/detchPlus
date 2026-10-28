import { CAR_COM, PRODUCTOS } from "../models/index.js";

export async function getAll(req, res) {
  try {
    const where = {};
    if (req.query.idUsu) where.ID_USU = Number(req.query.idUsu);

    const data = await CAR_COM.findAll({
      where,
      include: [{ model: PRODUCTOS, as: "producto" }],
      order: [["FEC_ACT_CAR", "DESC"]],
    });
    return res.json(data);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}

export async function getOne(req, res) {
  try {
    const data = await CAR_COM.findByPk(req.params.id, {
      include: [{ model: PRODUCTOS, as: "producto" }],
    });
    return data ? res.json(data) : res.status(404).json({ error: "No encontrado" });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}

export async function create(req, res) {
  try {
    const { ID_USU, ID_PRO, CAN_CAR_COM = 1, PRE_UNI_CAR } = req.body;
    if (!ID_USU || !ID_PRO) {
      return res.status(400).json({ error: "ID_USU e ID_PRO son obligatorios" });
    }

    const existing = await CAR_COM.findOne({
      where: { ID_USU: Number(ID_USU), ID_PRO: Number(ID_PRO) },
    });

    if (existing) {
      if (Number(CAN_CAR_COM) <= 0) {
        await existing.destroy();
        return res.json({ deleted: true });
      }
      await existing.update({
        CAN_CAR_COM: Number(CAN_CAR_COM),
        PRE_UNI_CAR: PRE_UNI_CAR !== undefined ? PRE_UNI_CAR : existing.PRE_UNI_CAR,
        FEC_ACT_CAR: new Date(),
      });
      return res.json(existing);
    }

    const created = await CAR_COM.create({
      ID_USU: Number(ID_USU),
      ID_PRO: Number(ID_PRO),
      CAN_CAR_COM: Number(CAN_CAR_COM) || 1,
      PRE_UNI_CAR: PRE_UNI_CAR ?? null,
      FEC_AGR_CAR: new Date(),
      FEC_ACT_CAR: new Date(),
    });
    return res.status(201).json(created);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}

export async function update(req, res) {
  try {
    const [updated] = await CAR_COM.update(
      { ...req.body, FEC_ACT_CAR: new Date() },
      { where: { ID_CAR_COM: req.params.id } }
    );
    if (!updated) return res.status(404).json({ error: "No encontrado" });
    const refreshed = await CAR_COM.findByPk(req.params.id);
    return res.json(refreshed);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}

export async function remove(req, res) {
  try {
    const deleted = await CAR_COM.destroy({ where: { ID_CAR_COM: req.params.id } });
    return deleted ? res.json({ message: "Eliminado correctamente" }) : res.status(404).json({ error: "No encontrado" });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
