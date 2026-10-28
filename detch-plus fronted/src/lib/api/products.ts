const API = process.env.NEXT_PUBLIC_API_URL || "";

import type { Producto, ProductoFormData } from "@/types/product";

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

export function toFormData(input: ProductoFormData | FormData): FormData {
  if (input instanceof FormData) return input;
  const fd = new FormData();
  if (input.COD_BAR_PRO) fd.append("COD_BAR_PRO", input.COD_BAR_PRO);
  fd.append("ID_CAT", String(input.ID_CAT));
  fd.append("ID_MAR", String(input.ID_MAR));
  if (input.ID_MOD) fd.append("ID_MOD", String(input.ID_MOD));
  if (input.ID_PRV !== undefined) {
    fd.append("ID_PRV", input.ID_PRV ? String(input.ID_PRV) : "");
  }
  if (input.DES_PRO) fd.append("DES_PRO", input.DES_PRO);
  fd.append("ORG_PRO", input.ORG_PRO);
  fd.append("EST_PRO", input.EST_PRO);
  if (input.PRECIO_VENTA !== undefined && input.PRECIO_VENTA !== "") {
    fd.append("PRECIO_VENTA", String(input.PRECIO_VENTA));
  }
  fd.append("ACT_PRO", String(!!input.ACT_PRO));
  if (input.detallesTelefono) {
    fd.append("DETALLES_TELEFONO", JSON.stringify(input.detallesTelefono));
  }
  if (input.DETALLE_RELOJ) {
    fd.append("DETALLE_RELOJ", JSON.stringify(input.DETALLE_RELOJ));
  }
  if (input.DETALLE_CONSOLA) {
    fd.append("DETALLE_CONSOLA", JSON.stringify(input.DETALLE_CONSOLA));
  }
  if (input.removeImage) {
    fd.append("removeImage", "true");
  } else if (input.imageFile) {
    fd.append("image", input.imageFile);
  } else if (input.IMG_URL) {
    fd.append("IMG_URL", input.IMG_URL);
  }
  return fd;
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

export async function createProducto(form: FormData | ProductoFormData): Promise<Producto> {
  const body = toFormData(form);
  const res = await fetch(`${API}/productos`, {
    method: "POST",
    headers: { ...getAuthHeaders() },
    body,
  });
  const json = await handleJson(res);
  return withAbsoluteImage(json) as Producto;
}

export async function updateProducto(id: string, form: FormData | ProductoFormData): Promise<Producto> {
  const body = toFormData(form);
  const res = await fetch(`${API}/productos/${encodeURIComponent(String(id))}`, {
    method: "PUT",
    headers: { ...getAuthHeaders() },
    body,
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
