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

// En tu backend expusiste roles en /roles
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

// NUEVO: actualización unificada
export async function updateUsuario(
  id: number,
  patch: Partial<Pick<Usuario, "ID_ROL" | "EST_USU" | "TIPO_PERSONA" | "ID_PERSONA">>
) {
  const res = await fetch(`${API}/usuarios/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json", ...getAuthHeaders() },
    body: JSON.stringify(patch),
  });
  return handleJson(res) as Promise<Usuario>;
}

// Tipos mínimos para validación
export type ClienteMin = { CED_CLI: string; NOM_CLI?: string; APE_CLI?: string };
export type EmpleadoMin = { CED_EMP: string; NOM_EMP?: string; APE_EMP?: string };

// GET /clientes/:cedula
export async function fetchClienteByCedula(cedula: string): Promise<ClienteMin> {
  const res = await fetch(`${API}/clientes/${encodeURIComponent(cedula)}`, {
    headers: { ...getAuthHeaders() },
    cache: "no-store",
  });
  return handleJson(res) as Promise<ClienteMin>;
}

// GET /empleados/:cedula
export async function fetchEmpleadoByCedula(cedula: string): Promise<EmpleadoMin> {
  const res = await fetch(`${API}/empleados/${encodeURIComponent(cedula)}`, {
    headers: { ...getAuthHeaders() },
    cache: "no-store",
  });
  return handleJson(res) as Promise<EmpleadoMin>;
}