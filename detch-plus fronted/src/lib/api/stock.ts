import { dbToUi, type StockDb, type StockFilters, type StockItem } from "@/types/stock";

const API = process.env.NEXT_PUBLIC_API_URL || "";

function getAuthHeaders(): Record<string, string> {
  if (typeof window === "undefined") return {};
  const token = localStorage.getItem("auth_token");
  if (token) {
    return { Authorization: `Bearer ${token}` };
  }
  return {};
}

async function handleJson(res: Response) {
  const text = await res.text();
  let json: any = null;
  try { json = text ? JSON.parse(text) : null; } catch {}
  if (!res.ok) {
    const msg = json?.error || json?.message || text || `HTTP ${res.status}`;
    const err = new Error(msg) as Error & { status?: number; details?: any };
    err.status = res.status;
    err.details = json?.details;
    throw err;
  }
  return json;
}

// Igual que en products: base para /uploads
function filesBaseUrl() {
  if (!API) return "";
  return API.replace(/\/api\/?$/, "") + "/uploads";
}

// Convierte item.producto.img a URL absoluta si es filename
function absolutizeImage(item: StockItem): StockItem {
  const img = item.producto?.img;
  if (!img) return item;
  if (/^https?:\/\//i.test(img)) return item;
  return {
    ...item,
    producto: { ...(item.producto as NonNullable<StockItem["producto"]>), img: `${filesBaseUrl()}/${img}` },
  };
}

// Lista de stock con mapeo a StockItem
export async function fetchStock(params?: StockFilters & { page?: number; limit?: number }): Promise<StockItem[]> {
  const qs = new URLSearchParams();
  if (params?.q) qs.set("q", params.q);
  if (params?.estado && params.estado !== "todos") qs.set("estado", params.estado);
  if (params?.page) qs.set("page", String(params.page));
  if (params?.limit) qs.set("limit", String(params.limit));

  const res = await fetch(`${API}/stock${qs.toString() ? `?${qs.toString()}` : ""}`, {
    headers: { ...getAuthHeaders() },
    cache: "no-store",
  });
  const json = await handleJson(res);
  const rows: StockDb[] = Array.isArray(json) ? json : json?.data ?? [];
  return rows.map(dbToUi).map(absolutizeImage);
}

// AJUSTE sobre disponible
export async function postAjusteDisponible(
  idPro: number | string,
  delta: number,
  extra?: { motivo?: string; numDoc?: string; cedEmp?: string }
) {
  const res = await fetch(`${API}/stock/ajustar`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...getAuthHeaders() },
    body: JSON.stringify({ idPro, delta, ...extra }),
  });
  return handleJson(res);
}

// Actualizar mínimos (y opcional máximo)
export async function putMinMax(idPro: number | string, min: number, max?: number) {
  const res = await fetch(`${API}/stock/minmax/${encodeURIComponent(String(idPro))}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json", ...getAuthHeaders() },
    body: JSON.stringify({ min, ...(typeof max === "number" ? { max } : {}) }),
  });
  return handleJson(res);
}

// Opcionales…
export async function putUbicacion(idPro: number | string, ubicacion: string) {
  const res = await fetch(`${API}/stock/ubicacion/${encodeURIComponent(String(idPro))}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json", ...getAuthHeaders() },
    body: JSON.stringify({ ubicacion }),
  });
  return handleJson(res);
}