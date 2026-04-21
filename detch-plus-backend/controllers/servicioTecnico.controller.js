import * as servicioTecnicoService from "../services/servicioTecnico.service.js";

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

export async function getAll(req, res) {
  try {
    const rows = await servicioTecnicoService.getServicios(req.query);
    return res.json(rows.map(toUi));
  } catch (e) {
    console.error("servicio-tecnico.getAll", e);
    return res.status(500).json({ error: "Internal server error" });
  }
}

export async function getOptions(_req, res) {
  try {
    const options = await servicioTecnicoService.getOptions();
    return res.json(options);
  } catch (e) {
    console.error("servicio-tecnico.getOptions", e);
    return res.status(500).json({ error: "Internal server error" });
  }
}

export async function create(req, res) {
  const t = await sequelize.transaction();
  try {
    const result = await servicioTecnicoService.createServicio(req.body || {});
    return res.status(201).json(toUi(result));
  } catch (e) {
    await (t?.rollback?.());
    console.error("servicio-tecnico.create", e);
    return res.status(e.status || 500).json({ error: e.message || "Internal server error" });
  }
}

export async function update(req, res) {
  try {
    const { num } = req.params;
    const result = await servicioTecnicoService.updateServicio(num, req.body || {});
    return res.json(toUi(result));
  } catch (e) {
    console.error("servicio-tecnico.update", e);
    return res.status(e.status || 500).json({ error: e.message || "Internal server error" });
  }
}

export async function updateStatus(req, res) {
  try {
    const { num } = req.params;
    const { estado } = req.body || {};
    await servicioTecnicoService.updateStatus(num, estado);
    return res.json({ message: "Estado actualizado" });
  } catch (e) {
    console.error("servicio-tecnico.updateStatus", e);
    return res.status(e.status || 500).json({ error: e.message || "Internal server error" });
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