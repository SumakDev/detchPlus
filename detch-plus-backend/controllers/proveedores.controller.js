import { Op } from "sequelize";
import { PROVEEDORES } from "../models/index.js";

// Normalizador (mantiene nombres)
function toUi(row) {
  return row.get ? row.get({ plain: true }) : row;
}

// GET /api/proveedores?q=&act=
export async function getAll(req, res) {
  try {
    const { q, act } = req.query;
    const where = {};
    if (act === "true") where.EST_PRV = true;
    if (act === "false") where.EST_PRV = false;

    if (q) {
      const like = `%${q}%`;
      where[Op.or] = [
        { NOM_PRV: { [Op.like]: like } },
        { RUC_PRV: { [Op.like]: like } },
        { TEL_PRV: { [Op.like]: like } },
        { COR_PRV: { [Op.like]: like } },
        { CON_PRI_PRV: { [Op.like]: like } },
      ];
    }

    const rows = await PROVEEDORES.findAll({
      where,
      order: [
        ["NOM_PRV", "ASC"],
        ["ID_PRV", "DESC"],
      ],
    });
    return res.json(rows.map(toUi));
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}

// GET /api/proveedores/:id
export async function getOne(req, res) {
  try {
    const data = await PROVEEDORES.findByPk(req.params.id);
    return data ? res.json(toUi(data)) : res.status(404).json({ error: "No encontrado" });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}

// POST /api/proveedores
export async function create(req, res) {
  try {
    const { NOM_PRV, RUC_PRV, COR_PRV } = req.body || {};
    if (!NOM_PRV || !String(NOM_PRV).trim()) {
      return res.status(400).json({ error: "NOM_PRV es obligatorio" });
    }

    // Unicidad simple de RUC si viene
    if (RUC_PRV) {
      const dup = await PROVEEDORES.findOne({ where: { RUC_PRV } });
      if (dup) return res.status(409).json({ error: "RUC ya registrado" });
    }

    // Validación simple de email si viene
    if (COR_PRV && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(COR_PRV))) {
      return res.status(400).json({ error: "Email inválido" });
    }

    const created = await PROVEEDORES.create({
      NOM_PRV: String(NOM_PRV).trim(),
      RUC_PRV: RUC_PRV || null,
      TEL_PRV: req.body.TEL_PRV || null,
      COR_PRV: req.body.COR_PRV || null,
      DIR_PRV: req.body.DIR_PRV || null,
      CON_PRI_PRV: req.body.CON_PRI_PRV || null,
      EST_PRV: req.body.EST_PRV !== undefined ? !!req.body.EST_PRV : true,
      FEC_CRE_PRV: new Date(),
    });
    return res.status(201).json(toUi(created));
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}

// PUT /api/proveedores/:id
export async function update(req, res) {
  try {
    const row = await PROVEEDORES.findByPk(req.params.id);
    if (!row) return res.status(404).json({ error: "No encontrado" });

    const { NOM_PRV, RUC_PRV, COR_PRV } = req.body || {};

    if (NOM_PRV !== undefined && !String(NOM_PRV).trim()) {
      return res.status(400).json({ error: "NOM_PRV no puede estar vacío" });
    }

    if (RUC_PRV !== undefined && RUC_PRV !== row.RUC_PRV) {
      if (RUC_PRV) {
        const dup = await PROVEEDORES.findOne({ where: { RUC_PRV } });
        if (dup) return res.status(409).json({ error: "RUC ya registrado" });
      }
    }

    if (COR_PRV !== undefined && COR_PRV) {
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(COR_PRV))) {
        return res.status(400).json({ error: "Email inválido" });
      }
    }

    await row.update({
      NOM_PRV: NOM_PRV !== undefined ? String(NOM_PRV).trim() : row.NOM_PRV,
      RUC_PRV: RUC_PRV !== undefined ? (RUC_PRV || null) : row.RUC_PRV,
      TEL_PRV: req.body.TEL_PRV !== undefined ? req.body.TEL_PRV : row.TEL_PRV,
      COR_PRV: req.body.COR_PRV !== undefined ? req.body.COR_PRV : row.COR_PRV,
      DIR_PRV: req.body.DIR_PRV !== undefined ? req.body.DIR_PRV : row.DIR_PRV,
      CON_PRI_PRV: req.body.CON_PRI_PRV !== undefined ? req.body.CON_PRI_PRV : row.CON_PRI_PRV,
      EST_PRV: req.body.EST_PRV !== undefined ? !!req.body.EST_PRV : row.EST_PRV,
    });

    return res.json(toUi(row));
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}

// PATCH /api/proveedores/:id/estado { activo: boolean }
export async function updateEstado(req, res) {
  try {
    const { id } = req.params;
    const { activo } = req.body || {};
    if (activo === undefined) return res.status(400).json({ error: "activo es obligatorio" });

    const row = await PROVEEDORES.findByPk(id);
    if (!row) return res.status(404).json({ error: "No encontrado" });

    await row.update({ EST_PRV: !!activo });
    return res.json({ message: "Estado actualizado", EST_PRV: row.EST_PRV });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}

// DELETE /api/proveedores/:id
export async function remove(req, res) {
  try {
    const deleted = await PROVEEDORES.destroy({ where: { ID_PRV: req.params.id } });
    return deleted ? res.json({ message: "Eliminado correctamente" }) : res.status(404).json({ error: "No encontrado" });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}