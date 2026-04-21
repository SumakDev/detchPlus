import { STOCK, MOV_INV, PRODUCTOS, CATEGORIAS, MARCAS, MODELOS } from "../models/index.js";

export async function findAll() {
  return STOCK.findAll({
    include: [{
      model: PRODUCTOS,
      as: "producto",
      include: [
        { model: CATEGORIAS, as: "categoria", attributes: ["ID_CAT", "NOM_CAT"] },
        { model: MARCAS, as: "marca", attributes: ["ID_MAR", "NOM_MAR"] },
        { model: MODELOS, as: "modelo", attributes: ["ID_MOD", "NOM_MOD"] },
      ],
    }],
    order: [["FEC_ACT_STO", "DESC"]],
  });
}

export async function findAllSummary() {
  return STOCK.findAll({ attributes: ["CAN_DIS_STO", "STO_MIN", "ID_PRO"] });
}

export async function findByPk(id, options = {}) {
  return STOCK.findByPk(id, options);
}

export async function createMovimiento(data, options = {}) {
  return MOV_INV.create(data, options);
}

export async function findMovimientos(where = {}) {
  return MOV_INV.findAll({ where, order: [["FEC_MOV", "DESC"]], limit: 300 });
}
