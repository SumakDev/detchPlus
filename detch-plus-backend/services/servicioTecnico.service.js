import * as repo from "../repositories/servicioTecnico.repository.js";

function serviceError(message, status = 400) {
  const err = new Error(message);
  err.status = status;
  return err;
}

const VALID_ESTADOS = ["RECIBIDO", "EN_PROCESO", "TERMINADO", "ENTREGADO"];

export async function getServicios({ q, est, page, limit } = {}) {
  const where = {};
  if (est && VALID_ESTADOS.includes(est)) where.EST_SER = est;
  const like = q ? `%${q}%` : null;
  return repo.findAll({ where, like, page, limit });
}

export async function getOptions() {
  const [tecnicos, clientes] = await Promise.all([
    repo.findActiveTecnicos(),
    repo.findAllClientes(),
  ]);
  return {
    tecnicos: tecnicos.map((t) => t.get({ plain: true })),
    clientes: clientes.map((c) => c.get({ plain: true })),
  };
}

export async function createServicio(body) {
  const { ID_TEC, CED_CLI } = body;
  if (!ID_TEC) throw serviceError("ID_TEC es obligatorio");
  if (!CED_CLI) throw serviceError("CED_CLI es obligatorio");

  const tec = await repo.findTecnicoByPk(ID_TEC);
  if (!tec || tec.EST_TEC === false) throw serviceError("Técnico inválido o inactivo");

  const cli = await repo.findClienteByCedula(CED_CLI);
  if (!cli) throw serviceError("Cliente no encontrado");

  const preSer = Number(body.PRE_SER ?? 0);
  const iva = Number(body.IVA_SER ?? 0);
  const preVenSer = body.PRE_VEN_SER !== undefined ? Number(body.PRE_VEN_SER) : preSer + iva;

  if (Number.isNaN(preSer) || Number.isNaN(iva) || Number.isNaN(preVenSer)) {
    throw serviceError("Valores numéricos inválidos en PRE_SER/IVA_SER/PRE_VEN_SER");
  }

  const created = await repo.create({
    ID_TEC: Number(ID_TEC),
    CED_CLI: String(CED_CLI),
    FEC_SER: body.FEC_SER ? new Date(body.FEC_SER) : new Date(),
    PRE_SER: preSer,
    PRE_VEN_SER: preVenSer,
    IVA_SER: iva,
    EST_SER: body.EST_SER && VALID_ESTADOS.includes(body.EST_SER) ? body.EST_SER : "RECIBIDO",
  });

  return repo.findByPkWithInclude(created.NUM_SER);
}

export async function updateServicio(num, body) {
  const row = await repo.findByPk(num);
  if (!row) throw serviceError("No encontrado", 404);

  if (body.ID_TEC !== undefined) {
    const tec = await repo.findTecnicoByPk(body.ID_TEC);
    if (!tec || tec.EST_TEC === false) throw serviceError("Técnico inválido o inactivo");
  }
  if (body.CED_CLI !== undefined) {
    const cli = await repo.findClienteByCedula(body.CED_CLI);
    if (!cli) throw serviceError("Cliente no encontrado");
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
  if (body.EST_SER && VALID_ESTADOS.includes(body.EST_SER)) patch.EST_SER = body.EST_SER;

  await row.update(patch);
  return repo.findByPkWithInclude(num);
}

export async function updateStatus(num, estado) {
  if (!VALID_ESTADOS.includes(estado)) throw serviceError("Estado inválido");
  const row = await repo.findByPk(num);
  if (!row) throw serviceError("No encontrado", 404);
  await row.update({ EST_SER: estado });
}
