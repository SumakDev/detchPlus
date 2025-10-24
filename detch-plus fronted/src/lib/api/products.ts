const API = process.env.NEXT_PUBLIC_API_URL || "";

import type { Producto } from "@/types/product";

function getAuthHeaders(): HeadersInit {
  if (typeof window === "undefined") return {};
  const token = localStorage.getItem("auth_token");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

function filesBaseUrl() {
  if (!API) return "";
  return API.replace(/\/api\/?$/, "") + "/uploads";
}

function withAbsoluteImage(p: any) {
  if (!p?.IMG_URL) return p;
  if (/^https?:\/\//i.test(p.IMG_URL)) return p;
  return { ...p, IMG_URL: `${filesBaseUrl()}/${p.IMG_URL}` };
}

async function handleJson(res: Response) {
  const text = await res.text();
  let json: any = null;
  try { json = text ? JSON.parse(text) : null; } catch {}
  if (!res.ok) {
    const msg =
      (json?.error && typeof json.error === "string" && json.error) ||
      (json?.message && typeof json.message === "string" && json.message) ||
      text || `HTTP ${res.status}`;
    const err = new Error(msg) as Error & { status?: number; details?: any };
    err.status = res.status; err.details = json?.details;
    throw err;
  }
  return json;
}

export async function fetchProductos(params?: { q?: string; activo?: "true" | "false" }): Promise<Producto[]> {
  const qs = new URLSearchParams();
  if (params?.q) qs.set("q", params.q);
  if (params?.activo) qs.set("activo", params.activo);
  const res = await fetch(`${API}/productos${qs.toString() ? `?${qs.toString()}` : ""}`, {
    headers: { ...getAuthHeaders() },
    cache: "no-store",
  });
  const json = await handleJson(res);
  const rows = Array.isArray(json) ? json : json?.data ?? [];
  return rows.map(withAbsoluteImage) as Producto[];
}

export async function createProducto(form: FormData): Promise<Producto> {
  const res = await fetch(`${API}/productos`, {
    method: "POST",
    headers: { ...getAuthHeaders() },
    body: form,
  });
  const json = await handleJson(res);
  return withAbsoluteImage(json) as Producto;
}

export async function updateProducto(id: string, form: FormData): Promise<Producto> {
  const res = await fetch(`${API}/productos/${encodeURIComponent(String(id))}`, {
    method: "PUT",
    headers: { ...getAuthHeaders() },
    body: form,
  });
  const json = await handleJson(res);
  return withAbsoluteImage(json) as Producto;
}

export async function deleteProducto(id: string): Promise<void> {
  const res = await fetch(`${API}/productos/${encodeURIComponent(String(id))}`, {
    method: "DELETE",
    headers: { ...getAuthHeaders() },
  });
  await handleJson(res);
}