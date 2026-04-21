const API = process.env.NEXT_PUBLIC_API_URL || "";

import type { DetTelefono } from "@/types/telefonos";

function getAuthHeaders(): Record<string, string> {
  if (typeof window === "undefined") return {};
  const token = localStorage.getItem("auth_token");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

function filesBaseUrl() {
  if (!API) return "";
  return API.replace(/\/api\/?$/, "") + "/uploads";
}
function absolutize(url?: string | null) {
  if (!url) return url || undefined;
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



function mapImg(d: DetTelefono): DetTelefono {
  if (d?.producto) d.producto = { ...d.producto, IMG_URL: absolutize(d.producto.IMG_URL) };
  return d;
}

export async function fetchTelefonos(params?: { q?: string }) {
  const qs = new URLSearchParams();
  if (params?.q) qs.set("q", params.q);
  const res = await fetch(`${API}/telefonos${qs.toString() ? `?${qs.toString()}` : ""}`, {
    headers: { ...getAuthHeaders() }, cache: "no-store",
  });
  const data = (await handleJson(res)) as DetTelefono[];
  return data.map(mapImg);
}

export async function fetchTelefono(id_pro: number) {
  const res = await fetch(`${API}/telefonos/${id_pro}`, {
    headers: { ...getAuthHeaders() }, cache: "no-store",
  });
  const data = (await handleJson(res)) as DetTelefono;
  return mapImg(data);
}

export async function upsertTelefonoPorProducto(id_pro: number, body: Partial<DetTelefono>) {
  const res = await fetch(`${API}/productos/${id_pro}/telefono`, {
    method: "PUT",
    headers: { "Content-Type": "application/json", ...getAuthHeaders() },
    body: JSON.stringify(body),
  });
  const data = (await handleJson(res)) as DetTelefono;
  return mapImg(data);
}