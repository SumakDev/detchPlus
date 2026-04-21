import { Op } from "sequelize";
import { USUARIOS } from "../models/index.js";

export async function findByUsernameOrEmail(usernameOrEmail) {
  return USUARIOS.findOne({
    where: { [Op.or]: [{ USR_USU: usernameOrEmail }, { COR_USU: usernameOrEmail }] },
  });
}

export async function findByUsernameAndEmail(username, email) {
  return USUARIOS.findOne({
    where: { [Op.or]: [{ USR_USU: username }, { COR_USU: email }] },
  });
}

export async function create(data) {
  return USUARIOS.create(data);
}
