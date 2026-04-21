import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import * as repo from "../repositories/auth.repository.js";

const JWT_SECRET = process.env.JWT_SECRET || "dev_secret_change_me";
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "1d";
const DEFAULT_ROLE_ID = parseInt(process.env.DEFAULT_ROLE_ID || "4", 10);

function serviceError(message, status = 400) {
  const err = new Error(message);
  err.status = status;
  return err;
}

export function signToken(user) {
  return jwt.sign(
    { sub: user.ID_USU, usr: user.USR_USU, rol: user.ID_ROL },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );
}

function isLocked(user, minutes = 15) {
  if (!user.FEC_BLOQ_USU) return false;
  const lockedUntil = new Date(user.FEC_BLOQ_USU.getTime() + minutes * 60000);
  return new Date() < lockedUntil;
}

export async function register({ usuario, email, password, nombres, apellidos, aceptaTerminos }) {
  if (!usuario || !email || !password || !nombres || !apellidos) {
    throw serviceError("usuario, email, password, nombres y apellidos son obligatorios");
  }
  if (!aceptaTerminos) throw serviceError("Debe aceptar los términos y condiciones");

  const existing = await repo.findByUsernameAndEmail(usuario, email);
  if (existing) throw serviceError("Ya existe un usuario con ese usuario o email", 409);

  const hash = await bcrypt.hash(password, 10);
  const created = await repo.create({
    USR_USU: usuario,
    COR_USU: email,
    PAS_HAS_USU: hash,
    ID_ROL: DEFAULT_ROLE_ID,
    NOM_USU: nombres,
    APE_USU: apellidos,
    ACE_TER_USU: !!aceptaTerminos,
  });

  const token = signToken(created);
  return { token, user: created };
}

export async function login({ usuario, password }, ip = null) {
  if (!usuario || !password) throw serviceError("usuario y password son obligatorios");

  const user = await repo.findByUsernameOrEmail(usuario);
  if (!user) throw serviceError("Credenciales inválidas", 401);

  if (user.EST_USU === "BLOQUEADO" || isLocked(user, parseInt(process.env.LOGIN_LOCK_MINUTES || "15", 10))) {
    throw serviceError("Usuario bloqueado temporalmente. Intente más tarde.", 423);
  }

  const ok = await bcrypt.compare(password, user.PAS_HAS_USU || "");
  if (!ok) {
    const intents = (user.INT_FAL_USU || 0) + 1;
    const patch = { INT_FAL_USU: intents, FEC_ACT_USU: new Date() };
    if (intents >= parseInt(process.env.LOGIN_MAX_ATTEMPTS || "5", 10)) patch.FEC_BLOQ_USU = new Date();
    await user.update(patch);
    throw serviceError("Credenciales inválidas", 401);
  }

  if (user.EST_USU === "INACTIVO") throw serviceError("Usuario inactivo", 403);

  await user.update({
    INT_FAL_USU: 0,
    FEC_ULG_USU: new Date(),
    IP_ULG_USU: ip,
    FEC_ACT_USU: new Date(),
  });

  const token = signToken(user);
  return { token, user };
}
