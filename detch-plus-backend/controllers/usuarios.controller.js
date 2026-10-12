import bcrypt from "bcryptjs";
import { Op } from "sequelize";
import { USUARIOS, ROLES } from "../models/index.js";

const USER_ATTRS = { exclude: ["PAS_HAS_USU"] };
const USER_INCLUDE = [{ model: ROLES, as: "rol", attributes: ["ID_ROL", "NOM_ROL", "DES_ROL"] }];

export async function getAll(req, res) {
  try {
    const { q, rol, est } = req.query;
    const where = {};
    if (rol) where.ID_ROL = Number(rol);
    if (est) where.EST_USU = est;
    if (q) {
      where[Op.or] = [
        { USR_USU: { [Op.like]: `%${q}%` } },
        { COR_USU: { [Op.like]: `%${q}%` } },
        { NOM_USU: { [Op.like]: `%${q}%` } },
        { APE_USU: { [Op.like]: `%${q}%` } },
      ];
    }

    const data = await USUARIOS.findAll({
      where,
      attributes: USER_ATTRS,
      include: USER_INCLUDE,
      order: [["ID_USU", "ASC"]],
    });
    return res.json(data);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}

export async function getOne(req, res) {
  try {
    const data = await USUARIOS.findByPk(req.params.id, {
      attributes: USER_ATTRS,
      include: USER_INCLUDE,
    });
    return data ? res.json(data) : res.status(404).json({ error: "No encontrado" });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}

export async function create(req, res) {
  try {
    const body = { ...req.body };
    if (body.password || body.PAS_HAS_USU) {
      body.PAS_HAS_USU = await bcrypt.hash(body.password || body.PAS_HAS_USU, 10);
      delete body.password;
    }
    if (!body.TIPO_PERSONA) body.TIPO_PERSONA = "CLIENTE";
    if (body.ID_PERSONA === undefined) body.ID_PERSONA = "";
    const created = await USUARIOS.create(body);
    const refreshed = await USUARIOS.findByPk(created.ID_USU, {
      attributes: USER_ATTRS,
      include: USER_INCLUDE,
    });
    return res.status(201).json(refreshed);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}

export async function update(req, res) {
  try {
    const body = { ...req.body };
    if (body.password) {
      body.PAS_HAS_USU = await bcrypt.hash(body.password, 10);
      delete body.password;
    }
    const [updated] = await USUARIOS.update(body, { where: { ID_USU: req.params.id } });
    if (!updated) return res.status(404).json({ error: "No encontrado" });
    const refreshed = await USUARIOS.findByPk(req.params.id, {
      attributes: USER_ATTRS,
      include: USER_INCLUDE,
    });
    return res.json(refreshed);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}

export async function remove(req, res) {
  try {
    const deleted = await USUARIOS.destroy({ where: { ID_USU: req.params.id } });
    return deleted ? res.json({ message: "Eliminado correctamente" }) : res.status(404).json({ error: "No encontrado" });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
