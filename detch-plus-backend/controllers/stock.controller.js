import { Op } from "sequelize";
import sequelize from "../config/database.js";
import { PRODUCTOS, STOCK, MOV_INV, MARCAS, MODELOS, CATEGORIAS } from "../models/index.js";

// Helpers
function ensure(cond, message, status = 400) {
  if (!cond) {
    const err = new Error(message);
    err.status = status;
    throw err;
  }
}
function toInt(v, def = 0) {
  const n = Number(v);
  return Number.isFinite(n) ? n : def;
}
function now() {
  return new Date();
}

async function withTx(fn) {
  return sequelize.transaction(async (t) => fn(t));
}

// GET /stock
export async function getAll(req, res) {
  try {
    const { q, estado, activo } = req.query;

    const prodWhere = {};
    if (activo === "true") {
      prodWhere.ACT_PRO = true;
    } else if (activo === "false") {
      prodWhere.ACT_PRO = false;
    } else if (activo === "all") {
      // no filtrar por estado si se solicita all
    } else {
      // Por defecto solo productos activos (no eliminados lógicamente)
      prodWhere.ACT_PRO = true;
    }

    // join para mostrar info del producto
    const rows = await STOCK.findAll({
      include: [
        {
          model: PRODUCTOS,
          as: "producto",
          where: prodWhere,
          required: true,
          include: [
            { model: CATEGORIAS, as: "categoria", attributes: ["ID_CAT", "NOM_CAT"], required: false },
            { model: MARCAS, as: "marca", attributes: ["ID_MAR", "NOM_MAR"], required: false },
            { model: MODELOS, as: "modelo", attributes: ["ID_MOD", "NOM_MOD"], required: false },
          ],
        },
      ],
      order: [["FEC_ACT_STO", "DESC"]],
    });

    let data = rows.map((r) => r.get({ plain: true }));
    if (q) {
      const t = String(q).toLowerCase();
      data = data.filter((r) => {
        const p = r.producto || {};
        return (
          String(r.ID_PRO).includes(t) ||
          (p.COD_BAR_PRO || "").toLowerCase().includes(t) ||
          (p.IME_PRO || "").toLowerCase().includes(t) ||
          (p.marca?.NOM_MAR || "").toLowerCase().includes(t) ||
          (p.modelo?.NOM_MOD || "").toLowerCase().includes(t)
        );
      });
    }
    if (estado === "criticos") data = data.filter((r) => r.CAN_DIS_STO <= r.STO_MIN && r.CAN_DIS_STO > 0);
    if (estado === "agotados") data = data.filter((r) => r.CAN_DIS_STO === 0);
    if (estado === "ok") data = data.filter((r) => r.CAN_DIS_STO > r.STO_MIN);

    return res.json(data);
  } catch (error) {
    console.error("stock.getAll", error);
    return res.status(error.status || 500).json({ error: error.message || "Internal server error" });
  }
}

// GET /stock/resumen
export async function resumen(req, res) {
  try {
    const all = await STOCK.findAll({
      attributes: ["CAN_DIS_STO", "STO_MIN", "ID_PRO"],
      include: [
        {
          model: PRODUCTOS,
          as: "producto",
          attributes: ["ID_PRO", "ACT_PRO"],
          where: { ACT_PRO: true },
          required: true,
        },
      ],
    });
    const totalProductos = all.length;
    const criticos = all.filter((r) => Number(r.CAN_DIS_STO) <= Number(r.STO_MIN) && Number(r.CAN_DIS_STO) > 0).length;
    const agotados = all.filter((r) => Number(r.CAN_DIS_STO) === 0).length;

    // top críticos por menor disponible/min
    const topCriticos = all
      .map((r) => ({
        ID_PRO: r.ID_PRO,
        dis: Number(r.CAN_DIS_STO),
        min: Number(r.STO_MIN),
        ratio: Number(r.STO_MIN) > 0 ? Number(r.CAN_DIS_STO) / Number(r.STO_MIN) : 1,
      }))
      .filter((x) => x.dis <= x.min)
      .sort((a, b) => a.ratio - b.ratio)
      .slice(0, 10);

    return res.json({ totalProductos, criticos, agotados, topCriticos });
  } catch (error) {
    console.error("stock.resumen", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}

// GET /stock/movimientos/:idPro? (opcional con ?idPro=)
export async function movimientos(req, res) {
  try {
    const { idPro } = req.params;
    const where = idPro ? { ID_PRO: Number(idPro) } : {};
    const rows = await MOV_INV.findAll({
      where,
      order: [["FEC_MOV", "DESC"]],
      limit: 300,
    });
    return res.json(rows);
  } catch (error) {
    console.error("stock.movimientos", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}

// POST /stock/entrada
export async function entrada(req, res) {
  try {
    const { idPro, cantidad, motivo, numDoc, cedEmp } = req.body || {};
    const n = toInt(cantidad);
    ensure(idPro && n > 0, "idPro y cantidad > 0 son obligatorios");

    const prod = await PRODUCTOS.findByPk(idPro);
    ensure(prod && prod.ACT_PRO, "El producto no existe o se encuentra inactivo", 400);

    const row = await withTx(async (t) => {
      const s = await STOCK.findByPk(idPro, { transaction: t, lock: t.LOCK.UPDATE });
      ensure(s, "No existe stock del producto", 404);
      const nuevoDis = Number(s.CAN_DIS_STO) + n;

      await s.update({ CAN_DIS_STO: nuevoDis, FEC_ACT_STO: now() }, { transaction: t });

      await MOV_INV.create(
        { ID_PRO: idPro, TIP_MOV: "ENTRADA", CAN_MOV: n, MOT_MOV: motivo || null, NUM_DOC_MOV: numDoc || null, CED_EMP: cedEmp || null },
        { transaction: t }
      );

      return s;
    });

    return res.json(row);
  } catch (error) {
    console.error("stock.entrada", error);
    return res.status(error.status || 500).json({ error: error.message || "Internal server error" });
  }
}

// POST /stock/salida (directa)
export async function salida(req, res) {
  try {
    const { idPro, cantidad, motivo, numDoc, cedEmp } = req.body || {};
    const n = toInt(cantidad);
    ensure(idPro && n > 0, "idPro y cantidad > 0 son obligatorios");

    const prod = await PRODUCTOS.findByPk(idPro);
    ensure(prod && prod.ACT_PRO, "El producto no existe o se encuentra inactivo", 400);

    const row = await withTx(async (t) => {
      const s = await STOCK.findByPk(idPro, { transaction: t, lock: t.LOCK.UPDATE });
      ensure(s, "No existe stock del producto", 404);
      ensure(Number(s.CAN_DIS_STO) >= n, "Stock disponible insuficiente", 409);

      await s.update({ CAN_DIS_STO: Number(s.CAN_DIS_STO) - n, FEC_ACT_STO: now() }, { transaction: t });

      await MOV_INV.create(
        { ID_PRO: idPro, TIP_MOV: "SALIDA", CAN_MOV: n, MOT_MOV: motivo || null, NUM_DOC_MOV: numDoc || null, CED_EMP: cedEmp || null },
        { transaction: t }
      );

      return s;
    });

    return res.json(row);
  } catch (error) {
    console.error("stock.salida", error);
    return res.status(error.status || 500).json({ error: error.message || "Internal server error" });
  }
}

// POST /stock/reservar
export async function reservar(req, res) {
  try {
    const { idPro, cantidad, motivo, numDoc, cedEmp } = req.body || {};
    const n = toInt(cantidad);
    ensure(idPro && n > 0, "idPro y cantidad > 0 son obligatorios");

    const prod = await PRODUCTOS.findByPk(idPro);
    ensure(prod && prod.ACT_PRO, "El producto no existe o se encuentra inactivo", 400);

    const row = await withTx(async (t) => {
      const s = await STOCK.findByPk(idPro, { transaction: t, lock: t.LOCK.UPDATE });
      ensure(s, "No existe stock del producto", 404);
      ensure(Number(s.CAN_DIS_STO) >= n, "Stock disponible insuficiente para reservar", 409);

      await s.update(
        { CAN_DIS_STO: Number(s.CAN_DIS_STO) - n, CAN_RES_STO: Number(s.CAN_RES_STO) + n, FEC_ACT_STO: now() },
        { transaction: t }
      );

      await MOV_INV.create(
        { ID_PRO: idPro, TIP_MOV: "AJUSTE", CAN_MOV: n, MOT_MOV: "RESERVA" + (motivo ? `: ${motivo}` : ""), NUM_DOC_MOV: numDoc || null, CED_EMP: cedEmp || null },
        { transaction: t }
      );

      return s;
    });

    return res.json(row);
  } catch (error) {
    console.error("stock.reservar", error);
    return res.status(error.status || 500).json({ error: error.message || "Internal server error" });
  }
}

// POST /stock/desreservar
export async function desreservar(req, res) {
  try {
    const { idPro, cantidad, motivo, numDoc, cedEmp } = req.body || {};
    const n = toInt(cantidad);
    ensure(idPro && n > 0, "idPro y cantidad > 0 son obligatorios");

    const prod = await PRODUCTOS.findByPk(idPro);
    ensure(prod && prod.ACT_PRO, "El producto no existe o se encuentra inactivo", 400);

    const row = await withTx(async (t) => {
      const s = await STOCK.findByPk(idPro, { transaction: t, lock: t.LOCK.UPDATE });
      ensure(s, "No existe stock del producto", 404);
      ensure(Number(s.CAN_RES_STO) >= n, "No hay suficiente reservado para liberar", 409);

      await s.update(
        { CAN_RES_STO: Number(s.CAN_RES_STO) - n, CAN_DIS_STO: Number(s.CAN_DIS_STO) + n, FEC_ACT_STO: now() },
        { transaction: t }
      );

      await MOV_INV.create(
        { ID_PRO: idPro, TIP_MOV: "AJUSTE", CAN_MOV: n, MOT_MOV: "DES-RESERVA" + (motivo ? `: ${motivo}` : ""), NUM_DOC_MOV: numDoc || null, CED_EMP: cedEmp || null },
        { transaction: t }
      );

      return s;
    });

    return res.json(row);
  } catch (error) {
    console.error("stock.desreservar", error);
    return res.status(error.status || 500).json({ error: error.message || "Internal server error" });
  }
}

// POST /stock/salida-reserva (entrega pedido)
export async function salidaDesdeReserva(req, res) {
  try {
    const { idPro, cantidad, motivo, numDoc, cedEmp } = req.body || {};
    const n = toInt(cantidad);
    ensure(idPro && n > 0, "idPro y cantidad > 0 son obligatorios");

    const prod = await PRODUCTOS.findByPk(idPro);
    ensure(prod && prod.ACT_PRO, "El producto no existe o se encuentra inactivo", 400);

    const row = await withTx(async (t) => {
      const s = await STOCK.findByPk(idPro, { transaction: t, lock: t.LOCK.UPDATE });
      ensure(s, "No existe stock del producto", 404);
      ensure(Number(s.CAN_RES_STO) >= n, "No hay suficiente reservado para salida", 409);

      await s.update({ CAN_RES_STO: Number(s.CAN_RES_STO) - n, FEC_ACT_STO: now() }, { transaction: t });

      await MOV_INV.create(
        { ID_PRO: idPro, TIP_MOV: "SALIDA", CAN_MOV: n, MOT_MOV: "SALIDA_RESERVA" + (motivo ? `: ${motivo}` : ""), NUM_DOC_MOV: numDoc || null, CED_EMP: cedEmp || null },
        { transaction: t }
      );

      return s;
    });

    return res.json(row);
  } catch (error) {
    console.error("stock.salidaDesdeReserva", error);
    return res.status(error.status || 500).json({ error: error.message || "Internal server error" });
  }
}

// Memoria caché para deduplicación de ajustes de stock por doble clic o ráfagas rápidas (< 3 segundos)
const recentStockAdjustments = new Map();

function cleanOldAdjustments() {
  const nowMs = Date.now();
  for (const [key, item] of recentStockAdjustments.entries()) {
    if (nowMs - item.time > 5000) {
      recentStockAdjustments.delete(key);
    }
  }
}

// POST /stock/ajustar (ajuste libre sobre disponible; delta puede ser negativo)
export async function ajustarDisponible(req, res) {
  try {
    const { idPro, delta, motivo, numDoc, cedEmp } = req.body || {};
    const d = toInt(delta);
    ensure(idPro && d !== 0, "idPro y delta (≠ 0) son obligatorios");

    const prod = await PRODUCTOS.findByPk(idPro);
    ensure(prod && prod.ACT_PRO, "El producto no existe o se encuentra inactivo", 400);

    // Detección y bloqueo de doble click accidental (idempotencia en ventana de 2.5s)
    cleanOldAdjustments();
    const dedupKey = `${idPro}_${d}_${motivo || ""}_${numDoc || ""}`;
    const nowMs = Date.now();
    const lastOp = recentStockAdjustments.get(dedupKey);
    if (lastOp && (nowMs - lastOp.time < 2500)) {
      console.warn(`[Anti-Doble-Click] Ajuste de stock duplicado bloqueado para producto ID ${idPro} (delta ${d})`);
      const currentStock = await STOCK.findByPk(idPro);
      return res.json(currentStock);
    }
    recentStockAdjustments.set(dedupKey, { time: nowMs });

    const row = await withTx(async (t) => {
      const s = await STOCK.findByPk(idPro, { transaction: t, lock: t.LOCK.UPDATE });
      ensure(s, "No existe stock del producto", 404);
      ensure(Number(s.CAN_DIS_STO) + d >= 0, "El ajuste no puede dejar disponible en negativo", 409);

      await s.update({ CAN_DIS_STO: Number(s.CAN_DIS_STO) + d, FEC_ACT_STO: now() }, { transaction: t });

      await MOV_INV.create(
        { ID_PRO: idPro, TIP_MOV: "AJUSTE", CAN_MOV: Math.abs(d), MOT_MOV: (motivo || "AJUSTE") + ` (${d > 0 ? "+" : ""}${d})`, NUM_DOC_MOV: numDoc || null, CED_EMP: cedEmp || null },
        { transaction: t }
      );

      return s;
    });

    return res.json(row);
  } catch (error) {
    console.error("stock.ajustarDisponible", error);
    return res.status(error.status || 500).json({ error: error.message || "Internal server error" });
  }
}

// PUT /stock/minmax/:id
export async function actualizarMinMax(req, res) {
  try {
    const { id } = req.params;
    const { min, max } = req.body || {};
    const minN = toInt(min, 0);
    const maxN = max != null ? toInt(max, 0) : null;
    ensure(minN >= 0, "min inválido");
    if (maxN != null) ensure(maxN >= minN, "max debe ser >= min");

    const prod = await PRODUCTOS.findByPk(id);
    ensure(prod && prod.ACT_PRO, "El producto no existe o se encuentra inactivo", 400);

    const s = await STOCK.findByPk(id);
    ensure(s, "No existe stock del producto", 404);
    await s.update({ STO_MIN: minN, ...(maxN != null ? { STO_MAX: maxN } : {}), FEC_ACT_STO: now() });
    return res.json(s);
  } catch (error) {
    console.error("stock.actualizarMinMax", error);
    return res.status(error.status || 500).json({ error: error.message || "Internal server error" });
  }
}

// PUT /stock/ubicacion/:id
export async function actualizarUbicacion(req, res) {
  try {
    const { id } = req.params;
    const { ubicacion } = req.body || {};

    const prod = await PRODUCTOS.findByPk(id);
    ensure(prod && prod.ACT_PRO, "El producto no existe o se encuentra inactivo", 400);

    const s = await STOCK.findByPk(id);
    ensure(s, "No existe stock del producto", 404);
    await s.update({ UBI_STO: ubicacion || null, FEC_ACT_STO: now() });
    return res.json(s);
  } catch (error) {
    console.error("stock.actualizarUbicacion", error);
    return res.status(error.status || 500).json({ error: error.message || "Internal server error" });
  }
}