const API = process.env.NEXT_PUBLIC_API_URL || "";

export type ClienteUI = {
  CED_CLI: string;
  NOMBRE: string;
  CORREO: string;
  ACTIVO: boolean;
  FECHA_REGISTRO: string;
};

export type VentasResumen = {
  totalHoy: number;
  totalHoyFmt: string;
  totalMes: number;
  ticketsHoy: number;
  promedioTicket: number;
  crecimientoVsAyerPct: number;
};

export type StockResumen = {
  totalProductos: number;
  criticos: number; // por debajo de mínimo
  agotados: number; // stock 0
  topCriticos: { sku: string; nombre: string; stock: number; min: number }[];
};

export type ReportesResumen = {
  generadosMes: number;
  pendientes: number;
  recientes: { id: string | number; nombre: string; fecha: string; estado: "LISTO" | "PENDIENTE" | "ERROR" }[];
};

function getAuthHeaders(): Record<string, string> {
  if (typeof window === "undefined") return {};
  const token = localStorage.getItem("auth_token");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function handleJson(res: Response) {
  const text = await res.text();
  let json: any = null;
  try {
    json = text ? JSON.parse(text) : null;
  } catch {}
  if (!res.ok) {
    const msg =
      (json?.error && typeof json.error === "string" && json.error) ||
      (json?.message && typeof json.message === "string" && json.message) ||
      text ||
      `HTTP ${res.status}`;
    const err = new Error(msg) as Error & { status?: number; details?: any };
    err.status = res.status;
    err.details = json?.details;
    throw err;
  }
  return json;
}

// Ajusta estos endpoints a tu backend:
const ENDPOINTS = {
  clientes: "/clientes",
  ventasResumen: "/ventas/resumen",
  stockResumen: "/stock/resumen",
  reportesResumen: "/reportes/resumen",
};

export async function fetchClientesListado(): Promise<ClienteUI[]> {
  try {
    const res = await fetch(`${API}${ENDPOINTS.clientes}`, {
      headers: { ...getAuthHeaders() },
      cache: "no-store",
    });
    const json = await handleJson(res);
    const rows = Array.isArray(json) ? json : json?.data ?? [];
    return rows.map((c: any) => ({
      CED_CLI: c.CED_CLI,
      NOMBRE: `${c.NOM_CLI || ""} ${c.APE_CLI || ""}`.trim(),
      CORREO: c.COR_CLI ?? "",
      ACTIVO: c.ACT_CLI ?? true,
      FECHA_REGISTRO: c.FEC_REG_CLI ?? new Date().toISOString(),
    }));
  } catch (e) {
    // si falla, devolvemos vacío para no romper el dashboard
    return [];
  }
}

export async function fetchVentasResumen(): Promise<VentasResumen> {
  try {
    const res = await fetch(`${API}${ENDPOINTS.ventasResumen}`, {
      headers: { "Content-Type": "application/json", ...getAuthHeaders() },
      cache: "no-store",
    });
    const json = await handleJson(res);
    // Esperado desde backend; si no existe, adaptamos
    return {
      totalHoy: Number(json.totalHoy ?? 0),
      totalHoyFmt: json.totalHoyFmt ?? `$${Number(json.totalHoy ?? 0).toFixed(2)}`,
      totalMes: Number(json.totalMes ?? 0),
      ticketsHoy: Number(json.ticketsHoy ?? 0),
      promedioTicket: Number(json.promedioTicket ?? 0),
      crecimientoVsAyerPct: Number(json.crecimientoVsAyerPct ?? 0),
    };
  } catch {
    // Fallback si no tienes aún el endpoint
    return {
      totalHoy: 0,
      totalHoyFmt: "$0.00",
      totalMes: 0,
      ticketsHoy: 0,
      promedioTicket: 0,
      crecimientoVsAyerPct: 0,
    };
  }
}

export async function fetchStockResumen(): Promise<StockResumen> {
  try {
    const res = await fetch(`${API}${ENDPOINTS.stockResumen}`, {
      headers: { ...getAuthHeaders() },
      cache: "no-store",
    });
    const json = await handleJson(res);
    return {
      totalProductos: Number(json.totalProductos ?? 0),
      criticos: Number(json.criticos ?? 0),
      agotados: Number(json.agotados ?? 0),
      topCriticos:
        json.topCriticos?.map((i: any) => ({
          sku: i.sku ?? i.ID_PRO ?? "",
          nombre: i.nombre ?? i.NOM_PRO ?? "Producto",
          stock: Number(i.stock ?? i.STOCK ?? 0),
          min: Number(i.min ?? i.MIN_STOCK ?? 0),
        })) ?? [],
    };
  } catch {
    return { totalProductos: 0, criticos: 0, agotados: 0, topCriticos: [] };
  }
}

export async function fetchReportesResumen(): Promise<ReportesResumen> {
  try {
    const res = await fetch(`${API}${ENDPOINTS.reportesResumen}`, {
      headers: { ...getAuthHeaders() },
      cache: "no-store",
    });
    const json = await handleJson(res);
    return {
      generadosMes: Number(json.generadosMes ?? 0),
      pendientes: Number(json.pendientes ?? 0),
      recientes:
        json.recientes?.map((r: any) => ({
          id: r.id ?? r.ID ?? r.NUM_REP ?? crypto.randomUUID(),
          nombre: r.nombre ?? r.NOM_REP ?? "Reporte",
          fecha: r.fecha ?? r.FEC_REP ?? new Date().toISOString(),
          estado: (r.estado ?? r.EST_REP ?? "PENDIENTE") as "LISTO" | "PENDIENTE" | "ERROR",
        })) ?? [],
    };
  } catch {
    return { generadosMes: 0, pendientes: 0, recientes: [] };
  }
}