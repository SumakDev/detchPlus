import { Op } from "sequelize";
import { SER_TEC, TECNICOS, CLIENTES } from "../models/index.js";

const defaultInclude = (like) => [
  { model: TECNICOS, as: "tecnico", attributes: ["ID_TEC", "NOM_TEC", "TEL_TEC", "EST_TEC"], required: false },
  {
    model: CLIENTES,
    as: "cliente",
    attributes: ["CED_CLI", "NOM_CLI", "APE_CLI", "NUM_CLI"],
    required: false,
    where: like
      ? {
          [Op.or]: [
            { CED_CLI: { [Op.like]: like } },
            { NOM_CLI: { [Op.like]: like } },
            { APE_CLI: { [Op.like]: like } },
          ],
        }
      : undefined,
  },
];

export async function findAll({ where = {}, like = null, page, limit } = {}) {
  return SER_TEC.findAll({
    where,
    include: defaultInclude(like),
    order: [["FEC_SER", "DESC"], ["NUM_SER", "DESC"]],
    ...(page && limit ? { offset: (Number(page) - 1) * Number(limit), limit: Number(limit) } : {}),
  });
}

export async function findByPkWithInclude(id) {
  return SER_TEC.findByPk(id, {
    include: [
      { model: TECNICOS, as: "tecnico", attributes: ["ID_TEC", "NOM_TEC", "TEL_TEC", "EST_TEC"] },
      { model: CLIENTES, as: "cliente", attributes: ["CED_CLI", "NOM_CLI", "APE_CLI", "NUM_CLI"] },
    ],
  });
}

export async function findByPk(id, options = {}) {
  return SER_TEC.findByPk(id, options);
}

export async function create(data) {
  return SER_TEC.create(data);
}

export async function findActiveTecnicos() {
  return TECNICOS.findAll({
    where: { EST_TEC: true },
    attributes: ["ID_TEC", "NOM_TEC", "TEL_TEC", "ESP_TEC"],
    order: [["NOM_TEC", "ASC"]],
  });
}

export async function findAllClientes() {
  return CLIENTES.findAll({
    attributes: ["CED_CLI", "NOM_CLI", "APE_CLI", "NUM_CLI"],
    order: [["NOM_CLI", "ASC"], ["APE_CLI", "ASC"]],
  });
}

export async function findTecnicoByPk(id) {
  return TECNICOS.findByPk(id);
}

export async function findClienteByCedula(cedula) {
  return CLIENTES.findOne({ where: { CED_CLI: cedula } });
}
