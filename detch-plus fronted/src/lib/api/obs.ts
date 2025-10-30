import type { Observacion } from "@/types/observacion";

const API = process.env.NEXT_PUBLIC_API_URL || "";


function getAuthHeaders(): HeadersInit {
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



export async function fetchObservacionesCliente(cedula: string) {
  const res = await fetch(`${API}/obs/cliente/${encodeURIComponent(cedula)}`, {
    headers: { ...getAuthHeaders() },
    cache: "no-store",
  });
  return handleJson(res) as Promise<Observacion[]>;
}

export async function createObservacionCliente(cedula: string, body: { DES_OBS: string; NUM_REF_OBS?: string | null }) {
  const res = await fetch(`${API}/obs/cliente/${encodeURIComponent(cedula)}`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...getAuthHeaders() },
    body: JSON.stringify(body),
  });
  return handleJson(res) as Promise<Observacion>;
}

export async function updateObservacion(id: number, patch: Partial<Pick<Observacion, "DES_OBS" | "NUM_REF_OBS">>) {
  const res = await fetch(`${API}/obs/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json", ...getAuthHeaders() },
    body: JSON.stringify(patch),
  });
  return handleJson(res) as Promise<Observacion>;
}

export async function deleteObservacion(id: number) {
  const res = await fetch(`${API}/obs/${id}`, {
    method: "DELETE",
    headers: { ...getAuthHeaders() },
  });
  return handleJson(res) as Promise<{ message: string }>;
}