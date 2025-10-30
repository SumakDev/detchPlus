import fs from "fs";
import path from "path";
import bcrypt from "bcryptjs";
import { USUARIOS } from "../models/index.js";

function sanitizeUser(u) {
  const p = u.get ? u.get({ plain: true }) : u;
  delete p.PAS_HAS_USU;
  delete p.TOK_RES_USU;
  delete p.TOK_VER_USU;
  return p;
}

function isValidEmail(x) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(x));
}

// GET /api/usuarios/me
export async function getMeProfile(req, res) {
  try {
    const user = await USUARIOS.findByPk(req.user.ID_USU, {
      attributes: ["ID_USU", "USR_USU", "COR_USU", "NOM_USU", "APE_USU", "TIPO_PERSONA", "ID_PERSONA", "ID_ROL", "EST_USU", "AVA_USU"],
    });
    if (!user) return res.status(401).json({ error: "No autenticado" });
    return res.json({ user: sanitizeUser(user) });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
}

// PUT /api/usuarios/me
export async function updateMeProfile(req, res) {
  try {
    const user = await USUARIOS.findByPk(req.user.ID_USU);
    if (!user) return res.status(401).json({ error: "No autenticado" });

    const { NOM_USU, APE_USU, COR_USU, USR_USU } = req.body || {};

    const patch = {};
    if (NOM_USU !== undefined) patch.NOM_USU = String(NOM_USU).trim();
    if (APE_USU !== undefined) patch.APE_USU = String(APE_USU).trim();
    if (COR_USU !== undefined) {
      if (COR_USU && !isValidEmail(COR_USU)) return res.status(400).json({ error: "Email inválido" });
      patch.COR_USU = COR_USU ? String(COR_USU).trim() : null;
    }
    if (USR_USU !== undefined) patch.USR_USU = String(USR_USU).trim();

    // Si cambia el usuario, valida unicidad
    if (patch.USR_USU && patch.USR_USU !== user.USR_USU) {
      const dup = await USUARIOS.findOne({ where: { USR_USU: patch.USR_USU } });
      if (dup) return res.status(409).json({ error: "Usuario ya en uso" });
    }
    // Si cambia el correo, puedes validar unicidad si tu esquema lo exige:
    // if (patch.COR_USU && patch.COR_USU !== user.COR_USU) { ... }

    await user.update(patch);

    const refreshed = await USUARIOS.findByPk(user.ID_USU, {
      attributes: ["ID_USU", "USR_USU", "COR_USU", "NOM_USU", "APE_USU", "TIPO_PERSONA", "ID_PERSONA", "ID_ROL", "EST_USU", "AVA_USU"],
    });
    return res.json({ user: sanitizeUser(refreshed) });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
}

// PATCH /api/usuarios/me/password   { current_password, new_password }
export async function changeMyPassword(req, res) {
  try {
    const { current_password, new_password } = req.body || {};
    if (!current_password || !new_password) {
      return res.status(400).json({ error: "Contraseñas requeridas" });
    }

    const user = await USUARIOS.findByPk(req.user.ID_USU);
    if (!user) return res.status(401).json({ error: "No autenticado" });

    const ok = await bcrypt.compare(current_password, user.PAS_HAS_USU);
    if (!ok) return res.status(400).json({ error: "Contraseña actual incorrecta" });

    if (String(new_password).length < 6) {
      return res.status(400).json({ error: "La nueva contraseña debe tener al menos 6 caracteres" });
    }

    const hash = await bcrypt.hash(String(new_password), 10);
    await user.update({ PAS_HAS_USU: hash });

    return res.json({ message: "Contraseña actualizada" });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
}

// POST /api/usuarios/me/avatar  (multipart/form-data, field: avatar)
export async function updateMyAvatar(req, res) {
  try {
    const user = await USUARIOS.findByPk(req.user.ID_USU);
    if (!user) return res.status(401).json({ error: "No autenticado" });

    if (!req.file) return res.status(400).json({ error: "Archivo avatar requerido" });

    // Borrar avatar anterior si existe y es archivo local
    try {
      if (user.AVA_USU) {
        const uploadsDir = path.resolve(process.cwd(), "uploads");
        const oldPath = path.join(uploadsDir, user.AVA_USU);
        if (oldPath.startsWith(uploadsDir) && fs.existsSync(oldPath)) {
          fs.unlinkSync(oldPath);
        }
      }
    } catch {}

    await user.update({ AVA_USU: req.file.filename });

    const refreshed = await USUARIOS.findByPk(user.ID_USU, {
      attributes: ["ID_USU", "USR_USU", "COR_USU", "NOM_USU", "APE_USU", "TIPO_PERSONA", "ID_PERSONA", "ID_ROL", "EST_USU", "AVA_USU"],
    });
    return res.json({ user: sanitizeUser(refreshed) });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
}