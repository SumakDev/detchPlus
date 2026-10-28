import { Op } from "sequelize";
import sequelize from "../config/database.js";
import { DET_TELE, PRODUCTOS, STOCK, MOV_INV } from "../models/index.js";

function clampScore(val, def = 10) {
  if (val === undefined || val === null || val === "") return def;
  const n = Number(val);
  if (!Number.isFinite(n)) return def;
  return Math.max(1, Math.min(10, Math.round(n)));
}

/**
 * Sincroniza automáticamente la tabla STOCK del producto padre (Categoría Teléfono)
 * contando las unidades físicas en DET_TELE según su estado DIS_TEL.
 */
export async function syncPhoneStock(idPro, transaction = null) {
  const numIdPro = Number(idPro);
  if (!numIdPro) return null;

  const opts = transaction ? { transaction } : {};
  const units = await DET_TELE.findAll({
    where: { ID_PRO: numIdPro },
    attributes: ["ID_DET_TEL", "DIS_TEL"],
    ...opts,
  });

  const disponibles = units.filter((u) => (u.DIS_TEL || "DISPONIBLE") === "DISPONIBLE").length;
  const reservados = units.filter((u) => u.DIS_TEL === "RESERVADO").length;

  let stockRow = await STOCK.findByPk(numIdPro, opts);
  if (stockRow) {
    await stockRow.update(
      {
        CAN_DIS_STO: disponibles,
        CAN_RES_STO: reservados,
        FEC_ACT_STO: new Date(),
      },
      opts
    );
  } else {
    stockRow = await STOCK.create(
      {
        ID_PRO: numIdPro,
        CAN_DIS_STO: disponibles,
        CAN_RES_STO: reservados,
        STO_MIN: 1,
        STO_MAX: 100,
        FEC_ACT_STO: new Date(),
      },
      opts
    );
  }

  return stockRow;
}

/**
 * Agrupa las unidades físicas de DET_TELE por (Color + Almacenamiento + Estado Físico)
 * para saber exactamente cuántos teléfonos hay de cada combinación.
 */
export function computePhoneVariantsSummary(detalles = []) {
  if (!Array.isArray(detalles) || detalles.length === 0) return [];

  const groups = new Map();
  for (const raw of detalles) {
    const d = raw?.get ? raw.get({ plain: true }) : raw;
    const color = String(d.COL_TEL || "Sin color").trim() || "Sin color";
    const almacenamiento = String(d.ALM_TEL || "S/A").trim() || "S/A";
    const estadoFisico = d.EST_FIS_TEL || "NUEVO";
    const key = `${color.toLowerCase()}__${almacenamiento.toLowerCase()}__${estadoFisico}`;

    if (!groups.has(key)) {
      groups.set(key, {
        color,
        almacenamiento,
        estadoFisico,
        disponibles: 0,
        reservados: 0,
        vendidos: 0,
        baja: 0,
        total: 0,
      });
    }

    const g = groups.get(key);
    g.total += 1;
    const dis = d.DIS_TEL || "DISPONIBLE";
    if (dis === "DISPONIBLE") g.disponibles += 1;
    else if (dis === "RESERVADO") g.reservados += 1;
    else if (dis === "VENDIDO") g.vendidos += 1;
    else g.baja += 1;
  }

  return Array.from(groups.values()).sort((a, b) => b.disponibles - a.disponibles);
}

export async function getAll(req, res) {
  try {
    const { idPro, dis } = req.query;
    const where = {};
    if (idPro) where.ID_PRO = Number(idPro);
    if (dis) where.DIS_TEL = String(dis);

    const data = await DET_TELE.findAll({
      where,
      order: [["ID_DET_TEL", "DESC"]],
    });
    return res.json(data);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}

export async function getOne(req, res) {
  try {
    const data = await DET_TELE.findByPk(req.params.id);
    return data ? res.json(data) : res.status(404).json({ error: "Unidad de teléfono no encontrada" });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}

export async function create(req, res) {
  const t = await sequelize.transaction();
  try {
    const body = req.body || {};
    const idPro = Number(body.ID_PRO);
    if (!idPro) {
      await t.rollback();
      return res.status(400).json({ error: "ID_PRO es obligatorio para registrar una unidad de teléfono" });
    }

    const prod = await PRODUCTOS.findByPk(idPro, { transaction: t });
    if (!prod || !prod.ACT_PRO) {
      await t.rollback();
      return res.status(404).json({ error: "El producto asociado no existe o está inactivo" });
    }

    const cantidad = Math.max(1, Math.min(50, Number(body.cantidad || 1)));
    const rawImeis = body.IME_TEL
      ? String(body.IME_TEL)
          .split(/[,\n;]+/)
          .map((s) => s.trim())
          .filter(Boolean)
      : [];

    if (rawImeis.length > 0) {
      const uniqueCheck = new Set(rawImeis.map((i) => i.toLowerCase()));
      if (uniqueCheck.size !== rawImeis.length) {
        await t.rollback();
        return res.status(400).json({ error: "Hay IMEIs duplicados en el ingreso solicitado" });
      }
      for (const imei of rawImeis) {
        const existingImei = await DET_TELE.findOne({ where: { IME_TEL: imei }, transaction: t });
        if (existingImei) {
          await t.rollback();
          return res.status(400).json({ error: `Ya existe un teléfono registrado con el IMEI "${imei}"` });
        }
      }
    }

    const totalToCreate = Math.max(cantidad, rawImeis.length);
    const createdUnits = [];

    for (let i = 0; i < totalToCreate; i++) {
      const unitImei = rawImeis[i] || null;
      const created = await DET_TELE.create(
        {
          ID_PRO: idPro,
          IME_TEL: unitImei,
          COL_TEL: body.COL_TEL ? String(body.COL_TEL).trim() : null,
          ALM_TEL: body.ALM_TEL ? String(body.ALM_TEL).trim() : null,
          EST_FIS_TEL: body.EST_FIS_TEL || prod.EST_PRO || "NUEVO",
          ORG_TEL: body.ORG_TEL || prod.ORG_PRO || "COMPRA_NUEVA",
          EST_BAT_TEL: clampScore(body.EST_BAT_TEL, 10),
          EST_PAN_TEL: clampScore(body.EST_PAN_TEL, 10),
          EST_CAR_TEL: clampScore(body.EST_CAR_TEL, 10),
          EST_CAM_TEL: clampScore(body.EST_CAM_TEL, 10),
          EST_SOF_TEL: clampScore(body.EST_SOF_TEL, 10),
          ACC_INC_TEL: body.ACC_INC_TEL ? String(body.ACC_INC_TEL).trim() : null,
          DIS_TEL: body.DIS_TEL || "DISPONIBLE",
          FEC_ING_TEL: new Date(),
        },
        { transaction: t }
      );
      createdUnits.push(created);
    }

    await syncPhoneStock(idPro, t);

    const first = createdUnits[0];
    if ((first?.DIS_TEL || "DISPONIBLE") === "DISPONIBLE") {
      await MOV_INV.create(
        {
          ID_PRO: idPro,
          TIP_MOV: "ENTRADA",
          CAN_MOV: createdUnits.length,
          MOT_MOV: `ALTA_TEL x${createdUnits.length} (${first.COL_TEL || "S/C"} ${first.ALM_TEL || ""})`.trim(),
        },
        { transaction: t }
      );
    }

    await t.commit();
    return res.status(201).json(createdUnits.length === 1 ? createdUnits[0] : createdUnits);
  } catch (error) {
    await t.rollback();
    return res.status(500).json({ error: error.message });
  }
}

export async function update(req, res) {
  const t = await sequelize.transaction();
  try {
    const idDet = Number(req.params.id);
    const body = req.body || {};

    const row = await DET_TELE.findByPk(idDet, { transaction: t });
    if (!row) {
      await t.rollback();
      return res.status(404).json({ error: "Unidad de teléfono no encontrada" });
    }

    const imei = body.IME_TEL !== undefined ? (body.IME_TEL ? String(body.IME_TEL).trim() : null) : row.IME_TEL;
    if (imei && imei !== row.IME_TEL) {
      const dup = await DET_TELE.findOne({
        where: { IME_TEL: imei, ID_DET_TEL: { [Op.ne]: idDet } },
        transaction: t,
      });
      if (dup) {
        await t.rollback();
        return res.status(400).json({ error: `Ya existe otro teléfono con el IMEI "${imei}"` });
      }
    }

    await row.update(
      {
        IME_TEL: imei,
        COL_TEL: body.COL_TEL !== undefined ? (body.COL_TEL ? String(body.COL_TEL).trim() : null) : row.COL_TEL,
        ALM_TEL: body.ALM_TEL !== undefined ? (body.ALM_TEL ? String(body.ALM_TEL).trim() : null) : row.ALM_TEL,
        EST_FIS_TEL: body.EST_FIS_TEL ?? row.EST_FIS_TEL,
        ORG_TEL: body.ORG_TEL ?? row.ORG_TEL,
        EST_BAT_TEL: body.EST_BAT_TEL !== undefined ? clampScore(body.EST_BAT_TEL, row.EST_BAT_TEL) : row.EST_BAT_TEL,
        EST_PAN_TEL: body.EST_PAN_TEL !== undefined ? clampScore(body.EST_PAN_TEL, row.EST_PAN_TEL) : row.EST_PAN_TEL,
        EST_CAR_TEL: body.EST_CAR_TEL !== undefined ? clampScore(body.EST_CAR_TEL, row.EST_CAR_TEL) : row.EST_CAR_TEL,
        EST_CAM_TEL: body.EST_CAM_TEL !== undefined ? clampScore(body.EST_CAM_TEL, row.EST_CAM_TEL) : row.EST_CAM_TEL,
        EST_SOF_TEL: body.EST_SOF_TEL !== undefined ? clampScore(body.EST_SOF_TEL, row.EST_SOF_TEL) : row.EST_SOF_TEL,
        ACC_INC_TEL: body.ACC_INC_TEL !== undefined ? (body.ACC_INC_TEL ? String(body.ACC_INC_TEL).trim() : null) : row.ACC_INC_TEL,
        DIS_TEL: body.DIS_TEL ?? row.DIS_TEL,
      },
      { transaction: t }
    );

    await syncPhoneStock(row.ID_PRO, t);
    await t.commit();
    return res.json(row);
  } catch (error) {
    await t.rollback();
    return res.status(500).json({ error: error.message });
  }
}

export async function remove(req, res) {
  const t = await sequelize.transaction();
  try {
    const idDet = Number(req.params.id);
    const row = await DET_TELE.findByPk(idDet, { transaction: t });
    if (!row) {
      await t.rollback();
      return res.status(404).json({ error: "Unidad de teléfono no encontrada" });
    }

    const idPro = row.ID_PRO;
    await row.destroy({ transaction: t });
    await syncPhoneStock(idPro, t);

    await t.commit();
    return res.json({ message: "Unidad de teléfono eliminada y stock sincronizado", ID_DET_TEL: idDet, ID_PRO: idPro });
  } catch (error) {
    await t.rollback();
    return res.status(500).json({ error: error.message });
  }
}
