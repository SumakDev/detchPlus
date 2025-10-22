import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { Op } from "sequelize";
import { USUARIOS } from "../models/index.js";

const JWT_SECRET = process.env.JWT_SECRET || "dev_secret_change_me";
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "1d";
const DEFAULT_ROLE_ID = parseInt(process.env.DEFAULT_ROLE_ID || "2", 10); // ajusta el rol por defecto
const LOGIN_MAX_ATTEMPTS = parseInt(process.env.LOGIN_MAX_ATTEMPTS || "5", 10);
const LOGIN_LOCK_MINUTES = parseInt(process.env.LOGIN_LOCK_MINUTES || "15", 10);

function toUserResponse(row) {
  return {
    id: row.ID_USU,
    usuario: row.USR_USU,
    email: row.COR_USU,
    nombres: row.NOM_USU,
    apellidos: row.APE_USU,
    rol: row.ID_ROL,
    estado: row.EST_USU,
    correoVerificado: !!row.COR_VER_USU,
    avatar: row.AVA_USU || null,
    ultimoLogin: row.FEC_ULG_USU || null,
  };
}

function signToken(user) {
  const payload = { sub: user.ID_USU, usr: user.USR_USU, rol: user.ID_ROL };
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

export async function register(req, res) {
  try {
    const {
      usuario, // USR_USU
      email,   // COR_USU
      password,
      nombres, // NOM_USU
      apellidos, // APE_USU
      aceptaTerminos, // ACE_TER_USU (boolean)
    } = req.body || {};

    if (!usuario || !email || !password || !nombres || !apellidos) {
      return res.status(400).json({ error: "usuario, email, password, nombres y apellidos son obligatorios" });
    }
    if (!aceptaTerminos) {
      return res.status(400).json({ error: "Debe aceptar los términos y condiciones" });
    }

    const existing = await USUARIOS.findOne({
      where: {
        [Op.or]: [{ USR_USU: usuario }, { COR_USU: email }],
      },
    });
    if (existing) {
      const conflictField = existing.USR_USU === usuario ? "usuario" : "email";
      return res.status(409).json({ error: `Ya existe un usuario con ese ${conflictField}` });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const created = await USUARIOS.create({
      USR_USU: usuario,
      COR_USU: email,
      PAS_HAS_USU: passwordHash,
      ID_ROL: DEFAULT_ROLE_ID,
      NOM_USU: nombres,
      APE_USU: apellidos,
      ACE_TER_USU: !!aceptaTerminos,
      // El resto queda con defaults del modelo: EST_USU="PEND_VER", FEC_REG_USU=NOW, FEC_ACT_USU=NOW, etc.
    });

    const token = signToken(created);
    return res.status(201).json({ token, user: toUserResponse(created) });
  } catch (error) {
    console.error("auth.register error:", error);
    // Unique/validation feedback
    if (error?.name === "SequelizeUniqueConstraintError") {
      const field = error?.errors?.[0]?.path || "unique";
      return res.status(409).json({ error: `Registro duplicado en ${field}` });
    }
    if (error?.name === "SequelizeValidationError") {
      return res.status(400).json({ error: "Validation error", details: error.errors?.map(e => ({ path: e.path, message: e.message })) });
    }
    return res.status(500).json({ error: "Internal server error" });
  }
}

function isLocked(user) {
  if (!user.FEC_BLOQ_USU) return false;
  const lockedUntil = new Date(user.FEC_BLOQ_USU.getTime() + LOGIN_LOCK_MINUTES * 60000);
  return new Date() < lockedUntil;
}

export async function login(req, res) {
  try {
    const { usuario, password } = req.body || {};
    if (!usuario || !password) {
      return res.status(400).json({ error: "usuario y password son obligatorios" });
    }

    const user = await USUARIOS.findOne({
      where: {
        [Op.or]: [{ USR_USU: usuario }, { COR_USU: usuario }],
      },
    });
    if (!user) return res.status(401).json({ error: "Credenciales inválidas" });

    if (user.EST_USU === "BLOQUEADO" || isLocked(user)) {
      return res.status(423).json({ error: "Usuario bloqueado temporalmente. Intente más tarde." });
    }

    const ok = await bcrypt.compare(password, user.PAS_HAS_USU || "");
    if (!ok) {
      const intents = (user.INT_FAL_USU || 0) + 1;
      const patch = { INT_FAL_USU: intents, FEC_ACT_USU: new Date() };
      if (intents >= LOGIN_MAX_ATTEMPTS) patch.FEC_BLOQ_USU = new Date();
      await user.update(patch);
      return res.status(401).json({ error: "Credenciales inválidas" });
    }

    if (user.EST_USU === "INACTIVO") {
      return res.status(403).json({ error: "Usuario inactivo" });
    }

    await user.update({
      INT_FAL_USU: 0,
      FEC_ULG_USU: new Date(),
      IP_ULG_USU: req.ip || req.headers["x-forwarded-for"] || req.socket.remoteAddress || null,
      FEC_ACT_USU: new Date(),
    });

    const token = signToken(user);
    return res.json({ token, user: toUserResponse(user) });
  } catch (error) {
    console.error("auth.login error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}