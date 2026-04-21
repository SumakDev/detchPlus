import sequelize from "../config/database.js";
import { CATEGORIAS, MARCAS, MODELOS, STOCK } from "../models/index.js";
import * as repo from "../repositories/productos.repository.js";

function serviceError(message, status = 400) {
  const err = new Error(message);
  err.status = status;
  return err;
}

export async function getProductos({ q, activo } = {}) {
  const where = {};
  if (activo === "true") where.ACT_PRO = true;
  if (activo === "false") where.ACT_PRO = false;
  const like = q ? `%${q}%` : null;
  return repo.findAll({ where, like });
}

export async function createProducto(body, file) {
  return sequelize.transaction(async (t) => {
    const [cat, mar, mod] = await Promise.all([
      CATEGORIAS.findByPk(body.ID_CAT, { transaction: t }),
      MARCAS.findByPk(body.ID_MAR, { transaction: t }),
      body.ID_MOD ? MODELOS.findByPk(body.ID_MOD, { transaction: t }) : null,
    ]);

    if (!cat) throw serviceError("Categoría inválida");
    if (!mar) throw serviceError("Marca inválida");
    if (body.ID_MOD) {
      if (!mod) throw serviceError("Modelo inválido");
      if (Number(mod.ID_MAR) !== Number(body.ID_MAR)) {
        throw serviceError("El modelo no pertenece a la marca seleccionada");
      }
    }

    const created = await repo.create(
      {
        COD_BAR_PRO: body.COD_BAR_PRO || null,
        IME_PRO: body.IME_PRO || null,
        ID_CAT: Number(body.ID_CAT),
        ID_MAR: Number(body.ID_MAR),
        ID_MOD: body.ID_MOD || null,
        DES_PRO: body.DES_PRO || null,
        ORG_PRO: body.ORG_PRO,
        EST_PRO: body.EST_PRO,
        FEC_ING_PRO: body.FEC_ING_PRO ? new Date(body.FEC_ING_PRO) : new Date(),
        ID_PRV: body.ID_PRV ? Number(body.ID_PRV) : null,
        ACT_PRO: body.ACT_PRO !== undefined ? (String(body.ACT_PRO) === "true" || body.ACT_PRO === true) : true,
        FEC_MOD_PRO: new Date(),
        IMG_URL: file ? file.filename : null,
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

    return repo.findByPkWithInclude(created.ID_PRO, { transaction: t });
  });
}

export async function updateProducto(id, body, file) {
  const row = await repo.findByPk(id);
  if (!row) throw serviceError("No encontrado", 404);

  if (body.ID_MAR || body.ID_MOD) {
    const mar = body.ID_MAR ? await MARCAS.findByPk(body.ID_MAR) : null;
    const mod = body.ID_MOD ? await MODELOS.findByPk(body.ID_MOD) : null;
    if (body.ID_MAR && !mar) throw serviceError("Marca inválida");
    if (body.ID_MOD && !mod) throw serviceError("Modelo inválido");
    const effMar = Number(body.ID_MAR ?? row.ID_MAR);
    const effMod = body.ID_MOD ?? row.ID_MOD;
    if (effMod) {
      const checkMod = mod || (await MODELOS.findByPk(effMod));
      if (checkMod && Number(checkMod.ID_MAR) !== effMar) {
        throw serviceError("El modelo no pertenece a la marca");
      }
    }
  }

  const prevImg = row.IMG_URL;

  await repo.update(row, {
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

  const result = await repo.findByPkWithInclude(id);
  return { result, prevImg: file && prevImg ? prevImg : null };
}

export async function deleteProducto(id) {
  const row = await repo.findByPk(id);
  if (!row) throw serviceError("No encontrado", 404);
  const img = row.IMG_URL;
  await repo.remove(row);
  return img;
}
