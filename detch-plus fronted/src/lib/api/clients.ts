import { Cliente, ClienteFormData } from "@/types/client";

const API = process.env.NEXT_PUBLIC_API_URL || "";

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
    // Si necesitas enviar FEC_REG_CLI explícito, añade:
    // FEC_REG_CLI: new Date().toISOString(),
  };
}

async function handleJson(res: Response) {
  const text = await res.text();
  let json: any = null;
  try { json = text ? JSON.parse(text) : null; } catch { /* respuesta no-JSON */ }
  if (!res.ok) {
    const message =
      (json?.error && typeof json.error === "string" && json.error) ||
      (json?.message && typeof json.message === "string" && json.message) ||
      text ||
      `HTTP ${res.status}`;
    const details = json?.details;
    const e = new Error(message) as Error & { details?: any; status?: number };
    e.details = details;
    e.status = res.status;
    throw e;
  }
  return json;
}

export async function fetchClientes(): Promise<Cliente[]> {
  const res = await fetch(`${API}/clientes`, { cache: "no-store" });
  const json = await handleJson(res);
  const rows = Array.isArray(json) ? json : json.data ?? [];
  return rows.map(dbToUi);
}

export async function createCliente(data: ClienteFormData): Promise<Cliente> {
  const res = await fetch(`${API}/clientes`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(uiToDbPayload(data)),
  });
  const json = await handleJson(res);
  return dbToUi(json);
}

export async function updateCliente(cedula: string, data: ClienteFormData): Promise<Cliente> {
  const res = await fetch(`${API}/clientes/${encodeURIComponent(cedula)}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(uiToDbPayload(data)),
  });
  const json = await handleJson(res);
  return dbToUi(json);
}

export async function deleteCliente(cedula: string): Promise<void> {
  const res = await fetch(`${API}/clientes/${encodeURIComponent(cedula)}`, { method: "DELETE" });
  await handleJson(res);
}