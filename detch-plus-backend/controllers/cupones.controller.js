import { CUPONES, CUP_USO } from "../models/index.js";

export async function getAll(req, res) {
  try {
    const data = await CUPONES.findAll({
      include: [{ model: CUP_USO, as: "usos" }],
      order: [["ID_CUP", "DESC"]],
    });
    return res.json(data);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}

export async function getOne(req, res) {
  try {
    const data = await CUPONES.findByPk(req.params.id, {
      include: [{ model: CUP_USO, as: "usos" }],
    });
    return data ? res.json(data) : res.status(404).json({ error: "No encontrado" });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}

export async function validar(req, res) {
  try {
    const { codigo, subtotal = 0 } = req.body || {};
    if (!codigo || !String(codigo).trim()) {
      return res.status(400).json({ valid: false, error: "Debes ingresar un código de cupón." });
    }

    const cleanCode = String(codigo).trim().toUpperCase();
    const cupon = await CUPONES.findOne({ where: { COD_CUP: cleanCode } });

    if (!cupon) {
      return res.status(404).json({ valid: false, error: "El cupón ingresado no existe." });
    }

    if (!cupon.ACT_CUP) {
      return res.status(400).json({ valid: false, error: "Este cupón se encuentra inactivo." });
    }

    const now = new Date();
    const fecIni = new Date(cupon.FEC_INI_CUP);
    const fecFin = new Date(cupon.FEC_FIN_CUP);

    if (now < fecIni) {
      return res.status(400).json({ valid: false, error: "Este cupón aún no entra en vigencia." });
    }
    if (now > fecFin) {
      return res.status(400).json({ valid: false, error: "Este cupón ha expirado." });
    }

    if (cupon.LIM_USO_CUP != null && Number(cupon.USO_ACT_CUP || 0) >= Number(cupon.LIM_USO_CUP)) {
      return res.status(400).json({ valid: false, error: "Este cupón ha alcanzado su límite máximo de usos." });
    }

    const numSubtotal = Number(subtotal) || 0;
    const minMonto = Number(cupon.MON_MIN_CUP || 0);
    if (numSubtotal < minMonto) {
      return res.status(400).json({
        valid: false,
        error: `El monto mínimo de compra para este cupón es $${minMonto.toFixed(2)}.`,
      });
    }

    const valDes = Number(cupon.VAL_DES_CUP || 0);
    let descuento = 0;
    if (cupon.TIP_DES_CUP === "PORCENTAJE") {
      descuento = Number((numSubtotal * (valDes / 100)).toFixed(2));
    } else {
      descuento = Number(Math.min(numSubtotal, valDes).toFixed(2));
    }

    return res.json({
      valid: true,
      cupon,
      descuento,
    });
  } catch (error) {
    return res.status(500).json({ valid: false, error: error.message });
  }
}

export async function create(req, res) {
  try {
    const payload = { ...req.body };
    if (payload.COD_CUP) {
      payload.COD_CUP = String(payload.COD_CUP).trim().toUpperCase();
    }
    const created = await CUPONES.create(payload);
    return res.status(201).json(created);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}

export async function update(req, res) {
  try {
    const payload = { ...req.body };
    if (payload.COD_CUP) {
      payload.COD_CUP = String(payload.COD_CUP).trim().toUpperCase();
    }
    const [updated] = await CUPONES.update(payload, { where: { ID_CUP: req.params.id } });
    if (!updated) return res.status(404).json({ error: "No encontrado" });
    const refreshed = await CUPONES.findByPk(req.params.id);
    return res.json(refreshed);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}

export async function remove(req, res) {
  try {
    const deleted = await CUPONES.destroy({ where: { ID_CUP: req.params.id } });
    return deleted ? res.json({ message: "Eliminado correctamente" }) : res.status(404).json({ error: "No encontrado" });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
