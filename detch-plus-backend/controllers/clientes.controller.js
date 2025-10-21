import { CLIENTES } from "../models/index.js";

// Utilidad: normaliza payload y da default a FEC_REG_CLI si la BD lo exige
function normalizePayload(body = {}) {
  const payload = { ...body };
  if (!payload.FEC_REG_CLI) payload.FEC_REG_CLI = new Date(); // quita si tu columna tiene default en la BD
  return payload;
}

export async function getAll(req, res) {
  try {
    const data = await CLIENTES.findAll();
    return res.json(data);
  } catch (error) {
    console.error("CLIENTES.getAll error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}

export async function getOne(req, res) {
  try {
    const data = await CLIENTES.findByPk(req.params.id);
    return data ? res.json(data) : res.status(404).json({ error: "No encontrado" });
  } catch (error) {
    console.error("CLIENTES.getOne error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}

export async function create(req, res) {
  try {
    const payload = normalizePayload(req.body);
    const created = await CLIENTES.create(payload);
    return res.status(201).json(created);
  } catch (error) {
    // Logs para ver exactamente qué pasó
    console.error("CLIENTES.create error:", error);

    // Duplicado (PK/unique)
    if (error?.name === "SequelizeUniqueConstraintError" || error?.original?.code === "ER_DUP_ENTRY") {
      // MySQL: ER_DUP_ENTRY
      const field = error?.errors?.[0]?.path || "unique";
      const val = error?.errors?.[0]?.value;
      return res.status(409).json({ error: `Duplicado: ${field}${val ? `=${val}` : ""}` });
    }

    // Validaciones/notNull/enum/longitud
    if (error?.name === "SequelizeValidationError" || error?.name === "SequelizeDatabaseError") {
      const details = (error?.errors || []).map((e) => ({
        path: e.path,
        message: e.message,
        value: e.value,
        validatorKey: e.validatorKey,
      }));
      return res.status(400).json({
        error: "Validation error",
        details: details.length ? details : undefined,
        dbCode: error?.original?.code,
        dbMessage: error?.original?.sqlMessage || error?.original?.message,
      });
    }

    return res.status(500).json({ error: "Internal server error" });
  }
}

export async function update(req, res) {
  try {
    const [updated] = await CLIENTES.update(req.body, { where: { CED_CLI: req.params.id } });
    if (!updated) return res.status(404).json({ error: "No encontrado" });
    const refreshed = await CLIENTES.findByPk(req.params.id);
    return res.json(refreshed);
  } catch (error) {
    console.error("CLIENTES.update error:", error);
    if (error?.name === "SequelizeValidationError" || error?.name === "SequelizeDatabaseError") {
      const details = (error?.errors || []).map((e) => ({ path: e.path, message: e.message, value: e.value }));
      return res.status(400).json({ error: "Validation error", details });
    }
    return res.status(500).json({ error: "Internal server error" });
  }
}

export async function remove(req, res) {
  try {
    const deleted = await CLIENTES.destroy({ where: { CED_CLI: req.params.id } });
    return deleted ? res.json({ message: "Eliminado correctamente" }) : res.status(404).json({ error: "No encontrado" });
  } catch (error) {
    console.error("CLIENTES.remove error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}