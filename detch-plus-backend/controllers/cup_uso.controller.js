import { CUP_USO, CUPONES, USUARIOS, PED_ONL } from "../models/index.js";

export async function getAll(req, res) {
  try {
    const where = {};
    if (req.query.idCup) where.ID_CUP = Number(req.query.idCup);
    if (req.query.idUsu) where.ID_USU = Number(req.query.idUsu);

    const data = await CUP_USO.findAll({
      where,
      include: [
        { model: CUPONES, as: "cupon" },
        { model: USUARIOS, as: "usuario", attributes: ["ID_USU", "NOM_USU", "APE_USU", "COR_USU"] },
        { model: PED_ONL, as: "pedido", attributes: ["ID_PED_ONL", "NUM_PED_ONL", "TOT_PED_ONL"] },
      ],
      order: [["FEC_USO_CUP", "DESC"]],
    });
    return res.json(data);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}

export async function getOne(req, res) {
  try {
    const data = await CUP_USO.findByPk(req.params.id, {
      include: [
        { model: CUPONES, as: "cupon" },
        { model: USUARIOS, as: "usuario", attributes: ["ID_USU", "NOM_USU", "APE_USU", "COR_USU"] },
        { model: PED_ONL, as: "pedido", attributes: ["ID_PED_ONL", "NUM_PED_ONL", "TOT_PED_ONL"] },
      ],
    });
    return data ? res.json(data) : res.status(404).json({ error: "No encontrado" });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}

export async function create(req, res) {
  try {
    const created = await CUP_USO.create(req.body);
    return res.status(201).json(created);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}

export async function update(req, res) {
  try {
    const [updated] = await CUP_USO.update(req.body, { where: { ID_CUP_USO: req.params.id } });
    if (!updated) return res.status(404).json({ error: "No encontrado" });
    const refreshed = await CUP_USO.findByPk(req.params.id);
    return res.json(refreshed);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}

export async function remove(req, res) {
  try {
    const deleted = await CUP_USO.destroy({ where: { ID_CUP_USO: req.params.id } });
    return deleted ? res.json({ message: "Eliminado correctamente" }) : res.status(404).json({ error: "No encontrado" });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
