import { Op } from "sequelize";
import { CATEGORIAS, MARCAS, MODELOS } from "../models/index.js";

export async function getCategorias(req, res) {
  try {
    const { q } = req.query;
    const where = {};
    // NOM_CAT es ENUM, así que filtrar por LIKE solo aplica a DES_CAT
    if (q) {
      where.DES_CAT = { [Op.like]: `%${q}%` };
    }
    const rows = await CATEGORIAS.findAll({ where, order: [["NOM_CAT", "ASC"]] });
    return res.json(rows);
  } catch (e) {
    return res.status(500).json({ error: "Internal server error" });
  }
}

export async function getMarcas(req, res) {
  try {
    const { q } = req.query;
    const where = {};
    if (q) where.NOM_MAR = { [Op.like]: `%${q}%` };
    const rows = await MARCAS.findAll({ where, order: [["NOM_MAR", "ASC"]] });
    return res.json(rows);
  } catch (e) {
    return res.status(500).json({ error: "Internal server error" });
  }
}

export async function getModelos(req, res) {
  try {
    const { idMarca, q } = req.query;
    const where = {};
    if (idMarca) where.ID_MAR = Number(idMarca);
    if (q) where.NOM_MOD = { [Op.like]: `%${q}%` };

    const rows = await MODELOS.findAll({
      where,
      order: [["NOM_MOD", "ASC"]],
      include: [{ model: MARCAS, as: "marca", attributes: ["ID_MAR", "NOM_MAR"] }],
    });
    return res.json(rows);
  } catch (e) {
    return res.status(500).json({ error: "Internal server error" });
  }
}