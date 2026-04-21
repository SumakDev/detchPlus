import { apiClient } from "../apiClient";

export type ServicioDetalle = {
  ID_DET_SER?: number;
  NUM_SER?: number;
  IME_TEL_SER?: string | null;
  MAR_TEL_SER?: string | null;
  MOD_TEL_SER?: string | null;
  CAP_TEL_SER?: string | null;
  DES_REP_TEL_SER?: string | null;
  DIR_SER?: string | null;
  PROB_REP_SER?: string | null;
  SOL_APL_SER?: string | null;
};

export type ServicioTecnico = {
  NUM_SER: number;
  ID_TEC: number;
  CED_CLI: string;
  FEC_SER: string;
  PRE_SER: number;
  PRE_VEN_SER: number;
  IVA_SER: number;
  EST_SER: "RECIBIDO" | "EN_PROCESO" | "TERMINADO" | "ENTREGADO";
  cliente?: { CED_CLI: string; NOM_CLI?: string; APE_CLI?: string; TEL_CLI?: string; nombreCompleto?: string };
  tecnico?: { ID_TEC: number; NOM_TEC?: string; TEL_TEC?: string; EST_TEC?: boolean };
  detalle?: ServicioDetalle;
};

// LISTADO
export async function fetchServicios(params?: { q?: string; est?: string; page?: number; limit?: number }) {
  const qs = new URLSearchParams();
  if (params?.q) qs.set("q", params.q);
  if (params?.est) qs.set("est", params.est);
  if (params?.page) qs.set("page", String(params.page));
  if (params?.limit) qs.set("limit", String(params.limit));
  return apiClient.get(`/servicios-tecnicos${qs.toString() ? `?${qs.toString()}` : ""}`) as Promise<ServicioTecnico[]>;
}

// OPCIONES (Técnicos activos y Clientes)
export async function fetchServTecOptions(): Promise<{
  tecnicos: Array<{ ID_TEC: number; NOM_TEC: string; TEL_TEC?: string; ESP_TEC?: string }>;
  clientes: Array<{ CED_CLI: string; NOM_CLI?: string; APE_CLI?: string; TEL_CLI?: string }>;
}> {
  return apiClient.get("/servicios-tecnicos/options");
}

export async function createServicio(data: {
  ID_TEC: number;
  CED_CLI: string;
  PRE_SER: number;
  IVA_SER?: number;
  PRE_VEN_SER?: number;
  FEC_SER?: string;
  EST_SER?: ServicioTecnico["EST_SER"];
}) {
  return apiClient.post("/servicios-tecnicos", data) as Promise<ServicioTecnico>;
}

// ACTUALIZAR SERVICIO
export async function updateServicio(num: number, patch: Partial<Omit<ServicioTecnico, "NUM_SER">>) {
  return apiClient.put(`/servicios-tecnicos/${num}`, patch) as Promise<ServicioTecnico>;
}

// CAMBIAR ESTADO
export async function updateServicioEstado(num: number, estado: ServicioTecnico["EST_SER"]) {
  return apiClient.patch(`/servicios-tecnicos/${num}/estado`, { estado }) as Promise<{ message: string }>;
}