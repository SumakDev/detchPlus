import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { Op } from "sequelize";
import { USUARIOS } from "../models/index.js";

const JWT_SECRET = process.env.JWT_SECRET || "dev_secret_change_me";
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "1d";
const DEFAULT_ROLE_ID = parseInt(process.env.DEFAULT_ROLE_ID || "4", 10); // usuario web

function toUserResponse(row) {
  return {
    ID_USU: row.ID_USU,
    USUARIO: row.USR_USU,
    EMAIL: row.COR_USU,
    NOM_USU: row.NOM_USU,
    APE_USU: row.APE_USU,
    ID_ROL: row.ID_ROL,
    EST_USU: row.EST_USU,
    COR_VER_USU: !!row.COR_VER_USU,
    AVA_USU: row.AVA_USU || null,
    FEC_ULG_USU: row.FEC_ULG_USU || null,
  };
}

function signToken(user) {
  return jwt.sign(
    { sub: user.ID_USU, usr: user.USR_USU, rol: user.ID_ROL },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );
}

export async function register(req, res) {
  try {
    const { usuario, email, password, nombres, apellidos, aceptaTerminos } = req.body || {};
    if (!usuario || !email || !password || !nombres || !apellidos) {
      return res.status(400).json({ error: "usuario, email, password, nombres y apellidos son obligatorios" });
    }
    if (!aceptaTerminos) return res.status(400).json({ error: "Debe aceptar los términos y condiciones" });

    const existing = await USUARIOS.findOne({ where: { [Op.or]: [{ USR_USU: usuario }, { COR_USU: email }] } });
    if (existing) return res.status(409).json({ error: "Ya existe un usuario con ese usuario o email" });

    const hash = await bcrypt.hash(password, 10);
    const created = await USUARIOS.create({
      USR_USU: usuario,
      COR_USU: email,
      PAS_HAS_USU: hash,
      ID_ROL: DEFAULT_ROLE_ID, // fuerza rol 4
      NOM_USU: nombres,
      APE_USU: apellidos,
      ACE_TER_USU: !!aceptaTerminos,
    });

    const token = signToken(created);
    return res.status(201).json({ token, user: toUserResponse(created) });
  } catch (error) {
    console.error("auth.register", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}

function isLocked(user, minutes = 15) {
  if (!user.FEC_BLOQ_USU) return false;
  const lockedUntil = new Date(user.FEC_BLOQ_USU.getTime() + minutes * 60000);
  return new Date() < lockedUntil;
}

export async function login(req, res) {
  try {
    const { usuario, password } = req.body || {};
    if (!usuario || !password) return res.status(400).json({ error: "usuario y password son obligatorios" });

    const user = await USUARIOS.findOne({ where: { [Op.or]: [{ USR_USU: usuario }, { COR_USU: usuario }] } });
    if (!user) return res.status(401).json({ error: "Credenciales inválidas" });

    if (user.EST_USU === "BLOQUEADO" || isLocked(user, parseInt(process.env.LOGIN_LOCK_MINUTES || "15", 10))) {
      return res.status(423).json({ error: "Usuario bloqueado temporalmente. Intente más tarde." });
    }

    const ok = await bcrypt.compare(password, user.PAS_HAS_USU || "");
    if (!ok) {
      const intents = (user.INT_FAL_USU || 0) + 1;
      const patch = { INT_FAL_USU: intents, FEC_ACT_USU: new Date() };
      if (intents >= parseInt(process.env.LOGIN_MAX_ATTEMPTS || "5", 10)) patch.FEC_BLOQ_USU = new Date();
      await user.update(patch);
      return res.status(401).json({ error: "Credenciales inválidas" });
    }

    if (user.EST_USU === "INACTIVO") return res.status(403).json({ error: "Usuario inactivo" });

    await user.update({
      INT_FAL_USU: 0,
      FEC_ULG_USU: new Date(),
      IP_ULG_USU: req.ip || req.headers["x-forwarded-for"] || req.socket.remoteAddress || null,
      FEC_ACT_USU: new Date(),
    });

    const token = signToken(user);
    return res.json({ token, user: toUserResponse(user) });
  } catch (error) {
    console.error("auth.login", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}

export async function me(req, res) {
  try {
    if (!req.user) return res.status(401).json({ error: "No autenticado" });
    return res.json({ user: req.user });
  } catch {
    return res.status(500).json({ error: "Internal server error" });
  }
}