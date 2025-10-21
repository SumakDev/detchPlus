import { Cliente, ClienteFormData } from "@/types/client";

const API = process.env.NEXT_PUBLIC_API_URL || "";

// DB -> UI
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

// UI -> DB
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
  const res = await fetch(`${API}/clientes`, { cache: "no-store" });
  if (!res.ok) throw new Error(await res.text());
  const json = await res.json();
  const rows = Array.isArray(json) ? json : json.data ?? [];
  return rows.map(dbToUi);
}

export async function createCliente(data: ClienteFormData): Promise<Cliente> {
  const res = await fetch(`${API}/clientes`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(uiToDbPayload(data)),
  });
  if (!res.ok) throw new Error(await res.text());
  return dbToUi(await res.json());
}

export async function updateCliente(cedula: string, data: ClienteFormData): Promise<Cliente> {
  const res = await fetch(`${API}/clientes/${encodeURIComponent(cedula)}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(uiToDbPayload(data)),
  });
  if (!res.ok) throw new Error(await res.text());
  return dbToUi(await res.json());
}

export async function deleteCliente(cedula: string): Promise<void> {
  const res = await fetch(`${API}/clientes/${encodeURIComponent(cedula)}`, { method: "DELETE" });
  if (!res.ok) throw new Error(await res.text());
}