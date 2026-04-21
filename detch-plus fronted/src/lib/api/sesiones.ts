const API = process.env.NEXT_PUBLIC_API_URL || "";

import { SesionUsuario } from "@/types/sesionUsuario";

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



// Admin: listar sesiones con filtros
export async function fetchSesiones(params?: { q?: string; user?: number; act?: "true" | "false"; exp?: "true" | "false" }) {
  const qs = new URLSearchParams();
  if (params?.q) qs.set("q", params.q);
  if (params?.user) qs.set("user", String(params.user));
  if (params?.act) qs.set("act", params.act);
  if (params?.exp) qs.set("exp", params.exp);
  const res = await fetch(`${API}/sesiones${qs.toString() ? `?${qs.toString()}` : ""}`, {
    headers: { ...getAuthHeaders() },
    cache: "no-store",
  });
  return handleJson(res) as Promise<SesionUsuario[]>;
}

// Usuario: mis sesiones
export async function fetchMisSesiones() {
  const res = await fetch(`${API}/sesiones/me/list`, {
    headers: { ...getAuthHeaders() },
    cache: "no-store",
  });
  return handleJson(res) as Promise<SesionUsuario[]>;
}

// Cerrar una sesión (admin o usuario)
export async function closeSesion(id: string) {
  const res = await fetch(`${API}/sesiones/${id}/cerrar`, {
    method: "PATCH",
    headers: { ...getAuthHeaders(), "Content-Type": "application/json" },
  });
  return handleJson(res) as Promise<{ message: string; ID_SES_USU?: string }>;
}

// Heartbeat (actualizar última actividad y opcionalmente extender exp)
export async function heartbeatSesion(id: string, extendSec?: number) {
  const res = await fetch(`${API}/sesiones/${id}/heartbeat`, {
    method: "PATCH",
    headers: { ...getAuthHeaders(), "Content-Type": "application/json" },
    body: JSON.stringify(extendSec ? { extendSec } : {}),
  });
  return handleJson(res) as Promise<SesionUsuario>;
}

// Cerrar otras sesiones (usuario). Si tienes el id actual, pásalo como keepId para conservarla.
export async function closeOtrasSesiones(keepId?: string) {
  const res = await fetch(`${API}/sesiones/cerrar-otras`, {
    method: "POST",
    headers: { ...getAuthHeaders(), "Content-Type": "application/json" },
    body: JSON.stringify(keepId ? { keepId } : {}),
  });
  return handleJson(res) as Promise<{ message: string; count: number }>;
}

// Admin: cerrar todas las sesiones de un usuario
export async function closeTodasSesionesUsuario(userId: number) {
  const res = await fetch(`${API}/sesiones/usuario/${userId}/cerrar-todas`, {
    method: "POST",
    headers: { ...getAuthHeaders(), "Content-Type": "application/json" },
  });
  return handleJson(res) as Promise<{ message: string; count: number }>;
}

// Admin: eliminar sesión (borrado físico)
export async function deleteSesion(id: string) {
  const res = await fetch(`${API}/sesiones/${id}`, {
    method: "DELETE",
    headers: { ...getAuthHeaders() },
  });
  return handleJson(res) as Promise<{ message: string }>;

  
}
