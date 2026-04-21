import sequelize from "../config/database.js";
import * as repo from "../repositories/stock.repository.js";

function serviceError(message, status = 400) {
  const err = new Error(message);
  err.status = status;
  return err;
}

function toInt(v, def = 0) {
  const n = Number(v);
  return Number.isFinite(n) ? n : def;
}

function now() {
  return new Date();
}

export async function getStock(params = {}) {
  const { q, estado } = params;
  const rows = await repo.findAll();
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

  return data;
}

export async function getResumen() {
  const all = await repo.findAllSummary();
  const totalProductos = all.length;
  const criticos = all.filter((r) => Number(r.CAN_DIS_STO) <= Number(r.STO_MIN) && Number(r.CAN_DIS_STO) > 0).length;
  const agotados = all.filter((r) => Number(r.CAN_DIS_STO) === 0).length;

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

  return { totalProductos, criticos, agotados, topCriticos };
}

export async function getMovimientos(idPro) {
  const where = idPro ? { ID_PRO: Number(idPro) } : {};
  return repo.findMovimientos(where);
}

export async function registrarEntrada({ idPro, cantidad, motivo, numDoc, cedEmp }) {
  const n = toInt(cantidad);
  if (!idPro || n <= 0) throw serviceError("idPro y cantidad > 0 son obligatorios");

  return sequelize.transaction(async (t) => {
    const s = await repo.findByPk(idPro, { transaction: t, lock: t.LOCK.UPDATE });
    if (!s) throw serviceError("No existe stock del producto", 404);

    await s.update({ CAN_DIS_STO: Number(s.CAN_DIS_STO) + n, FEC_ACT_STO: now() }, { transaction: t });
    await repo.createMovimiento(
      { ID_PRO: idPro, TIP_MOV: "ENTRADA", CAN_MOV: n, MOT_MOV: motivo || null, NUM_DOC_MOV: numDoc || null, CED_EMP: cedEmp || null },
      { transaction: t }
    );
    return s;
  });
}

export async function registrarSalida({ idPro, cantidad, motivo, numDoc, cedEmp }) {
  const n = toInt(cantidad);
  if (!idPro || n <= 0) throw serviceError("idPro y cantidad > 0 son obligatorios");

  return sequelize.transaction(async (t) => {
    const s = await repo.findByPk(idPro, { transaction: t, lock: t.LOCK.UPDATE });
    if (!s) throw serviceError("No existe stock del producto", 404);
    if (Number(s.CAN_DIS_STO) < n) throw serviceError("Stock disponible insuficiente", 409);

    await s.update({ CAN_DIS_STO: Number(s.CAN_DIS_STO) - n, FEC_ACT_STO: now() }, { transaction: t });
    await repo.createMovimiento(
      { ID_PRO: idPro, TIP_MOV: "SALIDA", CAN_MOV: n, MOT_MOV: motivo || null, NUM_DOC_MOV: numDoc || null, CED_EMP: cedEmp || null },
      { transaction: t }
    );
    return s;
  });
}

export async function reservar({ idPro, cantidad, motivo, numDoc, cedEmp }) {
  const n = toInt(cantidad);
  if (!idPro || n <= 0) throw serviceError("idPro y cantidad > 0 son obligatorios");

  return sequelize.transaction(async (t) => {
    const s = await repo.findByPk(idPro, { transaction: t, lock: t.LOCK.UPDATE });
    if (!s) throw serviceError("No existe stock del producto", 404);
    if (Number(s.CAN_DIS_STO) < n) throw serviceError("Stock disponible insuficiente para reservar", 409);

    await s.update(
      { CAN_DIS_STO: Number(s.CAN_DIS_STO) - n, CAN_RES_STO: Number(s.CAN_RES_STO) + n, FEC_ACT_STO: now() },
      { transaction: t }
    );
    await repo.createMovimiento(
      { ID_PRO: idPro, TIP_MOV: "AJUSTE", CAN_MOV: n, MOT_MOV: "RESERVA" + (motivo ? `: ${motivo}` : ""), NUM_DOC_MOV: numDoc || null, CED_EMP: cedEmp || null },
      { transaction: t }
    );
    return s;
  });
}

export async function desreservar({ idPro, cantidad, motivo, numDoc, cedEmp }) {
  const n = toInt(cantidad);
  if (!idPro || n <= 0) throw serviceError("idPro y cantidad > 0 son obligatorios");

  return sequelize.transaction(async (t) => {
    const s = await repo.findByPk(idPro, { transaction: t, lock: t.LOCK.UPDATE });
    if (!s) throw serviceError("No existe stock del producto", 404);
    if (Number(s.CAN_RES_STO) < n) throw serviceError("No hay suficiente reservado para liberar", 409);

    await s.update(
      { CAN_RES_STO: Number(s.CAN_RES_STO) - n, CAN_DIS_STO: Number(s.CAN_DIS_STO) + n, FEC_ACT_STO: now() },
      { transaction: t }
    );
    await repo.createMovimiento(
      { ID_PRO: idPro, TIP_MOV: "AJUSTE", CAN_MOV: n, MOT_MOV: "DES-RESERVA" + (motivo ? `: ${motivo}` : ""), NUM_DOC_MOV: numDoc || null, CED_EMP: cedEmp || null },
      { transaction: t }
    );
    return s;
  });
}

export async function salidaDesdeReserva({ idPro, cantidad, motivo, numDoc, cedEmp }) {
  const n = toInt(cantidad);
  if (!idPro || n <= 0) throw serviceError("idPro y cantidad > 0 son obligatorios");

  return sequelize.transaction(async (t) => {
    const s = await repo.findByPk(idPro, { transaction: t, lock: t.LOCK.UPDATE });
    if (!s) throw serviceError("No existe stock del producto", 404);
    if (Number(s.CAN_RES_STO) < n) throw serviceError("No hay suficiente reservado para salida", 409);

    await s.update({ CAN_RES_STO: Number(s.CAN_RES_STO) - n, FEC_ACT_STO: now() }, { transaction: t });
    await repo.createMovimiento(
      { ID_PRO: idPro, TIP_MOV: "SALIDA", CAN_MOV: n, MOT_MOV: "SALIDA_RESERVA" + (motivo ? `: ${motivo}` : ""), NUM_DOC_MOV: numDoc || null, CED_EMP: cedEmp || null },
      { transaction: t }
    );
    return s;
  });
}

export async function ajustarDisponible({ idPro, delta, motivo, numDoc, cedEmp }) {
  const d = toInt(delta);
  if (!idPro || d === 0) throw serviceError("idPro y delta (≠ 0) son obligatorios");

  return sequelize.transaction(async (t) => {
    const s = await repo.findByPk(idPro, { transaction: t, lock: t.LOCK.UPDATE });
    if (!s) throw serviceError("No existe stock del producto", 404);
    if (Number(s.CAN_DIS_STO) + d < 0) throw serviceError("El ajuste no puede dejar disponible en negativo", 409);

    await s.update({ CAN_DIS_STO: Number(s.CAN_DIS_STO) + d, FEC_ACT_STO: now() }, { transaction: t });
    await repo.createMovimiento(
      { ID_PRO: idPro, TIP_MOV: "AJUSTE", CAN_MOV: Math.abs(d), MOT_MOV: (motivo || "AJUSTE") + ` (${d > 0 ? "+" : ""}${d})`, NUM_DOC_MOV: numDoc || null, CED_EMP: cedEmp || null },
      { transaction: t }
    );
    return s;
  });
}

export async function actualizarMinMax(id, min, max) {
  const minN = toInt(min, 0);
  const maxN = max != null ? toInt(max, 0) : null;
  if (minN < 0) throw serviceError("min inválido");
  if (maxN != null && maxN < minN) throw serviceError("max debe ser >= min");

  const s = await repo.findByPk(id);
  if (!s) throw serviceError("No existe stock del producto", 404);
  await s.update({ STO_MIN: minN, ...(maxN != null ? { STO_MAX: maxN } : {}), FEC_ACT_STO: now() });
  return s;
}

export async function actualizarUbicacion(id, ubicacion) {
  const s = await repo.findByPk(id);
  if (!s) throw serviceError("No existe stock del producto", 404);
  await s.update({ UBI_STO: ubicacion || null, FEC_ACT_STO: now() });
  return s;
}
