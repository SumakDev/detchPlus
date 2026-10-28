import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { Op } from "sequelize";
import sequelize from "../config/database.js";
import { PRODUCTOS, CATEGORIAS, MARCAS, MODELOS, STOCK, PRECIOS, DET_TELE, DET_REL, DET_CON, PROVEEDORES, MOV_INV } from "../models/index.js";
import { syncPhoneStock, computePhoneVariantsSummary } from "./det_tele.controller.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadsDir = path.resolve(__dirname, "..", "uploads");

function deleteIfExists(filename) {
  if (!filename) return;
  const p = path.join(uploadsDir, filename);
  fs.promises.stat(p).then(() => fs.promises.unlink(p)).catch(() => {});
}

function clampScore(val, def = 10) {
  if (val === undefined || val === null || val === "") return def;
  const n = Number(val);
  if (!Number.isFinite(n)) return def;
  return Math.max(1, Math.min(10, Math.round(n)));
}

function parseDetallesTelefono(raw) {
  if (!raw) return null;
  if (Array.isArray(raw)) return raw;
  if (typeof raw === "string") {
    try {
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : null;
    } catch {
      return null;
    }
  }
  return null;
}

function parseJsonObject(raw) {
  if (!raw) return null;
  if (typeof raw === "object" && !Array.isArray(raw)) return raw;
  if (typeof raw === "string") {
    try {
      const parsed = JSON.parse(raw);
      return parsed && typeof parsed === "object" && !Array.isArray(parsed) ? parsed : null;
    } catch {
      return null;
    }
  }
  return null;
}

async function upsertDetalleReloj(idPro, rawReloj, transaction = null) {
  const data = parseJsonObject(rawReloj);
  if (!data) return;
  const opts = transaction ? { transaction } : {};
  const tipRel = data.TIP_REL === "FITNESS_BAND" ? "FITNESS_BAND" : "SMART_WATCH";
  const payload = {
    ID_PRO: Number(idPro),
    TAM_REL: data.TAM_REL ? String(data.TAM_REL).trim() : null,
    COL_REL: data.COL_REL ? String(data.COL_REL).trim() : null,
    TIP_REL: tipRel,
  };
  const existing = await DET_REL.findByPk(Number(idPro), opts);
  if (existing) {
    await existing.update(payload, opts);
  } else {
    await DET_REL.create(payload, opts);
  }
}

async function upsertDetalleConsola(idPro, rawConsola, transaction = null) {
  const data = parseJsonObject(rawConsola);
  if (!data) return;
  const opts = transaction ? { transaction } : {};
  const numCon = Number(data.NUM_CON);
  const payload = {
    ID_PRO: Number(idPro),
    CAP_CON: data.CAP_CON ? String(data.CAP_CON).trim() : null,
    NUM_CON: Number.isFinite(numCon) && numCon >= 0 ? Math.round(numCon) : 1,
    EST_CON: data.EST_CON ? String(data.EST_CON).trim() : null,
    VER_CON: data.VER_CON ? String(data.VER_CON).trim() : null,
  };
  const existing = await DET_CON.findByPk(Number(idPro), opts);
  if (existing) {
    await existing.update(payload, opts);
  } else {
    await DET_CON.create(payload, opts);
  }
}

async function syncDetallesTelefonoList(idPro, rawDetalles, defaultEst = "NUEVO", defaultOrg = "COMPRA_NUEVA", transaction = null) {
  const list = parseDetallesTelefono(rawDetalles);
  if (!list) return;

  const opts = transaction ? { transaction } : {};

  // Validar IMEIs únicos dentro del lote enviado
  const seenImeis = new Set();
  for (const item of list) {
    const imei = item.IME_TEL ? String(item.IME_TEL).trim() : "";
    if (imei) {
      if (seenImeis.has(imei.toLowerCase())) {
        const err = new Error(`El IMEI "${imei}" está repetido en la lista de unidades del teléfono`);
        err.status = 400;
        throw err;
      }
      seenImeis.add(imei.toLowerCase());
    }
  }

  // Obtener unidades actuales en BD para este producto
  const existingRows = await DET_TELE.findAll({ where: { ID_PRO: Number(idPro) }, ...opts });
  const prevDisp = existingRows.filter((r) => (r.DIS_TEL || "DISPONIBLE") === "DISPONIBLE").length;
  const existingIds = new Set(existingRows.map((r) => Number(r.ID_DET_TEL)));
  const incomingIds = new Set(
    list.map((x) => (x.ID_DET_TEL ? Number(x.ID_DET_TEL) : null)).filter(Boolean)
  );

  // Eliminar unidades que fueron quitadas de la lista
  const toDeleteIds = [...existingIds].filter((id) => !incomingIds.has(id));
  if (toDeleteIds.length > 0) {
    await DET_TELE.destroy({
      where: { ID_DET_TEL: { [Op.in]: toDeleteIds }, ID_PRO: Number(idPro) },
      ...opts,
    });
  }

  // Insertar o actualizar cada unidad
  for (const item of list) {
    const idDet = item.ID_DET_TEL ? Number(item.ID_DET_TEL) : null;
    const imei = item.IME_TEL ? String(item.IME_TEL).trim() : null;

    if (imei) {
      const dupWhere = idDet
        ? { IME_TEL: imei, ID_DET_TEL: { [Op.ne]: idDet } }
        : { IME_TEL: imei };
      const dup = await DET_TELE.findOne({ where: dupWhere, ...opts });
      if (dup) {
        const err = new Error(`Ya existe un teléfono registrado con el IMEI "${imei}"`);
        err.status = 400;
        throw err;
      }
    }

    const payload = {
      ID_PRO: Number(idPro),
      IME_TEL: imei,
      COL_TEL: item.COL_TEL ? String(item.COL_TEL).trim() : null,
      ALM_TEL: item.ALM_TEL ? String(item.ALM_TEL).trim() : null,
      EST_FIS_TEL: item.EST_FIS_TEL || defaultEst || "NUEVO",
      ORG_TEL: item.ORG_TEL || defaultOrg || "COMPRA_NUEVA",
      EST_BAT_TEL: clampScore(item.EST_BAT_TEL, 10),
      EST_PAN_TEL: clampScore(item.EST_PAN_TEL, 10),
      EST_CAR_TEL: clampScore(item.EST_CAR_TEL, 10),
      EST_CAM_TEL: clampScore(item.EST_CAM_TEL, 10),
      EST_SOF_TEL: clampScore(item.EST_SOF_TEL, 10),
      ACC_INC_TEL: item.ACC_INC_TEL ? String(item.ACC_INC_TEL).trim() : null,
      DIS_TEL: item.DIS_TEL || "DISPONIBLE",
    };

    if (idDet && existingIds.has(idDet)) {
      await DET_TELE.update(payload, { where: { ID_DET_TEL: idDet, ID_PRO: Number(idPro) }, ...opts });
    } else {
      await DET_TELE.create({ ...payload, FEC_ING_TEL: new Date() }, opts);
    }
  }

  const syncedStock = await syncPhoneStock(idPro, transaction);
  const newDisp = Number(syncedStock?.CAN_DIS_STO ?? 0);
  if (newDisp > prevDisp) {
    await MOV_INV.create(
      {
        ID_PRO: Number(idPro),
        TIP_MOV: "ENTRADA",
        CAN_MOV: newDisp - prevDisp,
        MOT_MOV:
          existingRows.length === 0
            ? `ALTA_INICIAL_TEL (+${newDisp} unidades)`
            : `INGRESO_UNIDADES_TEL (+${newDisp - prevDisp} unidades desde Productos)`,
      },
      opts
    );
  } else if (newDisp < prevDisp) {
    await MOV_INV.create(
      {
        ID_PRO: Number(idPro),
        TIP_MOV: "SALIDA",
        CAN_MOV: prevDisp - newDisp,
        MOT_MOV: `BAJA_UNIDADES_TEL (-${prevDisp - newDisp} unidades desde Productos)`,
      },
      opts
    );
  }
}

function computeNombre(row) {
  const marca = row?.marca?.NOM_MAR;
  const modelo = row?.modelo?.NOM_MOD;
  if (marca || modelo) return [marca, modelo].filter(Boolean).join(" ");
  if (row?.DES_PRO) return String(row.DES_PRO).split("\n")[0].slice(0, 60);
  return row?.COD_BAR_PRO || `Producto ${row?.ID_PRO}`;
}

function toUi(row) {
  const plain = row.get ? row.get({ plain: true }) : row;
  const ventaPrice = plain.precios?.find?.((p) => p.TIP_PRE === "VENTA")?.VAL_PRE;
  const anyPrice = plain.precios?.[0]?.VAL_PRE;
  const precio = Number(ventaPrice || anyPrice || 0);

  const detallesTelefono = Array.isArray(plain.detallesTelefono) ? plain.detallesTelefono : [];
  const resumenVariantes = computePhoneVariantsSummary(detallesTelefono);

  const isPhone = Number(plain.ID_CAT) === 1 || plain.categoria?.NOM_CAT?.toUpperCase() === "TELEFONO";
  const stockDisp = isPhone
    ? detallesTelefono.filter((d) => (d.DIS_TEL || "DISPONIBLE") === "DISPONIBLE").length
    : (plain.stock?.CAN_DIS_STO ?? 0);

  return {
    ...plain,
    ID_PRV: plain.ID_PRV ?? null,
    proveedor: plain.proveedor || null,
    detalleReloj: plain.detalleReloj || null,
    detalleConsola: plain.detalleConsola || null,
    NOMBRE: computeNombre(plain),
    PRECIO_VENTA: precio,
    STOCK_DISPONIBLE: stockDisp,
    detallesTelefono,
    RESUMEN_VARIANTES: resumenVariantes,
  };
}

const fullInclude = [
  { model: CATEGORIAS, as: "categoria", attributes: ["ID_CAT", "NOM_CAT"], required: false },
  { model: MARCAS, as: "marca", attributes: ["ID_MAR", "NOM_MAR"], required: false },
  { model: MODELOS, as: "modelo", attributes: ["ID_MOD", "NOM_MOD", "ID_MAR"], required: false },
  { model: PROVEEDORES, as: "proveedor", required: false },
  { model: STOCK, as: "stock", required: false },
  { model: PRECIOS, as: "precios", required: false },
  { model: DET_TELE, as: "detallesTelefono", required: false },
  { model: DET_REL, as: "detalleReloj", required: false },
  { model: DET_CON, as: "detalleConsola", required: false },
];

export async function getAll(req, res) {
  try {
    const { q, activo } = req.query;
    const where = {};
    if (activo === "true") {
      where.ACT_PRO = true;
    } else if (activo === "false") {
      where.ACT_PRO = false;
    } else if (activo === "all") {
      // no filtrar por estado si se solicita all
    } else {
      where.ACT_PRO = true;
    }

    const rows = await PRODUCTOS.findAll({
      where,
      include: fullInclude,
      order: [
        ["FEC_ING_PRO", "DESC"],
        ["ID_PRO", "DESC"],
      ],
    });

    let mapped = rows.map(toUi);

    if (q && String(q).trim().length > 0) {
      const term = String(q).trim().toLowerCase();
      mapped = mapped.filter((p) => {
        const matchBase =
          String(p.ID_PRO).includes(term) ||
          (p.NOMBRE || "").toLowerCase().includes(term) ||
          (p.COD_BAR_PRO || "").toLowerCase().includes(term) ||
          (p.DES_PRO || "").toLowerCase().includes(term) ||
          (p.marca?.NOM_MAR || "").toLowerCase().includes(term) ||
          (p.modelo?.NOM_MOD || "").toLowerCase().includes(term);

        const matchPhoneUnit = (p.detallesTelefono || []).some(
          (d) =>
            (d.IME_TEL || "").toLowerCase().includes(term) ||
            (d.COL_TEL || "").toLowerCase().includes(term) ||
            (d.ALM_TEL || "").toLowerCase().includes(term)
        );

        return matchBase || matchPhoneUnit;
      });
    }

    return res.json(mapped);
  } catch (error) {
    console.error("productos.getAll", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}

// Memoria caché para deduplicación de creación de productos por doble clic (< 3 segundos)
const recentProductCreations = new Map();

function cleanOldProductCreations() {
  const nowMs = Date.now();
  for (const [key, item] of recentProductCreations.entries()) {
    if (nowMs - item.time > 5000) {
      recentProductCreations.delete(key);
    }
  }
}

export async function create(req, res) {
  const body = req.body || {};
  const file = req.file;
  console.log("POST /productos -> file?", !!file, "body keys:", Object.keys(body));

  cleanOldProductCreations();
  const dedupKey = `${body.ID_CAT}_${body.ID_MAR}_${body.ID_MOD || ""}_${(body.COD_BAR_PRO || "").trim()}_${(body.DES_PRO || "").trim()}_${body.PRECIO_VENTA || ""}`;
  const nowMs = Date.now();
  const lastCreation = recentProductCreations.get(dedupKey);
  if (lastCreation && nowMs - lastCreation.time < 3000) {
    console.warn(`[Anti-Doble-Click] Creación de producto duplicada bloqueada para "${body.DES_PRO || body.COD_BAR_PRO}"`);
    return res.status(200).json(toUi(lastCreation.product));
  }

  const t = await sequelize.transaction();
  try {
    const [cat, mar, mod] = await Promise.all([
      CATEGORIAS.findByPk(body.ID_CAT, { transaction: t }),
      MARCAS.findByPk(body.ID_MAR, { transaction: t }),
      body.ID_MOD ? MODELOS.findByPk(body.ID_MOD, { transaction: t }) : null,
    ]);
    if (!cat) {
      await t.rollback();
      return res.status(400).json({ error: "Categoría inválida" });
    }
    if (!mar) {
      await t.rollback();
      return res.status(400).json({ error: "Marca inválida" });
    }
    if (body.ID_MOD) {
      if (!mod) {
        await t.rollback();
        return res.status(400).json({ error: "Modelo inválido" });
      }
      if (Number(mod.ID_MAR) !== Number(body.ID_MAR)) {
        await t.rollback();
        return res.status(400).json({ error: "El modelo no pertenece a la marca seleccionada" });
      }
    }

    if (body.COD_BAR_PRO && String(body.COD_BAR_PRO).trim().length > 0) {
      const existingBar = await PRODUCTOS.findOne({
        where: { COD_BAR_PRO: String(body.COD_BAR_PRO).trim() },
        transaction: t,
      });
      if (existingBar) {
        await t.rollback();
        return res.status(400).json({ error: `Ya existe un producto con el código de barras "${body.COD_BAR_PRO}"` });
      }
    }

    const imgUrlToSave = file
      ? file.filename
      : body.IMG_URL && String(body.IMG_URL).trim().length > 0
      ? String(body.IMG_URL).trim()
      : null;

    const created = await PRODUCTOS.create(
      {
        COD_BAR_PRO: body.COD_BAR_PRO ? String(body.COD_BAR_PRO).trim() : null,
        ID_CAT: Number(body.ID_CAT),
        ID_MAR: Number(body.ID_MAR),
        ID_MOD: body.ID_MOD || null,
        DES_PRO: body.DES_PRO || null,
        ORG_PRO: body.ORG_PRO || "COMPRA_NUEVA",
        EST_PRO: body.EST_PRO || "NUEVO",
        FEC_ING_PRO: body.FEC_ING_PRO ? new Date(body.FEC_ING_PRO) : new Date(),
        ID_PRV: body.ID_PRV ? Number(body.ID_PRV) : null,
        ACT_PRO: body.ACT_PRO !== undefined ? String(body.ACT_PRO) === "true" || body.ACT_PRO === true : true,
        FEC_MOD_PRO: new Date(),
        IMG_URL: imgUrlToSave,
      },
      { transaction: t }
    );

    await STOCK.create(
      {
        ID_PRO: created.ID_PRO,
        CAN_DIS_STO: 0,
        CAN_RES_STO: 0,
        STO_MIN: 1,
        STO_MAX: 100,
        FEC_ACT_STO: new Date(),
      },
      { transaction: t }
    );

    // Si se enviaron unidades físicas de teléfono (DETALLES_TELEFONO), registrarlas y sincronizar STOCK
    if (body.DETALLES_TELEFONO) {
      await syncDetallesTelefonoList(
        created.ID_PRO,
        body.DETALLES_TELEFONO,
        created.EST_PRO,
        created.ORG_PRO,
        t
      );
    }

    const catNomUpper = (cat?.NOM_CAT || "").toUpperCase();
    const isReloj = Number(body.ID_CAT) === 2 || catNomUpper === "RELOJ";
    const isConsola = Number(body.ID_CAT) === 3 || catNomUpper === "CONSOLA";

    if (isReloj && body.DETALLE_RELOJ) {
      await upsertDetalleReloj(created.ID_PRO, body.DETALLE_RELOJ, t);
    }
    if (isConsola && body.DETALLE_CONSOLA) {
      await upsertDetalleConsola(created.ID_PRO, body.DETALLE_CONSOLA, t);
    }

    const precioVenta = Number(body.PRECIO_VENTA || body.PRECIO || body.VAL_PRE || 0);
    if (!isNaN(precioVenta) && precioVenta >= 0) {
      await PRECIOS.create(
        {
          ID_PRO: created.ID_PRO,
          TIP_PRE: "VENTA",
          VAL_PRE: precioVenta,
        },
        { transaction: t }
      );
    }

    const withInclude = await PRODUCTOS.findByPk(created.ID_PRO, {
      include: fullInclude,
      transaction: t,
    });

    await t.commit();
    recentProductCreations.set(dedupKey, { time: nowMs, product: withInclude });

    return res.status(201).json(toUi(withInclude));
  } catch (error) {
    await t.rollback();
    console.error("productos.create", error);
    if (error?.status) {
      return res.status(error.status).json({ error: error.message });
    }
    if (error?.name === "SequelizeUniqueConstraintError") {
      return res.status(409).json({ error: "Código de barras o IMEI duplicado" });
    }
    return res.status(500).json({ error: error?.message || "Internal server error" });
  }
}

export async function update(req, res) {
  const t = await sequelize.transaction();
  try {
    const { id } = req.params;
    const body = req.body || {};
    const file = req.file;
    console.log("PUT /productos/:id -> file?", !!file, "body keys:", Object.keys(body));
    const row = await PRODUCTOS.findByPk(id, { transaction: t });
    if (!row) {
      await t.rollback();
      return res.status(404).json({ error: "No encontrado" });
    }

    if (body.ID_MAR || body.ID_MOD) {
      const mar = body.ID_MAR ? await MARCAS.findByPk(body.ID_MAR, { transaction: t }) : null;
      const mod = body.ID_MOD ? await MODELOS.findByPk(body.ID_MOD, { transaction: t }) : null;
      if (body.ID_MAR && !mar) {
        await t.rollback();
        return res.status(400).json({ error: "Marca inválida" });
      }
      if (body.ID_MOD && !mod) {
        await t.rollback();
        return res.status(400).json({ error: "Modelo inválido" });
      }
      const effMar = Number(body.ID_MAR ?? row.ID_MAR);
      const effMod = body.ID_MOD ?? row.ID_MOD;
      if (effMod) {
        const checkMod = mod || (await MODELOS.findByPk(effMod, { transaction: t }));
        if (checkMod && Number(checkMod.ID_MAR) !== effMar) {
          await t.rollback();
          return res.status(400).json({ error: "El modelo no pertenece a la marca" });
        }
      }
    }

    const prevImg = row.IMG_URL;

    let nextImg = row.IMG_URL;
    if (file) {
      nextImg = file.filename;
    } else if (body.removeImage === "true" || body.removeImage === true) {
      nextImg = null;
    } else if (body.IMG_URL !== undefined) {
      const trimmed = String(body.IMG_URL || "").trim();
      nextImg = trimmed.length > 0 ? trimmed : null;
    }

    await row.update(
      {
        COD_BAR_PRO: body.COD_BAR_PRO ?? row.COD_BAR_PRO,
        ID_CAT: body.ID_CAT !== undefined ? Number(body.ID_CAT) : row.ID_CAT,
        ID_MAR: body.ID_MAR !== undefined ? Number(body.ID_MAR) : row.ID_MAR,
        ID_MOD: body.ID_MOD ?? row.ID_MOD,
        DES_PRO: body.DES_PRO ?? row.DES_PRO,
        ORG_PRO: body.ORG_PRO ?? row.ORG_PRO,
        EST_PRO: body.EST_PRO ?? row.EST_PRO,
        ID_PRV: body.ID_PRV !== undefined ? (body.ID_PRV ? Number(body.ID_PRV) : null) : row.ID_PRV,
        ACT_PRO: body.ACT_PRO !== undefined ? String(body.ACT_PRO) === "true" || body.ACT_PRO === true : row.ACT_PRO,
        FEC_MOD_PRO: new Date(),
        IMG_URL: nextImg,
      },
      { transaction: t }
    );

    if (body.DETALLES_TELEFONO !== undefined) {
      await syncDetallesTelefonoList(
        id,
        body.DETALLES_TELEFONO,
        row.EST_PRO,
        row.ORG_PRO,
        t
      );
    }

    const effCatId = body.ID_CAT !== undefined ? Number(body.ID_CAT) : Number(row.ID_CAT);
    const effCatObj = await CATEGORIAS.findByPk(effCatId, { transaction: t });
    const effCatNom = (effCatObj?.NOM_CAT || "").toUpperCase();
    const isRelojUpd = effCatId === 2 || effCatNom === "RELOJ";
    const isConsolaUpd = effCatId === 3 || effCatNom === "CONSOLA";

    if (isRelojUpd && body.DETALLE_RELOJ !== undefined) {
      await upsertDetalleReloj(id, body.DETALLE_RELOJ, t);
    }
    if (isConsolaUpd && body.DETALLE_CONSOLA !== undefined) {
      await upsertDetalleConsola(id, body.DETALLE_CONSOLA, t);
    }

    if (nextImg !== prevImg && prevImg && !prevImg.startsWith("http://") && !prevImg.startsWith("https://")) {
      deleteIfExists(prevImg);
    }

    if (body.PRECIO_VENTA !== undefined || body.PRECIO !== undefined) {
      const nuevoPrecio = Number(body.PRECIO_VENTA ?? body.PRECIO);
      if (!isNaN(nuevoPrecio) && nuevoPrecio >= 0) {
        const precioExistente = await PRECIOS.findOne({
          where: { ID_PRO: id, TIP_PRE: "VENTA" },
          transaction: t,
        });
        if (precioExistente) {
          await precioExistente.update({ VAL_PRE: nuevoPrecio }, { transaction: t });
        } else {
          await PRECIOS.create(
            {
              ID_PRO: Number(id),
              TIP_PRE: "VENTA",
              VAL_PRE: nuevoPrecio,
            },
            { transaction: t }
          );
        }
      }
    }

    const withInclude = await PRODUCTOS.findByPk(id, {
      include: fullInclude,
      transaction: t,
    });

    await t.commit();
    return res.json(toUi(withInclude));
  } catch (error) {
    await t.rollback();
    console.error("productos.update", error);
    if (error?.status) {
      return res.status(error.status).json({ error: error.message });
    }
    return res.status(500).json({ error: error?.message || "Internal server error" });
  }
}

export async function remove(req, res) {
  try {
    const { id } = req.params;
    const row = await PRODUCTOS.findByPk(id);
    if (!row) return res.status(404).json({ error: "No encontrado" });

    await row.update({ ACT_PRO: false });
    return res.json({ message: "Producto eliminado correctamente", ID_PRO: row.ID_PRO });
  } catch (error) {
    console.error("productos.remove", error);
    return res.status(500).json({ error: error?.message || "Internal server error" });
  }
}
