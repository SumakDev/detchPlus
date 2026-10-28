import crypto from "crypto";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { Op } from "sequelize";
import { USUARIOS, SES_USU, LOG_ACT_USU } from "../models/index.js";
import { sendVerificationEmail, sendPasswordResetEmail } from "../services/email.service.js";

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
    const verifyToken = crypto.randomBytes(32).toString("hex");

    const created = await USUARIOS.create({
      USR_USU: usuario,
      COR_USU: email,
      PAS_HAS_USU: hash,
      ID_ROL: DEFAULT_ROLE_ID, // fuerza rol 4
      TIPO_PERSONA: "CLIENTE",
      ID_PERSONA: "",
      NOM_USU: nombres,
      APE_USU: apellidos,
      EST_USU: "ACTIVO",
      COR_VER_USU: false,
      TOK_VER_USU: verifyToken,
      ACE_TER_USU: !!aceptaTerminos,
    });

    // Enviar correo de verificación de forma asíncrona
    const emailResult = await sendVerificationEmail(email, nombres, verifyToken);

    try {
      const ip = req.ip || req.headers["x-forwarded-for"] || req.socket?.remoteAddress || "127.0.0.1";
      const ua = req.headers["user-agent"] || "Browser";
      await SES_USU.create({
        ID_SES_USU: crypto.randomUUID(),
        ID_USU: created.ID_USU,
        IP_SES_USU: String(ip).slice(0, 45),
        UA_SES_USU: ua,
        FEC_INI_SES: new Date(),
        FEC_ULG_SES: new Date(),
        EXP_SES_USU: new Date(Date.now() + 7 * 24 * 3600 * 1000),
        ACT_SES_USU: true,
      });
      await LOG_ACT_USU.create({
        ID_USU: created.ID_USU,
        ACC_LOG_ACT_USU: "REGISTRO",
        DES_LOG_ACT_USU: `Registro de nuevo usuario: ${created.USR_USU} (${created.COR_USU})`,
        IP_LOG_ACT_USU: String(ip).slice(0, 45),
        UA_LOG_ACT_USU: ua,
        FEC_LOG_ACT_USU: new Date(),
      });
    } catch (auditErr) {
      console.error("Error registrando auditoría de registro:", auditErr);
    }

    const token = signToken(created);
    return res.status(201).json({
      token,
      user: toUserResponse(created),
      message: "Registro exitoso. Se ha enviado un correo de verificación.",
      emailPreview: emailResult.previewUrl,
    });
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

    const ip = req.ip || req.headers["x-forwarded-for"] || req.socket?.remoteAddress || "127.0.0.1";
    const ua = req.headers["user-agent"] || "Browser";

    await user.update({
      INT_FAL_USU: 0,
      FEC_ULG_USU: new Date(),
      IP_ULG_USU: String(ip).slice(0, 45),
      FEC_ACT_USU: new Date(),
    });

    try {
      await SES_USU.create({
        ID_SES_USU: crypto.randomUUID(),
        ID_USU: user.ID_USU,
        IP_SES_USU: String(ip).slice(0, 45),
        UA_SES_USU: ua,
        FEC_INI_SES: new Date(),
        FEC_ULG_SES: new Date(),
        EXP_SES_USU: new Date(Date.now() + 7 * 24 * 3600 * 1000),
        ACT_SES_USU: true,
      });
      await LOG_ACT_USU.create({
        ID_USU: user.ID_USU,
        ACC_LOG_ACT_USU: "LOGIN",
        DES_LOG_ACT_USU: `Inicio de sesión exitoso (${user.USR_USU})`,
        IP_LOG_ACT_USU: String(ip).slice(0, 45),
        UA_LOG_ACT_USU: ua,
        FEC_LOG_ACT_USU: new Date(),
      });
    } catch (auditErr) {
      console.error("Error registrando auditoría de login:", auditErr);
    }

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

// POST /api/auth/forgot-password
export async function forgotPassword(req, res) {
  try {
    const { email } = req.body || {};
    if (!email) return res.status(400).json({ error: "Debe ingresar su correo electrónico" });

    const user = await USUARIOS.findOne({
      where: { [Op.or]: [{ COR_USU: email.trim() }, { USR_USU: email.trim() }] },
    });

    // Por seguridad, si el usuario no existe no damos pistas, pero retornamos mensaje exitoso genérico
    if (!user) {
      return res.json({
        message: "Si tu correo está registrado, recibirás un enlace de recuperación en los próximos minutos.",
      });
    }

    const resetToken = crypto.randomBytes(32).toString("hex");
    await user.update({
      TOK_RES_USU: resetToken,
      FEC_ACT_USU: new Date(),
    });

    const emailResult = await sendPasswordResetEmail(user.COR_USU, user.NOM_USU, resetToken);

    return res.json({
      message: "Si tu correo está registrado, recibirás un enlace de recuperación en los próximos minutos.",
      emailPreview: emailResult.previewUrl,
    });
  } catch (error) {
    console.error("auth.forgotPassword", error);
    return res.status(500).json({ error: "Error al procesar la solicitud de recuperación" });
  }
}

// POST /api/auth/reset-password
export async function resetPassword(req, res) {
  try {
    const { token, password } = req.body || {};
    if (!token || !password) {
      return res.status(400).json({ error: "Token y nueva contraseña son obligatorios" });
    }
    if (password.length < 6) {
      return res.status(400).json({ error: "La contraseña debe tener al menos 6 caracteres" });
    }

    const user = await USUARIOS.findOne({ where: { TOK_RES_USU: token } });
    if (!user) {
      return res.status(400).json({ error: "El enlace de recuperación es inválido o ha expirado." });
    }

    const hash = await bcrypt.hash(password, 10);
    await user.update({
      PAS_HAS_USU: hash,
      TOK_RES_USU: null,
      INT_FAL_USU: 0,
      FEC_BLOQ_USU: null,
      FEC_ACT_USU: new Date(),
    });

    return res.json({ message: "¡Contraseña actualizada con éxito! Ya puedes iniciar sesión." });
  } catch (error) {
    console.error("auth.resetPassword", error);
    return res.status(500).json({ error: "Error al restablecer la contraseña" });
  }
}

// GET /api/auth/verify-email?token=... o POST /api/auth/verify-email
export async function verifyEmail(req, res) {
  try {
    const token = req.query?.token || req.body?.token;
    if (!token) return res.status(400).json({ error: "Token de verificación no proporcionado" });

    const user = await USUARIOS.findOne({ where: { TOK_VER_USU: token } });
    if (!user) {
      return res.status(400).json({ error: "El token de verificación es inválido o ya fue utilizado." });
    }

    await user.update({
      COR_VER_USU: true,
      TOK_VER_USU: null,
      FEC_ACT_USU: new Date(),
    });

    return res.json({
      message: "¡Correo electrónico verificado exitosamente!",
      user: toUserResponse(user),
    });
  } catch (error) {
    console.error("auth.verifyEmail", error);
    return res.status(500).json({ error: "Error al verificar el correo electrónico" });
  }
}

// POST /api/auth/resend-verification
export async function resendVerification(req, res) {
  try {
    const { email } = req.body || {};
    let user = null;

    // Verificar si viene token Bearer en cabecera
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith("Bearer ")) {
      try {
        const token = authHeader.split(" ")[1];
        const decoded = jwt.verify(token, JWT_SECRET);
        if (decoded?.sub) {
          user = await USUARIOS.findByPk(decoded.sub);
        }
      } catch {}
    }

    // Si no se obtuvo por sesión, buscar por email o usuario en body
    if (!user && email && String(email).trim()) {
      const target = String(email).trim();
      user = await USUARIOS.findOne({
        where: { [Op.or]: [{ COR_USU: target }, { USR_USU: target }] },
      });
    }

    if (!user) {
      return res.status(404).json({ error: "No se encontró el usuario o correo especificado." });
    }

    if (user.COR_VER_USU) {
      return res.json({ message: "Tu correo electrónico ya se encuentra verificado." });
    }

    // Generar nuevo token seguro y actualizar
    const verifyToken = crypto.randomBytes(32).toString("hex");
    await user.update({
      TOK_VER_USU: verifyToken,
      FEC_ACT_USU: new Date(),
    });

    const emailResult = await sendVerificationEmail(
      user.COR_USU,
      user.NOM_USU || user.USR_USU || "Cliente",
      verifyToken
    );

    return res.json({
      message: "Correo de verificación reenviado exitosamente. Por favor revisa tu bandeja de entrada o spam.",
      emailPreview: emailResult?.previewUrl || null,
    });
  } catch (error) {
    console.error("auth.resendVerification", error);
    return res.status(500).json({ error: "Error al reenviar el correo de verificación" });
  }
}