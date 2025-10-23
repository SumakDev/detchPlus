import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { PRODUCTOS, CATEGORIAS, MARCAS, MODELOS } from "../models/index.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadsDir = path.resolve(__dirname, "..", "uploads");

function deleteIfExists(filename) {
  if (!filename) return;
  const p = path.join(uploadsDir, filename);
  fs.promises.stat(p).then(() => fs.promises.unlink(p)).catch(() => {});
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
  return {
    ...plain,
    NOMBRE: computeNombre(plain),
  };
}

export async function getAll(req, res) {
  try {
    const { q, activo } = req.query;
    const where = {};
    if (activo === "true") where.ACT_PRO = true;
    if (activo === "false") where.ACT_PRO = false;
    if (q) {
      // búsqueda simple por código de barras o IMEI o descripción
      // Para LIKE con múltiples columnas, usar Op.or
      where[Symbol.for("or")] = undefined; // placeholder para indicar que podría usarse Op.or
    }

    const rows = await PRODUCTOS.findAll({
      where,
      order: [["FEC_ING_PRO", "DESC"], ["ID_PRO", "DESC"]],
      include: [
        { model: CATEGORIAS, as: "categoria", attributes: ["ID_CAT", "NOM_CAT"] },
        { model: MARCAS, as: "marca", attributes: ["ID_MAR", "NOM_MAR"] },
        { model: MODELOS, as: "modelo", attributes: ["ID_MOD", "NOM_MOD", "ID_MAR"] },
      ],
    });
    return res.json(rows.map(toUi));
  } catch (error) {
    console.error("productos.getAll", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}

export async function create(req, res) {
  try {
    const body = req.body || {};
    const file = req.file;

    // Validaciones relacionales
    const [cat, mar, mod] = await Promise.all([
      CATEGORIAS.findByPk(body.ID_CAT),
      MARCAS.findByPk(body.ID_MAR),
      body.ID_MOD ? MODELOS.findByPk(body.ID_MOD) : null,
    ]);

    if (!cat) return res.status(400).json({ error: "Categoría inválida" });
    if (!mar) return res.status(400).json({ error: "Marca inválida" });
    if (body.ID_MOD) {
      if (!mod) return res.status(400).json({ error: "Modelo inválido" });
      if (Number(mod.ID_MAR) !== Number(body.ID_MAR)) {
        return res.status(400).json({ error: "El modelo seleccionado no pertenece a la marca" });
      }
    }

    const created = await PRODUCTOS.create({
      COD_BAR_PRO: body.COD_BAR_PRO || null,
      IME_PRO: body.IME_PRO || null,
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
      IMG_URL: file ? file.filename : null,
    });

    const withInclude = await PRODUCTOS.findByPk(created.ID_PRO, {
      include: [
        { model: CATEGORIAS, as: "categoria", attributes: ["ID_CAT", "NOM_CAT"] },
        { model: MARCAS, as: "marca", attributes: ["ID_MAR", "NOM_MAR"] },
        { model: MODELOS, as: "modelo", attributes: ["ID_MOD", "NOM_MOD", "ID_MAR"] },
      ],
    });

    return res.status(201).json(toUi(withInclude));
  } catch (error) {
    console.error("productos.create", error);
    if (error?.name === "SequelizeUniqueConstraintError") {
      return res.status(409).json({ error: "Código de barras duplicado" });
    }
    return res.status(500).json({ error: "Internal server error" });
  }
}

export async function update(req, res) {
  try {
    const { id } = req.params;
    const body = req.body || {};
    const file = req.file;

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
          return res.status(400).json({ error: "El modelo seleccionado no pertenece a la marca" });
        }
      }
    }

    const prevImg = row.IMG_URL;

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
      IMG_URL: file ? file.filename : row.IMG_URL,
    });

    if (file && prevImg && prevImg !== row.IMG_URL) deleteIfExists(prevImg);

    const withInclude = await PRODUCTOS.findByPk(id, {
      include: [
        { model: CATEGORIAS, as: "categoria", attributes: ["ID_CAT", "NOM_CAT"] },
        { model: MARCAS, as: "marca", attributes: ["ID_MAR", "NOM_MAR"] },
        { model: MODELOS, as: "modelo", attributes: ["ID_MOD", "NOM_MOD", "ID_MAR"] },
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
    const img = row.IMG_URL;
    await row.destroy();
    if (img) deleteIfExists(img);
    return res.json({ message: "Eliminado correctamente" });
  } catch (error) {
    console.error("productos.remove", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}