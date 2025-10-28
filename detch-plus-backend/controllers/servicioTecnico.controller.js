import { Op } from "sequelize";
import sequelize from "../config/database.js";
import { SER_TEC, TECNICOS, CLIENTES, DET_SER } from "../models/index.js";

// Mapea a un objeto listo para UI manteniendo nombres de campos originales
function toUi(row) {
  const p = row.get ? row.get({ plain: true }) : row;
  const cli = p.cliente || {};
  const tec = p.tecnico || {};
  const det = p.detalle || undefined;

  const clienteNombre = [cli.NOM_CLI, cli.APE_CLI].filter(Boolean).join(" ").trim();

  return {
    NUM_SER: p.NUM_SER,
    ID_TEC: p.ID_TEC,
    CED_CLI: p.CED_CLI,
    FEC_SER: p.FEC_SER,
    PRE_SER: p.PRE_SER,
    PRE_VEN_SER: p.PRE_VEN_SER,
    IVA_SER: p.IVA_SER,
    EST_SER: p.EST_SER,
    cliente: Object.keys(cli).length
      ? {
          CED_CLI: cli.CED_CLI,
          NOM_CLI: cli.NOM_CLI,
          APE_CLI: cli.APE_CLI,
          NUM_CLI: cli.NUM_CLI,
          nombreCompleto: clienteNombre || cli.CED_CLI || "",
        }
      : undefined,
    tecnico: Object.keys(tec).length
      ? {
          ID_TEC: tec.ID_TEC,
          NOM_TEC: tec.NOM_TEC,
          TEL_TEC: tec.TEL_TEC,
          EST_TEC: tec.EST_TEC,
        }
      : undefined,
    detalle: det
      ? {
          ID_DET_SER: det.ID_DET_SER,
          NUM_SER: det.NUM_SER,
          IME_TEL_SER: det.IME_TEL_SER,
          MAR_TEL_SER: det.MAR_TEL_SER,
          MOD_TEL_SER: det.MOD_TEL_SER,
          CAP_TEL_SER: det.CAP_TEL_SER,
          DES_REP_TEL_SER: det.DES_REP_TEL_SER,
          DIR_SER: det.DIR_SER,
          PROB_REP_SER: det.PROB_REP_SER,
          SOL_APL_SER: det.SOL_APL_SER,
        }
      : undefined,
  };
}

// GET /api/servicios-tecnicos?q=&est=
export async function getAll(req, res) {
  try {
    const { q, est } = req.query;

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
        // Si quieres saber si existe detalle sin cargar campos:
        // { model: DET_SER, as: "detalle", attributes: ["ID_DET_SER"], required: false },
      ],
      order: [
        ["FEC_SER", "DESC"],
        ["NUM_SER", "DESC"],
      ],
    });

    return res.json(rows.map(toUi));
  } catch (e) {
    console.error("servicio-tecnico.getAll", e);
    return res.status(500).json({ error: "Internal server error" });
  }
}

// GET /api/servicios-tecnicos/options
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

// POST /api/servicios-tecnicos
// Crea servicio y, si llega body.detalle, crea el detalle en la misma transacción.
export async function create(req, res) {
  const t = await sequelize.transaction();
  try {
    const body = req.body || {};
    const { ID_TEC, CED_CLI } = body;

    if (!ID_TEC) {
      await t.rollback();
      return res.status(400).json({ error: "ID_TEC es obligatorio" });
    }
    if (!CED_CLI) {
      await t.rollback();
      return res.status(400).json({ error: "CED_CLI es obligatorio" });
    }

    // Validaciones referenciales
    const tec = await TECNICOS.findByPk(ID_TEC, { transaction: t });
    if (!tec || tec.EST_TEC === false) {
      await t.rollback();
      return res.status(400).json({ error: "Técnico inválido o inactivo" });
    }

    const cli = await CLIENTES.findOne({ where: { CED_CLI }, transaction: t });
    if (!cli) {
      await t.rollback();
      return res.status(400).json({ error: "Cliente no encontrado" });
    }

    // Números y defaults
    const preSer = Number(body.PRE_SER ?? 0);
    const iva = Number(body.IVA_SER ?? 0);
    const preVenSer = body.PRE_VEN_SER !== undefined ? Number(body.PRE_VEN_SER) : preSer + iva;

    if ([preSer, iva, preVenSer].some((n) => Number.isNaN(n))) {
      await t.rollback();
      return res.status(400).json({ error: "Valores numéricos inválidos en PRE_SER/IVA_SER/PRE_VEN_SER" });
    }

    const estValido = body.EST_SER && ["RECIBIDO", "EN_PROCESO", "TERMINADO", "ENTREGADO"].includes(body.EST_SER)
      ? body.EST_SER
      : "RECIBIDO";

    const created = await SER_TEC.create(
      {
        ID_TEC: Number(ID_TEC),
        CED_CLI: String(CED_CLI),
        FEC_SER: body.FEC_SER ? new Date(body.FEC_SER) : new Date(),
        PRE_SER: preSer,
        PRE_VEN_SER: preVenSer,
        IVA_SER: iva,
        EST_SER: estValido,
      },
      { transaction: t }
    );

    // Crear detalle si viene en el body
    if (body.detalle && typeof body.detalle === "object") {
      const allowed = [
        "IME_TEL_SER",
        "MAR_TEL_SER",
        "MOD_TEL_SER",
        "CAP_TEL_SER",
        "DES_REP_TEL_SER",
        "DIR_SER",
        "PROB_REP_SER",
        "SOL_APL_SER",
      ];
      const data = {};
      for (const k of allowed) {
        if (body.detalle[k] !== undefined) data[k] = body.detalle[k] === "" ? null : body.detalle[k];
      }
      await DET_SER.create({ NUM_SER: created.NUM_SER, ...data }, { transaction: t });
    }

    await t.commit();

    const withInclude = await SER_TEC.findByPk(created.NUM_SER, {
      include: [
        { model: TECNICOS, as: "tecnico", attributes: ["ID_TEC", "NOM_TEC", "TEL_TEC", "EST_TEC"] },
        { model: CLIENTES, as: "cliente", attributes: ["CED_CLI", "NOM_CLI", "APE_CLI", "NUM_CLI"] },
        { model: DET_SER, as: "detalle" },
      ],
    });

    return res.status(201).json(toUi(withInclude));
  } catch (e) {
    await (t?.rollback?.());
    console.error("servicio-tecnico.create", e);
    return res.status(500).json({ error: "Internal server error" });
  }
}

// PUT /api/servicios-tecnicos/:num
export async function update(req, res) {
  try {
    const { num } = req.params;
    const body = req.body || {};

    const row = await SER_TEC.findByPk(num);
    if (!row) return res.status(404).json({ error: "No encontrado" });

    // Validaciones si cambian FKs
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
        { model: DET_SER, as: "detalle" },
      ],
    });

    return res.json(toUi(withInclude));
  } catch (e) {
    console.error("servicio-tecnico.update", e);
    return res.status(500).json({ error: "Internal server error" });
  }
}

// PATCH /api/servicios-tecnicos/:num/estado
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

  export async function deleteServicio(req, res) {
    try {
      const { num } = req.params;
      const deleted = await SER_TEC.destroy({ where: { NUM_SER: num } });
      return deleted ? res.json({ message: "Eliminado correctamente" }) : res.status(404).json({ error: "No encontrado" });
    } catch (e) {
      console.error("servicio-tecnico.deleteServicio", e);
      return res.status(500).json({ error: "Internal server error" });
    }
  }

// GET /api/servicios-tecnicos/:num
export async function getOne(req, res) {
  try {
    const { num } = req.params;
    const row = await SER_TEC.findByPk(num, {
      include: [
        { model: TECNICOS, as: "tecnico", attributes: ["ID_TEC", "NOM_TEC", "TEL_TEC", "EST_TEC"] },
        { model: CLIENTES, as: "cliente", attributes: ["CED_CLI", "NOM_CLI", "APE_CLI", "NUM_CLI"] },
        { model: DET_SER, as: "detalle" },
      ],
    });
    if (!row) return res.status(404).json({ error: "No encontrado" });
    return res.json(toUi(row));
  } catch (e) {
    console.error("servicio-tecnico.getOne", e);
    return res.status(500).json({ error: "Internal server error" });
  }
}

// GET /api/servicios-tecnicos/:num/detalle
export async function getDetalle(req, res) {
  try {
    const { num } = req.params;
    const det = await DET_SER.findOne({ where: { NUM_SER: num } });
    if (!det) return res.status(404).json({ error: "Detalle no encontrado" });
    return res.json(det.get({ plain: true }));
  } catch (e) {
    console.error("servicio-tecnico.getDetalle", e);
    return res.status(500).json({ error: "Internal server error" });
  }
}

// PUT /api/servicios-tecnicos/:num/detalle
// Crea o actualiza el detalle (upsert) validando que exista el servicio
export async function upsertDetalle(req, res) {
  try {
    const { num } = req.params;
    const servicio = await SER_TEC.findByPk(num);
    if (!servicio) return res.status(404).json({ error: "Servicio no encontrado" });

    const allowed = [
      "IME_TEL_SER",
      "MAR_TEL_SER",
      "MOD_TEL_SER",
      "CAP_TEL_SER",
      "DES_REP_TEL_SER",
      "DIR_SER",
      "PROB_REP_SER",
      "SOL_APL_SER",
    ];

    const body = req.body || {};
    const data = {};
    for (const k of allowed) {
      if (body[k] !== undefined) data[k] = body[k] === "" ? null : body[k];
    }

    let det = await DET_SER.findOne({ where: { NUM_SER: num } });
    if (!det) {
      det = await DET_SER.create({ NUM_SER: Number(num), ...data });
    } else {
      await det.update(data);
    }

    return res.json(det.get({ plain: true }));
  } catch (e) {
    console.error("servicio-tecnico.upsertDetalle", e);
    return res.status(500).json({ error: "Internal server error" });
  }
  
}