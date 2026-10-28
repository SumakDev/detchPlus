import type { Proveedor } from "@/types/product";

const API = process.env.NEXT_PUBLIC_API_URL || "";

function getAuthHeaders(): Record<string, string> {
  if (typeof window === "undefined") return {};
  const token = localStorage.getItem("auth_token");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function request(path: string, init?: RequestInit) {
  const res = await fetch(`${API}${path}`, {
    ...init,
    headers: {
      ...getAuthHeaders(),
      ...(init?.headers || {}),
    },
    cache: "no-store",
  });
  const text = await res.text();
  let json: any = null;
  try {
    json = text ? JSON.parse(text) : null;
  } catch {}
  if (!res.ok) throw new Error(json?.error || json?.message || text || `HTTP ${res.status}`);
  return json;
}

export async function fetchCategorias() {
  return request(`/catalogos/categorias`) as Promise<Array<{ ID_CAT: number; NOM_CAT: string; DES_CAT?: string }>>;
}

export async function fetchMarcas() {
  return request(`/catalogos/marcas`) as Promise<Array<{ ID_MAR: number; NOM_MAR: string; DES_MAR?: string }>>;
}

export async function fetchModelosByMarca(idMarca?: number) {
  const qs = idMarca ? `?idMarca=${encodeURIComponent(idMarca)}` : "";
  return request(`/catalogos/modelos${qs}`) as Promise<
    Array<{ ID_MOD: string; NOM_MOD: string; ID_MAR: number; FEC_MOD?: string; marca?: { ID_MAR: number; NOM_MAR: string } }>
  >;
}

export async function fetchProveedores(): Promise<Proveedor[]> {
  return request(`/catalogos/proveedores`) as Promise<Proveedor[]>;
}

export async function createProveedor(payload: {
  NOM_PRV: string;
  RUC_PRV?: string;
  TEL_PRV?: string;
  COR_PRV?: string;
  DIR_PRV?: string;
  CON_PRI_PRV?: string;
  EST_PRV?: boolean;
}): Promise<Proveedor> {
  return request(`/proveedores`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  }) as Promise<Proveedor>;
}

export async function deleteProveedor(idPrv: number): Promise<void> {
  await request(`/proveedores/${encodeURIComponent(String(idPrv))}`, {
    method: "DELETE",
  });
}

export async function createMarca(payload: { NOM_MAR: string; DES_MAR?: string }): Promise<{ ID_MAR: number; NOM_MAR: string; DES_MAR?: string }> {
  return request(`/marcas`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
}

export async function createModelo(payload: {
  ID_MOD: string;
  NOM_MOD: string;
  ID_MAR: number;
  FEC_MOD?: string;
}): Promise<{ ID_MOD: string; NOM_MOD: string; ID_MAR: number; FEC_MOD: string }> {
  return request(`/modelos`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      ...payload,
      FEC_MOD: payload.FEC_MOD || new Date().toISOString().slice(0, 10),
    }),
  });
}
