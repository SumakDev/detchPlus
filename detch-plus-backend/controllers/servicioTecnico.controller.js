import { Op } from "sequelize";
import { SER_TEC, TECNICOS, CLIENTES } from "../models/index.js";

// Mapea el registro a una vista UI simple
function toUi(row) {
  const plain = row.get ? row.get({ plain: true }) : row;
  const cli = plain.cliente || {};
  const tec = plain.tecnico || {};
  const clienteNombre = [cli.NOM_CLI, cli.APE_CLI].filter(Boolean).join(" ").trim();
  return {
    ...plain,
    cliente: {
      CED_CLI: cli.CED_CLI,
      NOM_CLI: cli.NOM_CLI,
      APE_CLI: cli.APE_CLI,
      NUM_CLI: cli.NUM_CLI,
      nombreCompleto: clienteNombre || cli.CED_CLI || "",
    },
    tecnico: {
      ID_TEC: tec.ID_TEC,
      NOM_TEC: tec.NOM_TEC,
      TEL_TEC: tec.TEL_TEC,
      EST_TEC: tec.EST_TEC,
    },
  };
}

// Listado con filtros
export async function getAll(req, res) {
  try {
    const { q, est, page, limit } = req.query;
    const where = {};
    if (est && ["RECIBIDO", "EN_PROCESO", "TERMINADO", "ENTREGADO"].includes(est)) {
      where.EST_SER = est;
    }

    const like = q ? `%${q}%` : null;
    const rows = await SER_TEC.findAll({
      where,
      include: [
        {
          model: TECNICOS,
          as: "tecnico",
          attributes: ["ID_TEC", "NOM_TEC", "TEL_TEC", "EST_TEC"],
          required: false,
        },
        {
          model: CLIENTES,
          as: "cliente",
          attributes: ["CED_CLI", "NOM_CLI", "APE_CLI", "NUM_CLI"],
          required: false,
          where: like
            ? {
                [Op.or]: [
                  { CED_CLI: { [Op.like]: like } },
                  { NOM_CLI: { [Op.like]: like } },
                  { APE_CLI: { [Op.like]: like } },
                ],
              }
            : undefined,
        },
      ],
      order: [
        ["FEC_SER", "DESC"],
        ["NUM_SER", "DESC"],
      ],
      ...(page && limit
        ? { offset: (Number(page) - 1) * Number(limit), limit: Number(limit) }
        : {}),
    });

    return res.json(rows.map(toUi));
  } catch (e) {
    console.error("servicio-tecnico.getAll", e);
    return res.status(500).json({ error: "Internal server error" });
  }
}

// Opciones para el formulario: técnicos activos y clientes
export async function getOptions(_req, res) {
  try {
    const tecnicos = await TECNICOS.findAll({
      where: { EST_TEC: true },
      attributes: ["ID_TEC", "NOM_TEC", "TEL_TEC", "ESP_TEC"],
      order: [["NOM_TEC", "ASC"]],
    });
    const clientes = await CLIENTES.findAll({
      attributes: ["CED_CLI", "NOM_CLI", "APE_CLI", "NUM_CLI"],
      order: [["NOM_CLI", "ASC"], ["APE_CLI", "ASC"]],
    });
    return res.json({
      tecnicos: tecnicos.map((t) => t.get({ plain: true })),
      clientes: clientes.map((c) => c.get({ plain: true })),
    });
  } catch (e) {
    console.error("servicio-tecnico.getOptions", e);
    return res.status(500).json({ error: "Internal server error" });
  }
}

// Crear servicio técnico
export async function create(req, res) {
  try {
    const body = req.body || {};
    const { ID_TEC, CED_CLI } = body;

    if (!ID_TEC) return res.status(400).json({ error: "ID_TEC es obligatorio" });
    if (!CED_CLI) return res.status(400).json({ error: "CED_CLI es obligatorio" });

    // Validar técnico
    const tec = await TECNICOS.findByPk(ID_TEC);
    if (!tec || tec.EST_TEC === false) {
      return res.status(400).json({ error: "Técnico inválido o inactivo" });
    }
    // Validar cliente
    const cli = await CLIENTES.findOne({ where: { CED_CLI } });
    if (!cli) return res.status(400).json({ error: "Cliente no encontrado" });

    const preSer = Number(body.PRE_SER ?? 0);
    const iva = Number(body.IVA_SER ?? 0);
    const preVenSer = body.PRE_VEN_SER !== undefined ? Number(body.PRE_VEN_SER) : preSer + iva;

    if (Number.isNaN(preSer) || Number.isNaN(iva) || Number.isNaN(preVenSer)) {
      return res.status(400).json({ error: "Valores numéricos inválidos en PRE_SER/IVA_SER/PRE_VEN_SER" });
    }

    const created = await SER_TEC.create({
      ID_TEC: Number(ID_TEC),
      CED_CLI: String(CED_CLI),
      FEC_SER: body.FEC_SER ? new Date(body.FEC_SER) : new Date(),
      PRE_SER: preSer,
      PRE_VEN_SER: preVenSer,
      IVA_SER: iva,
      EST_SER: body.EST_SER && ["RECIBIDO", "EN_PROCESO", "TERMINADO", "ENTREGADO"].includes(body.EST_SER)
        ? body.EST_SER
        : "RECIBIDO",
    });

    const withInclude = await SER_TEC.findByPk(created.NUM_SER, {
      include: [
        { model: TECNICOS, as: "tecnico", attributes: ["ID_TEC", "NOM_TEC", "TEL_TEC", "EST_TEC"] },
        { model: CLIENTES, as: "cliente", attributes: ["CED_CLI", "NOM_CLI", "APE_CLI", "NUM_CLI"] },
      ],
    });

    return res.status(201).json(toUi(withInclude));
  } catch (e) {
    console.error("servicio-tecnico.create", e);
    return res.status(500).json({ error: "Internal server error" });
  }
}

// Actualizar servicio (datos generales)
export async function update(req, res) {
  try {
    const { num } = req.params;
    const body = req.body || {};

    const row = await SER_TEC.findByPk(num);
    if (!row) return res.status(404).json({ error: "No encontrado" });

    // Si cambian técnico o cliente, validar
    if (body.ID_TEC !== undefined) {
      const tec = await TECNICOS.findByPk(body.ID_TEC);
      if (!tec || tec.EST_TEC === false) {
        return res.status(400).json({ error: "Técnico inválido o inactivo" });
      }
    }
    if (body.CED_CLI !== undefined) {
      const cli = await CLIENTES.findOne({ where: { CED_CLI: body.CED_CLI } });
      if (!cli) return res.status(400).json({ error: "Cliente no encontrado" });
    }

    const patch = {};
    if (body.ID_TEC !== undefined) patch.ID_TEC = Number(body.ID_TEC);
    if (body.CED_CLI !== undefined) patch.CED_CLI = String(body.CED_CLI);
    if (body.FEC_SER !== undefined) patch.FEC_SER = new Date(body.FEC_SER);
    if (body.PRE_SER !== undefined) patch.PRE_SER = Number(body.PRE_SER);
    if (body.IVA_SER !== undefined) patch.IVA_SER = Number(body.IVA_SER);
    if (body.PRE_VEN_SER !== undefined) {
      patch.PRE_VEN_SER = Number(body.PRE_VEN_SER);
    } else if (patch.PRE_SER !== undefined || patch.IVA_SER !== undefined) {
      // Recalcular si cambia base o IVA
      const preSer = patch.PRE_SER !== undefined ? patch.PRE_SER : row.PRE_SER;
      const iva = patch.IVA_SER !== undefined ? patch.IVA_SER : row.IVA_SER;
      patch.PRE_VEN_SER = Number(preSer) + Number(iva);
    }
    if (body.EST_SER && ["RECIBIDO", "EN_PROCESO", "TERMINADO", "ENTREGADO"].includes(body.EST_SER)) {
      patch.EST_SER = body.EST_SER;
    }

    await row.update(patch);

    const withInclude = await SER_TEC.findByPk(num, {
      include: [
        { model: TECNICOS, as: "tecnico", attributes: ["ID_TEC", "NOM_TEC", "TEL_TEC", "EST_TEC"] },
        { model: CLIENTES, as: "cliente", attributes: ["CED_CLI", "NOM_CLI", "APE_CLI", "NUM_CLI"] },
      ],
    });

    return res.json(toUi(withInclude));
  } catch (e) {
    console.error("servicio-tecnico.update", e);
    return res.status(500).json({ error: "Internal server error" });
  }
}

// Cambiar estado (endpoint corto)
export async function updateStatus(req, res) {
  try {
    const { num } = req.params;
    const { estado } = req.body || {};
    if (!["RECIBIDO", "EN_PROCESO", "TERMINADO", "ENTREGADO"].includes(estado)) {
      return res.status(400).json({ error: "Estado inválido" });
    }
    const row = await SER_TEC.findByPk(num);
    if (!row) return res.status(404).json({ error: "No encontrado" });
    await row.update({ EST_SER: estado });
    return res.json({ message: "Estado actualizado" });
  } catch (e) {
    console.error("servicio-tecnico.updateStatus", e);
    return res.status(500).json({ error: "Internal server error" });
  }
}