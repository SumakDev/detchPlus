import { RES_PRO, PRODUCTOS, USUARIOS } from "../models/index.js";

export async function getAll(req, res) {
  try {
    const where = {};
    if (req.query.idPro) where.ID_PRO = Number(req.query.idPro);
    if (req.query.est) where.EST_RES_PRO = String(req.query.est).toUpperCase();

    const data = await RES_PRO.findAll({
      where,
      include: [
        { model: PRODUCTOS, as: "producto", attributes: ["ID_PRO", "DES_PRO", "COD_BAR_PRO"] },
        { model: USUARIOS, as: "usuario", attributes: ["ID_USU", "NOM_USU", "APE_USU"] },
      ],
      order: [["FEC_RES_PRO", "DESC"]],
    });
    return res.json(data);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}

export async function getOne(req, res) {
  try {
    const data = await RES_PRO.findByPk(req.params.id, {
      include: [
        { model: PRODUCTOS, as: "producto", attributes: ["ID_PRO", "DES_PRO", "COD_BAR_PRO"] },
        { model: USUARIOS, as: "usuario", attributes: ["ID_USU", "NOM_USU", "APE_USU"] },
      ],
    });
    return data ? res.json(data) : res.status(404).json({ error: "No encontrado" });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}

export async function create(req, res) {
  try {
    const { ID_USU, ID_PRO, CAL_RES_PRO, TIT_RES_PRO, COM_RES_PRO, EST_RES_PRO } = req.body;
    if (!ID_USU || !ID_PRO) {
      return res.status(400).json({ error: "ID_USU e ID_PRO son obligatorios" });
    }

    const cal = Math.max(1, Math.min(5, Number(CAL_RES_PRO) || 5));
    const existing = await RES_PRO.findOne({
      where: { ID_USU: Number(ID_USU), ID_PRO: Number(ID_PRO) },
    });

    if (existing) {
      await existing.update({
        CAL_RES_PRO: cal,
        TIT_RES_PRO: TIT_RES_PRO ?? existing.TIT_RES_PRO,
        COM_RES_PRO: COM_RES_PRO ?? existing.COM_RES_PRO,
        EST_RES_PRO: EST_RES_PRO || "APROBADA",
        FEC_RES_PRO: new Date(),
      });
      const refreshed = await RES_PRO.findByPk(existing.ID_RES_PRO, {
        include: [
          { model: PRODUCTOS, as: "producto", attributes: ["ID_PRO", "DES_PRO", "COD_BAR_PRO"] },
          { model: USUARIOS, as: "usuario", attributes: ["ID_USU", "NOM_USU", "APE_USU"] },
        ],
      });
      return res.json(refreshed);
    }

    const created = await RES_PRO.create({
      ID_USU: Number(ID_USU),
      ID_PRO: Number(ID_PRO),
      CAL_RES_PRO: cal,
      TIT_RES_PRO: TIT_RES_PRO || null,
      COM_RES_PRO: COM_RES_PRO || null,
      EST_RES_PRO: EST_RES_PRO || "APROBADA",
      FEC_RES_PRO: new Date(),
    });

    const full = await RES_PRO.findByPk(created.ID_RES_PRO, {
      include: [
        { model: PRODUCTOS, as: "producto", attributes: ["ID_PRO", "DES_PRO", "COD_BAR_PRO"] },
        { model: USUARIOS, as: "usuario", attributes: ["ID_USU", "NOM_USU", "APE_USU"] },
      ],
    });
    return res.status(201).json(full);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}

export async function update(req, res) {
  try {
    const [updated] = await RES_PRO.update(req.body, { where: { ID_RES_PRO: req.params.id } });
    if (!updated) return res.status(404).json({ error: "No encontrado" });
    const refreshed = await RES_PRO.findByPk(req.params.id);
    return res.json(refreshed);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}

export async function remove(req, res) {
  try {
    const deleted = await RES_PRO.destroy({ where: { ID_RES_PRO: req.params.id } });
    return deleted ? res.json({ message: "Eliminado correctamente" }) : res.status(404).json({ error: "No encontrado" });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
