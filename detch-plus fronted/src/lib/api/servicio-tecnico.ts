const API = process.env.NEXT_PUBLIC_API_URL || "";

function getAuthHeaders() : Record<string, string> {
  if (typeof window === "undefined") return {};
  const token = localStorage.getItem("auth_token");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function handleJson(res: Response) {
  const text = await res.text();
  let json: any = null;
  try { json = text ? JSON.parse(text) : null; } catch {}
  if (!res.ok) {
    const msg = json?.error || json?.message || text || `HTTP ${res.status}`;
    const err = new Error(msg) as Error & { status?: number };
    (err as any).status = res.status;
    throw err;
  }
  return json;
}

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
};

export async function fetchServicios(params?: { q?: string; est?: string; page?: number; limit?: number }) {
  const qs = new URLSearchParams();
  if (params?.q) qs.set("q", params.q);
  if (params?.est) qs.set("est", params.est);
  if (params?.page) qs.set("page", String(params.page));
  if (params?.limit) qs.set("limit", String(params.limit));

  const res = await fetch(`${API}/servicios-tecnicos${qs.toString() ? `?${qs.toString()}` : ""}`, {
    headers: { ...getAuthHeaders() },
    cache: "no-store",
  });
  return handleJson(res) as Promise<ServicioTecnico[]>;
}

export async function fetchServTecOptions(): Promise<{
  tecnicos: Array<{ ID_TEC: number; NOM_TEC: string; TEL_TEC?: string; ESP_TEC?: string }>;
  clientes: Array<{ CED_CLI: string; NOM_CLI?: string; APE_CLI?: string; TEL_CLI?: string }>;
}> {
  const res = await fetch(`${API}/servicios-tecnicos/options`, {
    headers: { ...getAuthHeaders() },
    cache: "no-store",
  });
  return handleJson(res);
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
  const res = await fetch(`${API}/servicios-tecnicos`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...getAuthHeaders() },
    body: JSON.stringify(data),
  });
  return handleJson(res) as Promise<ServicioTecnico>;
}

export async function updateServicio(num: number, patch: Partial<Omit<ServicioTecnico, "NUM_SER">>) {
  const res = await fetch(`${API}/servicios-tecnicos/${num}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json", ...getAuthHeaders() },
    body: JSON.stringify(patch),
  });
  return handleJson(res) as Promise<ServicioTecnico>;
}

export async function updateServicioEstado(num: number, estado: ServicioTecnico["EST_SER"]) {
  const res = await fetch(`${API}/servicios-tecnicos/${num}/estado`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json", ...getAuthHeaders() },
    body: JSON.stringify({ estado }),
  });
  return handleJson(res) as Promise<{ message: string }>;
}