import { apiClient, filesBaseUrl } from "../apiClient";
import type { Producto } from "@/types/product";

function withAbsoluteImage(p: any) {
  if (!p?.IMG_URL) return p;
  if (/^https?:\/\//i.test(p.IMG_URL)) return p;
  return { ...p, IMG_URL: `${filesBaseUrl()}/${p.IMG_URL}` };
}

export async function fetchProductos(params?: { q?: string; activo?: "true" | "false" }): Promise<Producto[]> {
  const qs = new URLSearchParams();
  if (params?.q) qs.set("q", params.q);
  if (params?.activo) qs.set("activo", params.activo);
  const json = await apiClient.get(`/productos${qs.toString() ? `?${qs.toString()}` : ""}`);
  const rows = Array.isArray(json) ? json : json?.data ?? [];
  return rows.map(withAbsoluteImage) as Producto[];
}

export async function createProducto(form: FormData): Promise<Producto> {
  const json = await apiClient.post("/productos", form, true);
  return withAbsoluteImage(json) as Producto;
}

export async function updateProducto(id: string, form: FormData): Promise<Producto> {
  const json = await apiClient.put(`/productos/${encodeURIComponent(String(id))}`, form, true);
  return withAbsoluteImage(json) as Producto;
}

export async function deleteProducto(id: string): Promise<void> {
  await apiClient.delete(`/productos/${encodeURIComponent(String(id))}`);
}