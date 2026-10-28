import { Op } from "sequelize";
import { MOV_INV, PRODUCTOS, CATEGORIAS, MARCAS, MODELOS, EMPLEADOS } from "../models/index.js";

const movInclude = [
  {
    model: PRODUCTOS,
    as: "producto",
    attributes: ["ID_PRO", "DES_PRO", "COD_BAR_PRO", "ID_CAT", "ID_MAR", "ID_MOD", "ACT_PRO"],
    include: [
      { model: CATEGORIAS, as: "categoria", attributes: ["ID_CAT", "NOM_CAT"] },
      { model: MARCAS, as: "marca", attributes: ["ID_MAR", "NOM_MAR"] },
      { model: MODELOS, as: "modelo", attributes: ["ID_MOD", "NOM_MOD"] },
    ],
  },
  {
    model: EMPLEADOS,
    as: "empleado",
    attributes: ["CED_EMP", "NOM_EMP", "APE_EMP"],
  },
];

export async function getAll(req, res) {
  try {
    const { idPro, tipMov, q } = req.query;
    const where = {};
    if (idPro) where.ID_PRO = Number(idPro);
    if (tipMov) where.TIP_MOV = String(tipMov).toUpperCase();
    if (q) {
      where[Op.or] = [
        { MOT_MOV: { [Op.like]: `%${q}%` } },
        { NUM_DOC_MOV: { [Op.like]: `%${q}%` } },
      ];
    }

    const data = await MOV_INV.findAll({
      where,
      include: movInclude,
      order: [
        ["FEC_MOV", "DESC"],
        ["ID_MOV", "DESC"],
      ],
      limit: 500,
    });
    return res.json(data);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}

export async function getOne(req, res) {
  try {
    const data = await MOV_INV.findByPk(req.params.id, { include: movInclude });
    return data ? res.json(data) : res.status(404).json({ error: "No encontrado" });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}

export async function create(req, res) {
  try {
    const created = await MOV_INV.create(req.body);
    return res.status(201).json(created);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}

export async function update(req, res) {
  try {
    const [updated] = await MOV_INV.update(req.body, { where: { ID_MOV: req.params.id } });
    if (!updated) return res.status(404).json({ error: "No encontrado" });
    const refreshed = await MOV_INV.findByPk(req.params.id, { include: movInclude });
    return res.json(refreshed);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}

export async function remove(req, res) {
  try {
    const deleted = await MOV_INV.destroy({ where: { ID_MOV: req.params.id } });
    return deleted ? res.json({ message: "Eliminado correctamente" }) : res.status(404).json({ error: "No encontrado" });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
