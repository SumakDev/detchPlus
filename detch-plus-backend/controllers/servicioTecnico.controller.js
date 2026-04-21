import * as servicioTecnicoService from "../services/servicioTecnico.service.js";

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
  try {
    const result = await servicioTecnicoService.createServicio(req.body || {});
    return res.status(201).json(toUi(result));
  } catch (e) {
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