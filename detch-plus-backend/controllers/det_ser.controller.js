import { DET_SER, SER_TEC } from "../models/index.js";

// CRUD básico (tu versión con validaciones mínimas de integridad)
export async function getAll(req, res) {
  try {
    const data = await DET_SER.findAll();
    return res.json(data);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}

export async function getOne(req, res) {
  try {
    const data = await DET_SER.findByPk(req.params.id);
    return data ? res.json(data) : res.status(404).json({ error: "No encontrado" });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}

// Obtener por NUM_SER (útil para endpoint anidado)
export async function getByNumSer(req, res) {
  try {
    const { num } = req.params;
    const data = await DET_SER.findOne({ where: { NUM_SER: num } });
    return data ? res.json(data) : res.status(404).json({ error: "Detalle no encontrado" });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}

// Crear — valida que exista el servicio y que no exista detalle previo
export async function create(req, res) {
  try {
    const { NUM_SER } = req.body || {};
    if (!NUM_SER) return res.status(400).json({ error: "NUM_SER es obligatorio" });

    const ser = await SER_TEC.findByPk(NUM_SER);
    if (!ser) return res.status(400).json({ error: "Servicio no existe" });

    const dup = await DET_SER.findOne({ where: { NUM_SER } });
    if (dup) return res.status(409).json({ error: "Ya existe detalle para este servicio" });

    const created = await DET_SER.create(req.body);
    return res.status(201).json(created);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}

export async function update(req, res) {
  try {
    const [updated] = await DET_SER.update(req.body, { where: { ID_DET_SER: req.params.id } });
    if (!updated) return res.status(404).json({ error: "No encontrado" });
    const refreshed = await DET_SER.findByPk(req.params.id);
    return res.json(refreshed);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}

export async function remove(req, res) {
  try {
    const deleted = await DET_SER.destroy({ where: { ID_DET_SER: req.params.id } });
    return deleted ? res.json({ message: "Eliminado correctamente" }) : res.status(404).json({ error: "No encontrado" });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}

// Upsert por NUM_SER para endpoint anidado
export async function upsertByNumSer(req, res) {
  try {
    const { num } = req.params;
    const ser = await SER_TEC.findByPk(num);
    if (!ser) return res.status(404).json({ error: "Servicio no encontrado" });

    const allowed = [
      "IME_TEL_SER", "MAR_TEL_SER", "MOD_TEL_SER", "CAP_TEL_SER",
      "DES_REP_TEL_SER", "DIR_SER", "PROB_REP_SER", "SOL_APL_SER",
    ];
    const body = req.body || {};
    const data = {};
    for (const k of allowed) {
      if (body[k] !== undefined) data[k] = body[k] === "" ? null : body[k];
    }

    let det = await DET_SER.findOne({ where: { NUM_SER: num } });
    if (!det) det = await DET_SER.create({ NUM_SER: Number(num), ...data });
    else await det.update(data);

    return res.json(det.get({ plain: true }));
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}