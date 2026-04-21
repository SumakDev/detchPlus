import { apiClient } from "../apiClient";
import { Cliente, ClienteFormData } from "@/types/client";

function dbToUi(c: any): Cliente {
  return {
    CED_CLI: c.CED_CLI,
    NOM_CLI: c.NOM_CLI,
    APE_CLI: c.APE_CLI,
    DIR_CLI: c.DIR_CLI ?? "",
    COR_CLI: c.COR_CLI ?? "",
    NUM_CLI: c.NUM_CLI ?? "",
    DIF_CLI: c.DIF_CLI ?? "BAJA",
    ACTIVO: typeof c.ACT_CLI === "boolean" ? c.ACT_CLI : true,
    FECHA_REGISTRO: c.FEC_REG_CLI ?? new Date().toISOString(),
  };
}

function uiToDbPayload(data: Partial<ClienteFormData>) {
  return {
    CED_CLI: data.CED_CLI,
    NOM_CLI: data.NOM_CLI,
    APE_CLI: data.APE_CLI,
    DIR_CLI: data.DIR_CLI ?? null,
    COR_CLI: data.COR_CLI ?? null,
    NUM_CLI: data.NUM_CLI ?? null,
    DIF_CLI: data.DIF_CLI ?? "BAJA",
    ACT_CLI: typeof data.ACTIVO === "boolean" ? data.ACTIVO : true,
  };
}

export async function fetchClientes(): Promise<Cliente[]> {
  const json = await apiClient.get("/clientes");
  const rows = Array.isArray(json) ? json : json.data ?? [];
  return rows.map(dbToUi);
}

export async function createCliente(data: ClienteFormData): Promise<Cliente> {
  const json = await apiClient.post("/clientes", uiToDbPayload(data));
  return dbToUi(json);
}

export async function updateCliente(cedula: string, data: ClienteFormData): Promise<Cliente> {
  const json = await apiClient.put(`/clientes/${encodeURIComponent(cedula)}`, uiToDbPayload(data));
  return dbToUi(json);
}

export async function deleteCliente(cedula: string): Promise<void> {
  await apiClient.delete(`/clientes/${encodeURIComponent(cedula)}`);
}