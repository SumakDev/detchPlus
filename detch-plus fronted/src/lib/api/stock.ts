import { StockItem, StockFilters } from "@/types/stock";

const API = process.env.NEXT_PUBLIC_API_URL || "";

function getAuthHeaders(): Record<string, string> {
  if (typeof window === "undefined") return {};
  const token = localStorage.getItem("auth_token");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

// Mapeo DB -> UI (ajusta las claves si tu backend usa otros nombres)
function dbToUi(r: any): StockItem {
  return {
    ID_PRO: r.ID_PRO ?? r.id ?? String(r.ID_PRO || r.id || ""),
    SKU: r.SKU ?? r.COD_PRO ?? undefined,
    NOM_PRO: r.NOM_PRO ?? r.nombre ?? "Producto",
    STOCK: Number(r.STOCK ?? r.EXISTENCIAS ?? r.CAN_STO ?? 0),
    MIN_STOCK: Number(r.MIN_STOCK ?? r.MINIMO ?? r.MIN_STO ?? 0),
    UBICACION: r.UBICACION ?? r.UBI_STO ?? "",
    ACTIVO: typeof r.ACTIVO === "boolean" ? r.ACTIVO : r.ACT_PRO ?? true,
    FEC_ACT: r.FEC_ACT ?? r.updatedAt ?? r.FEC_ACT_STO ?? null,
  };
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

// GET /stock? q=&estado=&page=&limit=
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
  const rows = Array.isArray(json) ? json : json?.data ?? [];
  return rows.map(dbToUi);
}

// POST /stock/ajustar  { idPro, delta, motivo }
export async function adjustStock(payload: { idPro: string; delta: number; motivo?: string }) {
  const res = await fetch(`${API}/stock/ajustar`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...getAuthHeaders() },
    body: JSON.stringify(payload),
  });
  const json = await handleJson(res);
  return dbToUi(json);
}

// PUT /stock/minimo/:idPro  { min }
export async function updateMinStock(idPro: string, min: number) {
  const res = await fetch(`${API}/stock/minimo/${encodeURIComponent(idPro)}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json", ...getAuthHeaders() },
    body: JSON.stringify({ min }),
  });
  const json = await handleJson(res);
  return dbToUi(json);
}