import { Op } from "sequelize";
import { PRODUCTOS, CATEGORIAS, MARCAS, MODELOS } from "../models/index.js";

const defaultInclude = [
  { model: CATEGORIAS, as: "categoria", attributes: ["ID_CAT", "NOM_CAT"], required: false },
  { model: MARCAS, as: "marca", attributes: ["ID_MAR", "NOM_MAR"], required: false },
  { model: MODELOS, as: "modelo", attributes: ["ID_MOD", "NOM_MOD", "ID_MAR"], required: false },
];

export async function findAll({ where = {}, like = null } = {}) {
  return PRODUCTOS.findAll({
    where: like
      ? {
          ...where,
          [Op.or]: [
            { COD_BAR_PRO: { [Op.like]: like } },
            { IME_PRO: { [Op.like]: like } },
            { DES_PRO: { [Op.like]: like } },
            { "$marca.NOM_MAR$": { [Op.like]: like } },
            { "$modelo.NOM_MOD$": { [Op.like]: like } },
          ],
        }
      : where,
    include: defaultInclude,
    order: [["FEC_ING_PRO", "DESC"], ["ID_PRO", "DESC"]],
  });
}

export async function findByPkWithInclude(id, options = {}) {
  return PRODUCTOS.findByPk(id, { include: defaultInclude, ...options });
}

export async function create(data, options = {}) {
  return PRODUCTOS.create(data, options);
}

export async function update(instance, data) {
  return instance.update(data);
}

export async function remove(instance) {
  return instance.destroy();
}

export async function findByPk(id, options = {}) {
  return PRODUCTOS.findByPk(id, options);
}
