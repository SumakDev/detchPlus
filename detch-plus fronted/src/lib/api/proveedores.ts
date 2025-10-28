const API = process.env.NEXT_PUBLIC_API_URL || "";
import { Proveedor } from "@/types/proveedor";

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



export async function fetchProveedores(params?: { q?: string; act?: "true" | "false" }) {
  const qs = new URLSearchParams();
  if (params?.q) qs.set("q", params.q);
  if (params?.act) qs.set("act", params.act);

  const res = await fetch(`${API}/proveedores${qs.toString() ? `?${qs.toString()}` : ""}`, {
    headers: { ...getAuthHeaders() },
    cache: "no-store",
  });
  return handleJson(res) as Promise<Proveedor[]>;
}

export async function createProveedor(body: Omit<Proveedor, "ID_PRV" | "FEC_CRE_PRV">) {
  const res = await fetch(`${API}/proveedores`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...getAuthHeaders() },
    body: JSON.stringify(body),
  });
  return handleJson(res) as Promise<Proveedor>;
}

export async function updateProveedor(id: number, patch: Partial<Omit<Proveedor, "ID_PRV" | "FEC_CRE_PRV">>) {
  const res = await fetch(`${API}/proveedores/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json", ...getAuthHeaders() },
    body: JSON.stringify(patch),
  });
  return handleJson(res) as Promise<Proveedor>;
}

export async function patchProveedorEstado(id: number, activo: boolean) {
  const res = await fetch(`${API}/proveedores/${id}/estado`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json", ...getAuthHeaders() },
    body: JSON.stringify({ activo }),
  });
  return handleJson(res) as Promise<{ message: string; EST_PRV: boolean }>;
}

export async function removeProveedor(id: number) {
  const res = await fetch(`${API}/proveedores/${id}`, {
    method: "DELETE",
    headers: { ...getAuthHeaders() },
  });
  return handleJson(res) as Promise<{ message: string }>;
}