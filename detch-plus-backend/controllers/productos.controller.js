import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { Op } from "sequelize";
import sequelize from "../config/database.js";
import { PRODUCTOS, CATEGORIAS, MARCAS, MODELOS, STOCK, PRECIOS } from "../models/index.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadsDir = path.resolve(__dirname, "..", "uploads");

function deleteIfExists(filename) {
  if (!filename) return;
  const p = path.join(uploadsDir, filename);
  fs.promises.stat(p).then(() => fs.promises.unlink(p)).catch(() => { });
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
  const ventaPrice = plain.precios?.find?.(p => p.TIP_PRE === "VENTA")?.VAL_PRE;
  const anyPrice = plain.precios?.[0]?.VAL_PRE;
  const precio = Number(ventaPrice || anyPrice || 0);

  return {
    ...plain,
    NOMBRE: computeNombre(plain),
    PRECIO_VENTA: precio,
    STOCK_DISPONIBLE: plain.stock?.CAN_DIS_STO ?? 0,
  };
}

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
      // Por defecto solo productos activos (no eliminados lógicamente)
      where.ACT_PRO = true;
    }

    // Filtros por texto
    const like = q ? `%${q}%` : null;
    const include = [
      { model: CATEGORIAS, as: "categoria", attributes: ["ID_CAT", "NOM_CAT"], required: false },
      { model: MARCAS, as: "marca", attributes: ["ID_MAR", "NOM_MAR"], required: false },
      { model: MODELOS, as: "modelo", attributes: ["ID_MOD", "NOM_MOD", "ID_MAR"], required: false },
      { model: STOCK, as: "stock", required: false },
      { model: PRECIOS, as: "precios", required: false },
    ];

    const rows = await PRODUCTOS.findAll({
      where: like
        ? {
          ...where,
          [Op.or]: [
            { COD_BAR_PRO: { [Op.like]: like } },
            { IME_PRO: { [Op.like]: like } },
            { DES_PRO: { [Op.like]: like } },
            // Campos de las relaciones incluidas
            { "$marca.NOM_MAR$": { [Op.like]: like } },
            { "$modelo.NOM_MOD$": { [Op.like]: like } },
          ],
        }
        : where,
      include,
      order: [
        ["FEC_ING_PRO", "DESC"],
        ["ID_PRO", "DESC"],
      ],
    });

    return res.json(rows.map(toUi));
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

  // Detección de doble click concurrente (mismos datos en < 3 segundos)
  cleanOldProductCreations();
  const dedupKey = `${body.ID_CAT}_${body.ID_MAR}_${body.ID_MOD || ""}_${(body.COD_BAR_PRO || "").trim()}_${(body.DES_PRO || "").trim()}_${body.PRECIO_VENTA || ""}`;
  const nowMs = Date.now();
  const lastCreation = recentProductCreations.get(dedupKey);
  if (lastCreation && (nowMs - lastCreation.time < 3000)) {
    console.warn(`[Anti-Doble-Click] Creación de producto duplicada bloqueada para "${body.DES_PRO || body.COD_BAR_PRO}"`);
    return res.status(200).json(toUi(lastCreation.product));
  }

  const t = await sequelize.transaction();
  try {
    // Validaciones relacionales
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

    // Validar código de barras duplicado antes de insertar
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

    // Validar IMEI duplicado si fue provisto
    if (body.IME_PRO && String(body.IME_PRO).trim().length > 0) {
      const existingImei = await PRODUCTOS.findOne({
        where: { IME_PRO: String(body.IME_PRO).trim() },
        transaction: t,
      });
      if (existingImei) {
        await t.rollback();
        return res.status(400).json({ error: `Ya existe un producto con el IMEI "${body.IME_PRO}"` });
      }
    }

    const imgUrlToSave = file
      ? file.filename
      : (body.IMG_URL && String(body.IMG_URL).trim().length > 0 ? String(body.IMG_URL).trim() : null);

    const created = await PRODUCTOS.create(
      {
        COD_BAR_PRO: body.COD_BAR_PRO ? String(body.COD_BAR_PRO).trim() : null,
        IME_PRO: body.IME_PRO ? String(body.IME_PRO).trim() : null,
        ID_CAT: Number(body.ID_CAT),
        ID_MAR: Number(body.ID_MAR),
        ID_MOD: body.ID_MOD || null,
        DES_PRO: body.DES_PRO || null,
        ORG_PRO: body.ORG_PRO, // COMPRA_NUEVA | PARTE_PAGO | CONSIGNACION
        EST_PRO: body.EST_PRO, // NUEVO | USADO_EXCELENTE | USADO_BUENO | USADO_REGULAR
        FEC_ING_PRO: body.FEC_ING_PRO ? new Date(body.FEC_ING_PRO) : new Date(),
        ID_PRV: body.ID_PRV ? Number(body.ID_PRV) : null,
        ACT_PRO: body.ACT_PRO !== undefined ? (String(body.ACT_PRO) === "true" || body.ACT_PRO === true) : true,
        FEC_MOD_PRO: new Date(),
        IMG_URL: imgUrlToSave,
      },
      { transaction: t }
    );

    // Asegurar fila de stock
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

    // Asegurar precio de venta en PRECIOS
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
      include: [
        { model: CATEGORIAS, as: "categoria", attributes: ["ID_CAT", "NOM_CAT"] },
        { model: MARCAS, as: "marca", attributes: ["ID_MAR", "NOM_MAR"] },
        { model: MODELOS, as: "modelo", attributes: ["ID_MOD", "NOM_MOD", "ID_MAR"] },
        { model: STOCK, as: "stock" },
        { model: PRECIOS, as: "precios" },
      ],
      transaction: t,
    });

    await t.commit();

    // Guardar en la caché de deduplicación para responder idempotentemente
    recentProductCreations.set(dedupKey, { time: nowMs, product: withInclude });

    return res.status(201).json(toUi(withInclude));
  } catch (error) {
    await t.rollback();
    console.error("productos.create", error);
    if (error?.name === "SequelizeUniqueConstraintError") {
      return res.status(409).json({ error: "Código de barras o identificador duplicado" });
    }
    return res.status(500).json({ error: "Internal server error" });
  }
}

export async function update(req, res) {
  try {
    const { id } = req.params;
    const body = req.body || {};
    const file = req.file;
    console.log("PUT /productos/:id -> file?", !!file, "body keys:", Object.keys(body));
    const row = await PRODUCTOS.findByPk(id);
    if (!row) return res.status(404).json({ error: "No encontrado" });

    // Validaciones si cambian relaciones
    if (body.ID_MAR || body.ID_MOD) {
      const mar = body.ID_MAR ? await MARCAS.findByPk(body.ID_MAR) : null;
      const mod = body.ID_MOD ? await MODELOS.findByPk(body.ID_MOD) : null;
      if (body.ID_MAR && !mar) return res.status(400).json({ error: "Marca inválida" });
      if (body.ID_MOD && !mod) return res.status(400).json({ error: "Modelo inválido" });
      const effMar = Number(body.ID_MAR ?? row.ID_MAR);
      const effMod = body.ID_MOD ?? row.ID_MOD;
      if (effMod) {
        const checkMod = mod || (await MODELOS.findByPk(effMod));
        if (checkMod && Number(checkMod.ID_MAR) !== effMar) {
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

    await row.update({
      COD_BAR_PRO: body.COD_BAR_PRO ?? row.COD_BAR_PRO,
      IME_PRO: body.IME_PRO ?? row.IME_PRO,
      ID_CAT: body.ID_CAT !== undefined ? Number(body.ID_CAT) : row.ID_CAT,
      ID_MAR: body.ID_MAR !== undefined ? Number(body.ID_MAR) : row.ID_MAR,
      ID_MOD: body.ID_MOD ?? row.ID_MOD,
      DES_PRO: body.DES_PRO ?? row.DES_PRO,
      ORG_PRO: body.ORG_PRO ?? row.ORG_PRO,
      EST_PRO: body.EST_PRO ?? row.EST_PRO,
      ID_PRV: body.ID_PRV !== undefined ? Number(body.ID_PRV) : row.ID_PRV,
      ACT_PRO: body.ACT_PRO !== undefined ? (String(body.ACT_PRO) === "true" || body.ACT_PRO === true) : row.ACT_PRO,
      FEC_MOD_PRO: new Date(),
      IMG_URL: nextImg,
    });

    if (nextImg !== prevImg && prevImg && !prevImg.startsWith("http://") && !prevImg.startsWith("https://")) {
      deleteIfExists(prevImg);
    }

    // Actualizar o crear precio de venta en PRECIOS
    if (body.PRECIO_VENTA !== undefined || body.PRECIO !== undefined) {
      const nuevoPrecio = Number(body.PRECIO_VENTA ?? body.PRECIO);
      if (!isNaN(nuevoPrecio) && nuevoPrecio >= 0) {
        const precioExistente = await PRECIOS.findOne({
          where: { ID_PRO: id, TIP_PRE: "VENTA" },
        });
        if (precioExistente) {
          await precioExistente.update({ VAL_PRE: nuevoPrecio });
        } else {
          await PRECIOS.create({
            ID_PRO: Number(id),
            TIP_PRE: "VENTA",
            VAL_PRE: nuevoPrecio,
          });
        }
      }
    }

    const withInclude = await PRODUCTOS.findByPk(id, {
      include: [
        { model: CATEGORIAS, as: "categoria", attributes: ["ID_CAT", "NOM_CAT"] },
        { model: MARCAS, as: "marca", attributes: ["ID_MAR", "NOM_MAR"] },
        { model: MODELOS, as: "modelo", attributes: ["ID_MOD", "NOM_MOD", "ID_MAR"] },
        { model: STOCK, as: "stock" },
        { model: PRECIOS, as: "precios" },
      ],
    });

    return res.json(toUi(withInclude));
  } catch (error) {
    console.error("productos.update", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}

export async function remove(req, res) {
  try {
    const { id } = req.params;
    const row = await PRODUCTOS.findByPk(id);
    if (!row) return res.status(404).json({ error: "No encontrado" });

    // Eliminación lógica: marcamos como inactivo para preservar la consistencia relacional e histórica
    await row.update({ ACT_PRO: false });
    return res.json({ message: "Producto eliminado correctamente", ID_PRO: row.ID_PRO });
  } catch (error) {
    console.error("productos.remove", error);
    return res.status(500).json({ error: error?.message || "Internal server error" });
  }
}