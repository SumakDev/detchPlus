import { Op } from "sequelize";
import { PRECIOS, PRODUCTOS, MARCAS, MODELOS } from "../models/index.js";

const TIPOS = ["COMPRA", "VENTA", "PARTE_PAGO"];

function asPlain(row) {
  return row.get ? row.get({ plain: true }) : row;
}

function decorate(rows) {
  return rows.map((r) => {
    const p = asPlain(r);
    const marca = p.producto?.marca?.NOM_MAR || "";
    const modelo = p.producto?.modelo?.NOM_MOD || "";
    return { ...p, productoNombre: [marca, modelo].filter(Boolean).join(" ").trim() || null };
  });
}

// GET /api/precios?q=&id_pro=&tip=
export async function getAll(req, res) {
  try {
    const { q, id_pro, tip } = req.query;
    const where = {};

    if (id_pro && !Number.isNaN(Number(id_pro))) where.ID_PRO = Number(id_pro);
    if (tip && TIPOS.includes(tip)) where.TIP_PRE = tip;

    // Para buscar por marca y modelo usamos path de include
    const havingOr = [];
    if (q) {
      const like = `%${q}%`;
      where[Op.or] = [
        { ID_PRE: { [Op.like]: like } },
        { ID_PRO: { [Op.like]: like } },
        { TIP_PRE: { [Op.like]: like } },
      ];
      // Nota: estas claves usan path de include
      havingOr.push(
        { "$producto->marca.NOM_MAR$": { [Op.like]: like } },
        { "$producto->modelo.NOM_MOD$": { [Op.like]: like } }
      );
    }

    const rows = await PRECIOS.findAll({
      where,
      include: [
        {
          model: PRODUCTOS,
          as: "producto",
          attributes: ["ID_PRO", "ID_MAR", "ID_MOD","IMG_URL"],
          include: [
            { model: MARCAS, as: "marca", attributes: ["NOM_MAR"] },
            { model: MODELOS, as: "modelo", attributes: ["NOM_MOD"] },
          ],
        },
      ],
      // Para que los filtros por include funcionen, usamos where en top-level si corresponde:
      ...(havingOr.length ? { having: { [Op.or]: havingOr } } : {}),
      order: [
        ["ID_PRO", "ASC"],
        ["TIP_PRE", "ASC"],
        ["ID_PRE", "DESC"],
      ],
      subQuery: false,
    });

    return res.json(decorate(rows));
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}

// GET /api/precios/:id
export async function getOne(req, res) {
  try {
    const data = await PRECIOS.findByPk(req.params.id, {
      include: [
        {
          model: PRODUCTOS,
          as: "producto",
          attributes: ["ID_PRO", "ID_MAR", "ID_MOD","IMG_URL"],
          include: [
            { model: MARCAS, as: "marca", attributes: ["NOM_MAR"] },
            { model: MODELOS, as: "modelo", attributes: ["NOM_MOD"] },
          ],
        },
      ],
    });
    return data ? res.json(decorate([data])[0]) : res.status(404).json({ error: "No encontrado" });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}

// GET /api/precios/producto/:id?tip=VENTA
export async function getByProducto(req, res) {
  try {
    const { id } = req.params;
    const { tip } = req.query;
    const where = { ID_PRO: Number(id) };
    if (tip && TIPOS.includes(tip)) where.TIP_PRE = tip;

    const rows = await PRECIOS.findAll({
      where,
      include: [
        {
          model: PRODUCTOS,
          as: "producto",
          attributes: ["ID_PRO", "ID_MAR", "ID_MOD","IMG_URL"],
          include: [
            { model: MARCAS, as: "marca", attributes: ["NOM_MAR"] },
            { model: MODELOS, as: "modelo", attributes: ["NOM_MOD"] },
          ],
        },
      ],
      order: [
        ["TIP_PRE", "ASC"],
        ["ID_PRE", "DESC"],
      ],
    });
    return res.json(decorate(rows));
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}

// POST /api/precios
export async function create(req, res) {
  try {
    const body = req.body || {};
    const { ID_PRO, TIP_PRE, VAL_PRE } = body;

    if (!ID_PRO) return res.status(400).json({ error: "ID_PRO es obligatorio" });
    if (!TIP_PRE || !["COMPRA", "VENTA", "PARTE_PAGO"].includes(TIP_PRE)) {
      return res.status(400).json({ error: "TIP_PRE inválido" });
    }
    const val = Number(VAL_PRE);
    if (Number.isNaN(val)) return res.status(400).json({ error: "VAL_PRE debe ser numérico" });

    if (PRODUCTOS) {
      const pro = await PRODUCTOS.findByPk(ID_PRO);
      if (!pro) return res.status(400).json({ error: "Producto no existe" });
    }

    const dup = await PRECIOS.findOne({ where: { ID_PRO: Number(ID_PRO), TIP_PRE } });
    if (dup) return res.status(409).json({ error: "Ya existe precio para ese tipo en el producto" });

    const created = await PRECIOS.create({ ID_PRO: Number(ID_PRO), TIP_PRE, VAL_PRE: val });
    const withProd = await PRECIOS.findByPk(created.ID_PRE, {
      include: [{ model: PRODUCTOS, as: "producto", attributes: ["ID_PRO"] }],
    });
    return res.status(201).json(asPlain(withProd));
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}

// PUT /api/precios/:id
export async function update(req, res) {
  try {
    const row = await PRECIOS.findByPk(req.params.id);
    if (!row) return res.status(404).json({ error: "No encontrado" });

    const { ID_PRO, TIP_PRE, VAL_PRE } = req.body || {};

    if (ID_PRO !== undefined && PRODUCTOS) {
      const pro = await PRODUCTOS.findByPk(ID_PRO);
      if (!pro) return res.status(400).json({ error: "Producto no existe" });
    }
    if (TIP_PRE !== undefined && !["COMPRA", "VENTA", "PARTE_PAGO"].includes(TIP_PRE)) {
      return res.status(400).json({ error: "TIP_PRE inválido" });
    }
    if (VAL_PRE !== undefined && Number.isNaN(Number(VAL_PRE))) {
      return res.status(400).json({ error: "VAL_PRE debe ser numérico" });
    }

    const newIDPRO = ID_PRO !== undefined ? Number(ID_PRO) : row.ID_PRO;
    const newTIP = TIP_PRE !== undefined ? TIP_PRE : row.TIP_PRE;
    if (newIDPRO !== row.ID_PRO || newTIP !== row.TIP_PRE) {
      const dup = await PRECIOS.findOne({ where: { ID_PRO: newIDPRO, TIP_PRE: newTIP } });
      if (dup) return res.status(409).json({ error: "Ya existe precio para ese tipo en el producto" });
    }

    await row.update({
      ID_PRO: newIDPRO,
      TIP_PRE: newTIP,
      VAL_PRE: VAL_PRE !== undefined ? Number(VAL_PRE) : row.VAL_PRE,
    });

    const withProd = await PRECIOS.findByPk(row.ID_PRE, {
      include: [{ model: PRODUCTOS, as: "producto", attributes: ["ID_PRO"] }],
    });

    return res.json(asPlain(withProd));
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}

// PUT /api/precios/producto/:id/tipo/:tipo  { VAL_PRE }
export async function upsertPorTipo(req, res) {
  try {
    const { id, tipo } = req.params;
    if (!["COMPRA", "VENTA", "PARTE_PAGO"].includes(tipo)) {
      return res.status(400).json({ error: "TIP_PRE inválido" });
    }
    const val = Number(req.body?.VAL_PRE);
    if (Number.isNaN(val)) return res.status(400).json({ error: "VAL_PRE debe ser numérico" });

    if (PRODUCTOS) {
      const pro = await PRODUCTOS.findByPk(id);
      if (!pro) return res.status(400).json({ error: "Producto no existe" });
    }

    let row = await PRECIOS.findOne({ where: { ID_PRO: Number(id), TIP_PRE: tipo } });
    if (!row) row = await PRECIOS.create({ ID_PRO: Number(id), TIP_PRE: tipo, VAL_PRE: val });
    else await row.update({ VAL_PRE: val });

    const withProd = await PRECIOS.findByPk(row.ID_PRE, {
      include: [{ model: PRODUCTOS, as: "producto", attributes: ["ID_PRO"] }],
    });

    return res.json(asPlain(withProd));
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}

// DELETE /api/precios/:id
export async function remove(req, res) {
  try {
    const deleted = await PRECIOS.destroy({ where: { ID_PRE: req.params.id } });
    return deleted ? res.json({ message: "Eliminado correctamente" }) : res.status(404).json({ error: "No encontrado" });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}