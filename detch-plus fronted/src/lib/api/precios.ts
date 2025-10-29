const API = process.env.NEXT_PUBLIC_API_URL || "";

import type { Precio } from "@/types/precio";

function getAuthHeaders(): Record<string, string> {
  if (typeof window === "undefined") return {};
  const token = localStorage.getItem("auth_token");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

function filesBaseUrl() {
  if (!API) return "";
  return API.replace(/\/api\/?$/, "") + "/uploads";
}

function absolutizeImage(url?: string | null) {
  if (!url) return url;
  if (/^https?:\/\//i.test(url)) return url;
  return `${filesBaseUrl()}/${url}`;
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


function mapPrecioImage(p: Precio): Precio {
  if (p?.producto) {
    p.producto = { ...p.producto, IMG_URL: absolutizeImage(p.producto.IMG_URL) };
  }
  return p;
}

// listados
export async function fetchPrecios(params?: { q?: string; id_pro?: number; tip?: Precio["TIP_PRE"] }) {
  const qs = new URLSearchParams();
  if (params?.q) qs.set("q", params.q);
  if (params?.id_pro) qs.set("id_pro", String(params.id_pro));
  if (params?.tip) qs.set("tip", params.tip);
  const res = await fetch(`${API}/precios${qs.toString() ? `?${qs.toString()}` : ""}`, {
    headers: { ...getAuthHeaders() }, cache: "no-store",
  });
  const data = (await handleJson(res)) as Precio[];
  return data.map(mapPrecioImage);
}

export async function fetchPreciosPorProducto(id: number, tip?: Precio["TIP_PRE"]) {
  const url = `${API}/precios/producto/${id}${tip ? `?tip=${encodeURIComponent(tip)}` : ""}`;
  const res = await fetch(url, { headers: { ...getAuthHeaders() }, cache: "no-store" });
  const data = (await handleJson(res)) as Precio[];
  return data.map(mapPrecioImage);
}

export async function createPrecio(body: Omit<Precio, "ID_PRE">) {
  const res = await fetch(`${API}/precios`, {
    method: "POST", headers: { "Content-Type": "application/json", ...getAuthHeaders() },
    body: JSON.stringify(body),
  });
  const data = (await handleJson(res)) as Precio;
  return mapPrecioImage(data);
}

export async function updatePrecio(id: number, patch: Partial<Omit<Precio, "ID_PRE">>) {
  const res = await fetch(`${API}/precios/${id}`, {
    method: "PUT", headers: { "Content-Type": "application/json", ...getAuthHeaders() },
    body: JSON.stringify(patch),
  });
  const data = (await handleJson(res)) as Precio;
  return mapPrecioImage(data);
}

export async function upsertPrecioPorTipo(id_pro: number, tipo: Precio["TIP_PRE"], VAL_PRE: number) {
  const res = await fetch(`${API}/precios/producto/${id_pro}/tipo/${tipo}`, {
    method: "PUT", headers: { "Content-Type": "application/json", ...getAuthHeaders() },
    body: JSON.stringify({ VAL_PRE }),
  });
  const data = (await handleJson(res)) as Precio;
  return mapPrecioImage(data);
}

export async function deletePrecio(id: number) {
  const res = await fetch(`${API}/precios/${id}`, {
    method: "DELETE", headers: { ...getAuthHeaders() },
  });
  return handleJson(res) as Promise<{ message: string }>;
}