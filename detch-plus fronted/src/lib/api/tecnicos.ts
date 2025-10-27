import { Tecnico } from "@/types/tecnico";

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

export async function fetchTecnicos(params?: { q?: string; act?: "true" | "false" }) {
  const qs = new URLSearchParams();
  if (params?.q) qs.set("q", params.q);
  if (params?.act) qs.set("act", params.act);

  const res = await fetch(`${API}/tecnicos${qs.toString() ? `?${qs.toString()}` : ""}`, {
    headers: { ...getAuthHeaders() },
    cache: "no-store",
  });
  return handleJson(res) as Promise<Tecnico[]>;
}

export async function createTecnico(body: Omit<Tecnico, "ID_TEC" | "FEC_CRE_TEC">) {
  const res = await fetch(`${API}/tecnicos`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...getAuthHeaders() },
    body: JSON.stringify(body),
  });
  return handleJson(res) as Promise<Tecnico>;
}

export async function updateTecnico(id: number, patch: Partial<Omit<Tecnico, "ID_TEC" | "FEC_CRE_TEC">>) {
  const res = await fetch(`${API}/tecnicos/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json", ...getAuthHeaders() },
    body: JSON.stringify(patch),
  });
  return handleJson(res) as Promise<Tecnico>;
}

export async function patchTecnicoEstado(id: number, activo: boolean) {
  const res = await fetch(`${API}/tecnicos/${id}/estado`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json", ...getAuthHeaders() },
    body: JSON.stringify({ activo }),
  });
  return handleJson(res) as Promise<{ message: string; EST_TEC: boolean }>;
}