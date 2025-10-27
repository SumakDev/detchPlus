const API = process.env.NEXT_PUBLIC_API_URL || "";

import { Usuario } from "@/types/usuario";
function getAuthHeaders(): Record<string, string> {
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



export type RolOption = { ID_ROL: number; NOM_ROL: string; DES_ROL?: string };

export async function fetchUsuarios(params?: { q?: string; rol?: number; est?: string }) {
  const qs = new URLSearchParams();
  if (params?.q) qs.set("q", params.q);
  if (params?.rol) qs.set("rol", String(params.rol));
  if (params?.est) qs.set("est", params.est);
  const res = await fetch(`${API}/usuarios${qs.toString() ? `?${qs.toString()}` : ""}`, {
    headers: { ...getAuthHeaders() },
    cache: "no-store",
  });
  return handleJson(res) as Promise<Usuario[]>;
}

export async function fetchRoles(): Promise<RolOption[]> {
  const res = await fetch(`${API}/roles`, {
    headers: { ...getAuthHeaders() },
    cache: "no-store",
  });
  return handleJson(res);
}

export async function updateUsuarioRol(id: number, ID_ROL: number) {
  const res = await fetch(`${API}/usuarios/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json", ...getAuthHeaders() },
    body: JSON.stringify({ ID_ROL }),
  });
  return handleJson(res) as Promise<Usuario>;
}

export async function updateUsuarioEstado(id: number, EST_USU: Usuario["EST_USU"]) {
  const res = await fetch(`${API}/usuarios/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json", ...getAuthHeaders() },
    body: JSON.stringify({ EST_USU }),
  });
  return handleJson(res) as Promise<Usuario & { message?: string }>;
}