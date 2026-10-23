import { Op } from "sequelize";
import { SER_TEC, TECNICOS, CLIENTES, DET_SER } from "../models/index.js";

// Mapea el registro a una vista UI simple
function toUi(row) {
  const plain = row.get ? row.get({ plain: true }) : row;
  const cli = plain.cliente || {};
  const tec = plain.tecnico || {};
  const det = plain.detalle || {};
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
    detalle: {
      ID_DET_SER: det.ID_DET_SER,
      NUM_SER: det.NUM_SER,
      MAR_TEL_SER: det.MAR_TEL_SER || "",
      MOD_TEL_SER: det.MOD_TEL_SER || "",
      IME_TEL_SER: det.IME_TEL_SER || "",
      CAP_TEL_SER: det.CAP_TEL_SER || "",
      PROB_REP_SER: det.PROB_REP_SER || "",
      DES_REP_TEL_SER: det.DES_REP_TEL_SER || "",
      SOL_APL_SER: det.SOL_APL_SER || "",
      DIR_SER: det.DIR_SER || "",
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
        {
          model: DET_SER,
          as: "detalle",
          required: false,
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

    // Guardar detalles del dispositivo y problema en DET_SER
    await DET_SER.create({
      NUM_SER: created.NUM_SER,
      MAR_TEL_SER: body.MAR_TEL_SER || body.detalle?.MAR_TEL_SER || null,
      MOD_TEL_SER: body.MOD_TEL_SER || body.detalle?.MOD_TEL_SER || null,
      IME_TEL_SER: body.IME_TEL_SER || body.detalle?.IME_TEL_SER || null,
      CAP_TEL_SER: body.CAP_TEL_SER || body.detalle?.CAP_TEL_SER || null,
      PROB_REP_SER: body.PROB_REP_SER || body.detalle?.PROB_REP_SER || null,
      DES_REP_TEL_SER: body.DES_REP_TEL_SER || body.detalle?.DES_REP_TEL_SER || null,
      SOL_APL_SER: body.SOL_APL_SER || body.detalle?.SOL_APL_SER || null,
      DIR_SER: body.DIR_SER || body.detalle?.DIR_SER || null,
    });

    const withInclude = await SER_TEC.findByPk(created.NUM_SER, {
      include: [
        { model: TECNICOS, as: "tecnico", attributes: ["ID_TEC", "NOM_TEC", "TEL_TEC", "EST_TEC"] },
        { model: CLIENTES, as: "cliente", attributes: ["CED_CLI", "NOM_CLI", "APE_CLI", "NUM_CLI"] },
        { model: DET_SER, as: "detalle" },
      ],
    });

    return res.status(201).json(toUi(withInclude));
  } catch (e) {
    console.error("servicio-tecnico.create", e);
    return res.status(500).json({ error: "Internal server error" });
  }
}

// Actualizar servicio (datos generales y detalle)
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

    // Actualizar o crear detalle en DET_SER
    const detFields = [
      "MAR_TEL_SER", "MOD_TEL_SER", "IME_TEL_SER", "CAP_TEL_SER",
      "PROB_REP_SER", "DES_REP_TEL_SER", "SOL_APL_SER", "DIR_SER"
    ];
    const hasDetUpdate = detFields.some(f => body[f] !== undefined || body.detalle?.[f] !== undefined);
    if (hasDetUpdate) {
      const existingDet = await DET_SER.findOne({ where: { NUM_SER: num } });
      const detPatch = {};
      for (const f of detFields) {
        if (body[f] !== undefined) detPatch[f] = body[f];
        else if (body.detalle?.[f] !== undefined) detPatch[f] = body.detalle[f];
      }
      if (existingDet) {
        await existingDet.update(detPatch);
      } else {
        await DET_SER.create({ NUM_SER: Number(num), ...detPatch });
      }
    }

    const withInclude = await SER_TEC.findByPk(num, {
      include: [
        { model: TECNICOS, as: "tecnico", attributes: ["ID_TEC", "NOM_TEC", "TEL_TEC", "EST_TEC"] },
        { model: CLIENTES, as: "cliente", attributes: ["CED_CLI", "NOM_CLI", "APE_CLI", "NUM_CLI"] },
        { model: DET_SER, as: "detalle" },
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

// Seguimiento público de orden para clientes (por número de orden o cédula)
export async function trackPublicService(req, res) {
  try {
    const query = (req.params.query || req.query.q || "").trim();
    if (!query) {
      return res.status(400).json({ error: "Debe ingresar un número de orden o cédula." });
    }

    const isNumeric = /^\d+$/.test(query);
    const whereConditions = [{ CED_CLI: query }];
    if (isNumeric) {
      whereConditions.push({ NUM_SER: Number(query) });
    }

    const rows = await SER_TEC.findAll({
      where: { [Op.or]: whereConditions },
      include: [
        { model: TECNICOS, as: "tecnico", attributes: ["NOM_TEC", "TEL_TEC"] },
        { model: CLIENTES, as: "cliente", attributes: ["NOM_CLI", "APE_CLI", "CED_CLI"] },
        { model: DET_SER, as: "detalle" },
      ],
      order: [["FEC_SER", "DESC"]],
      limit: 5,
    });

    if (!rows || rows.length === 0) {
      return res.status(404).json({ error: "No se encontraron órdenes de servicio técnico con ese número o cédula." });
    }

    const publicResults = rows.map((r) => {
      const plain = r.toJSON();
      const cli = plain.cliente || {};
      const tec = plain.tecnico || {};
      const det = plain.detalle || {};

      return {
        NUM_SER: plain.NUM_SER,
        FEC_SER: plain.FEC_SER,
        EST_SER: plain.EST_SER,
        PRE_SER: plain.PRE_SER,
        PRE_VEN_SER: plain.PRE_VEN_SER,
        clienteNombre: cli.NOM_CLI ? `${cli.NOM_CLI} ${cli.APE_CLI ? cli.APE_CLI[0] + "." : ""}` : "Cliente",
        tecnicoNombre: tec.NOM_TEC || "Técnico Asignado",
        equipo: [det.MAR_TEL_SER, det.MOD_TEL_SER].filter(Boolean).join(" ") || det.DES_REP_TEL_SER || "Dispositivo móvil / equipo",
        fallaReportada: det.PROB_REP_SER || "En revisión técnica",
        solucion: det.SOL_APL_SER || (plain.EST_SER === "TERMINADO" || plain.EST_SER === "ENTREGADO" ? "Servicio concluido con éxito" : "En proceso de diagnóstico / reparación"),
      };
    });

    return res.json(publicResults);
  } catch (err) {
    console.error("servicio-tecnico.trackPublicService", err);
    return res.status(500).json({ error: "Error al consultar estado de servicio técnico" });
  }
}