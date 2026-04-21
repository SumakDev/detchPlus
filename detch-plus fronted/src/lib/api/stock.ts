import { apiClient, filesBaseUrl } from "../apiClient";
import { dbToUi, type StockDb, type StockFilters, type StockItem } from "@/types/stock";

function absolutizeImage(item: StockItem): StockItem {
  const img = item.producto?.img;
  if (!img) return item;
  if (/^https?:\/\//i.test(img)) return item;
  return {
    ...item,
    producto: { ...(item.producto as NonNullable<StockItem["producto"]>), img: `${filesBaseUrl()}/${img}` },
  };
}

export async function fetchStock(params?: StockFilters & { page?: number; limit?: number }): Promise<StockItem[]> {
  const qs = new URLSearchParams();
  if (params?.q) qs.set("q", params.q);
  if (params?.estado && params.estado !== "todos") qs.set("estado", params.estado);
  if (params?.page) qs.set("page", String(params.page));
  if (params?.limit) qs.set("limit", String(params.limit));

  const json = await apiClient.get(`/stock${qs.toString() ? `?${qs.toString()}` : ""}`);
  const rows: StockDb[] = Array.isArray(json) ? json : json?.data ?? [];
  return rows.map(dbToUi).map(absolutizeImage);
}

export async function postAjusteDisponible(
  idPro: number | string,
  delta: number,
  extra?: { motivo?: string; numDoc?: string; cedEmp?: string }
) {
  return apiClient.post("/stock/ajustar", { idPro, delta, ...extra });
}

export async function putMinMax(idPro: number | string, min: number, max?: number) {
  return apiClient.put(`/stock/minmax/${encodeURIComponent(String(idPro))}`, {
    min,
    ...(typeof max === "number" ? { max } : {}),
  });
}

export async function putUbicacion(idPro: number | string, ubicacion: string) {
  return apiClient.put(`/stock/ubicacion/${encodeURIComponent(String(idPro))}`, { ubicacion });
}