import { Op } from "sequelize";
import { DET_TELE, PRODUCTOS, MARCAS, MODELOS } from "../models/index.js";

const INT_FIELDS = ["EST_BAT_TEL", "EST_PAN_TEL", "EST_CAR_TEL", "EST_CAM_TEL", "EST_SOF_TEL"];
const STR_FIELDS = ["COL_TEL", "ALM_TEL", "ACC_INC_TEL"];

function clamp01(x) {
  const n = Number(x);
  if (!Number.isFinite(n)) return null;
  return Math.max(0, Math.min(100, Math.round(n)));
}
function normalizePayload(body = {}) {
  const data = {};
  for (const k of STR_FIELDS) if (body[k] !== undefined) data[k] = String(body[k]).trim() || null;
  for (const k of INT_FIELDS) if (body[k] !== undefined) {
    const v = clamp01(body[k]);
    if (v === null) throw new Error(`Campo ${k} debe ser numérico (0-100)`);
    data[k] = v;
  }
  return data;
}

// GET /api/telefonos?q=
export async function getAll(req, res) {
  try {
    const { q } = req.query || {};
    const where = {};
    if (q) {
      const like = `%${q}%`;
      where[Op.or] = [
        { ID_PRO: { [Op.like]: like } },
        { COL_TEL: { [Op.like]: like } },
        { ALM_TEL: { [Op.like]: like } },
        { ACC_INC_TEL: { [Op.like]: like } },
        { "$producto->marca.NOM_MAR$": { [Op.like]: like } },
        { "$producto->modelo.NOM_MOD$": { [Op.like]: like } },
      ];
    }

    const rows = await DET_TELE.findAll({
      where,
      include: [
        {
          model: PRODUCTOS,
          as: "producto",
          attributes: ["ID_PRO", "ID_MAR", "ID_MOD", "IMG_URL", "DES_PRO"],
          include: [
            { model: MARCAS, as: "marca", attributes: ["NOM_MAR"] },
            { model: MODELOS, as: "modelo", attributes: ["NOM_MOD"] },
          ],
        },
      ],
      order: [["ID_PRO", "ASC"]],
      subQuery: false,
    });
    return res.json(rows.map((r) => r.get({ plain: true })));
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}

// GET /api/telefonos/:id
export async function getOne(req, res) {
  try {
    const data = await DET_TELE.findByPk(req.params.id, {
      include: [
        {
          model: PRODUCTOS,
          as: "producto",
          attributes: ["ID_PRO", "ID_MAR", "ID_MOD", "IMG_URL", "DES_PRO"],
          include: [
            { model: MARCAS, as: "marca", attributes: ["NOM_MAR"] },
            { model: MODELOS, as: "modelo", attributes: ["NOM_MOD"] },
          ],
        },
      ],
    });
    return data ? res.json(data.get({ plain: true })) : res.status(404).json({ error: "No encontrado" });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}

export async function create(req, res) {
  try {
    const { ID_PRO } = req.body || {};
    if (!ID_PRO) return res.status(400).json({ error: "ID_PRO es obligatorio" });

    const exists = await DET_TELE.findByPk(ID_PRO);
    if (exists) return res.status(409).json({ error: "Ya existe detalle para este producto" });

    const data = normalizePayload(req.body);
    const created = await DET_TELE.create({ ID_PRO: Number(ID_PRO), ...data });
    const withInclude = await DET_TELE.findByPk(created.ID_PRO, {
      include: [
        {
          model: PRODUCTOS,
          as: "producto",
          attributes: ["ID_PRO", "ID_MAR", "ID_MOD", "IMG_URL", "DES_PRO"],
          include: [
            { model: MARCAS, as: "marca", attributes: ["NOM_MAR"] },
            { model: MODELOS, as: "modelo", attributes: ["NOM_MOD"] },
          ],
        },
      ],
    });
    return res.status(201).json(withInclude.get({ plain: true }));
  } catch (error) {
    if (error.message?.includes("debe ser numérico")) {
      return res.status(400).json({ error: error.message });
    }
    return res.status(500).json({ error: error.message });
  }
}

export async function update(req, res) {
  try {
    const id = req.params.id;
    const row = await DET_TELE.findByPk(id);
    if (!row) return res.status(404).json({ error: "No encontrado" });

    const data = normalizePayload(req.body);
    await row.update(data);

    const withInclude = await DET_TELE.findByPk(id, {
      include: [
        {
          model: PRODUCTOS,
          as: "producto",
          attributes: ["ID_PRO", "ID_MAR", "ID_MOD", "IMG_URL", "DES_PRO"],
          include: [
            { model: MARCAS, as: "marca", attributes: ["NOM_MAR"] },
            { model: MODELOS, as: "modelo", attributes: ["NOM_MOD"] },
          ],
        },
      ],
    });
    return res.json(withInclude.get({ plain: true }));
  } catch (error) {
    if (error.message?.includes("debe ser numérico")) {
      return res.status(400).json({ error: error.message });
    }
    return res.status(500).json({ error: error.message });
  }
}

export async function upsertByProducto(req, res) {
  try {
    const id = req.params.id;
    const data = normalizePayload(req.body);
    let row = await DET_TELE.findByPk(id);
    if (!row) row = await DET_TELE.create({ ID_PRO: Number(id), ...data });
    else await row.update(data);

    const withInclude = await DET_TELE.findByPk(id, {
      include: [
        {
          model: PRODUCTOS,
          as: "producto",
          attributes: ["ID_PRO", "ID_MAR", "ID_MOD", "IMG_URL", "DES_PRO"],
          include: [
            { model: MARCAS, as: "marca", attributes: ["NOM_MAR"] },
            { model: MODELOS, as: "modelo", attributes: ["NOM_MOD"] },
          ],
        },
      ],
    });
    return res.json(withInclude.get({ plain: true }));
  } catch (error) {
    if (error.message?.includes("debe ser numérico")) {
      return res.status(400).json({ error: error.message });
    }
    return res.status(500).json({ error: error.message });
  }
}

export async function remove(req, res) {
  try {
    const deleted = await DET_TELE.destroy({ where: { ID_PRO: req.params.id } });
    return deleted ? res.json({ message: "Eliminado correctamente" }) : res.status(404).json({ error: "No encontrado" });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}