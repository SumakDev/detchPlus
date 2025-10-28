const API = process.env.NEXT_PUBLIC_API_URL || "";

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
    const msg = json?.error || json?.message || text || `HTTP ${res.status}`;
    const err = new Error(msg) as Error & { status?: number };
    (err as any).status = res.status;
    throw err;
  }
  return json;
}

export type ServicioDetalle = {
  ID_DET_SER?: number;
  NUM_SER?: number;
  IME_TEL_SER?: string | null;
  MAR_TEL_SER?: string | null;
  MOD_TEL_SER?: string | null;
  CAP_TEL_SER?: string | null;
  DES_REP_TEL_SER?: string | null;
  DIR_SER?: string | null;
  PROB_REP_SER?: string | null;
  SOL_APL_SER?: string | null;
};

export type ServicioTecnico = {
  NUM_SER: number;
  ID_TEC: number;
  CED_CLI: string;
  FEC_SER: string;
  PRE_SER: number;
  PRE_VEN_SER: number;
  IVA_SER: number;
  EST_SER: "RECIBIDO" | "EN_PROCESO" | "TERMINADO" | "ENTREGADO";
  cliente?: { CED_CLI: string; NOM_CLI?: string; APE_CLI?: string; TEL_CLI?: string; nombreCompleto?: string };
  tecnico?: { ID_TEC: number; NOM_TEC?: string; TEL_TEC?: string; EST_TEC?: boolean };
  detalle?: ServicioDetalle;
};

// LISTADO
export async function fetchServicios(params?: { q?: string; est?: string; page?: number; limit?: number }) {
  const qs = new URLSearchParams();
  if (params?.q) qs.set("q", params.q);
  if (params?.est) qs.set("est", params.est);
  if (params?.page) qs.set("page", String(params.page));
  if (params?.limit) qs.set("limit", String(params.limit));

  const res = await fetch(`${API}/servicios-tecnicos${qs.toString() ? `?${qs.toString()}` : ""}`, {
    headers: { ...getAuthHeaders() },
    cache: "no-store",
  });
  return handleJson(res) as Promise<ServicioTecnico[]>;
}

// OPCIONES (Técnicos activos y Clientes)
export async function fetchServTecOptions(): Promise<{
  tecnicos: Array<{ ID_TEC: number; NOM_TEC: string; TEL_TEC?: string; ESP_TEC?: string }>;
  clientes: Array<{ CED_CLI: string; NOM_CLI?: string; APE_CLI?: string; TEL_CLI?: string }>;
}> {
  const res = await fetch(`${API}/servicios-tecnicos/options`, {
    headers: { ...getAuthHeaders() },
    cache: "no-store",
  });
  return handleJson(res);
}

// CREAR SERVICIO (unificado con detalle)
// Mantiene la firma (data, detalle) para no tocar tu page.tsx, pero envía ambos en 1 sola llamada.
// Si el backend aún no crea el detalle, hace un upsert como respaldo.
export async function createServicio(
  data: {
    ID_TEC: number;
    CED_CLI: string;
    PRE_SER: number;
    IVA_SER?: number;
    PRE_VEN_SER?: number;
    FEC_SER?: string;
    EST_SER?: ServicioTecnico["EST_SER"];
  },
  detalle: ServicioDetalle = {}
) {
  // 1) Intentar crear todo junto
  const res = await fetch(`${API}/servicios-tecnicos`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...getAuthHeaders() },
    body: JSON.stringify({ ...data, ...(detalle && Object.keys(detalle).length ? { detalle } : {}) }),
  });

  const servicio = (await handleJson(res)) as ServicioTecnico;

  // 2) Respaldo: si se envió detalle pero el backend no lo creó, hacemos upsert anidado
  if (detalle && Object.keys(detalle).length && (!servicio.detalle || !servicio.detalle.ID_DET_SER)) {
    try {
      await upsertServicioDetalle(servicio.NUM_SER, detalle);
      // opcional: recuperar el detalle actualizado
      const det = await fetchServicioDetalle(servicio.NUM_SER).catch(() => null);
      if (det) servicio.detalle = det;
    } catch {
      // Si falla, dejamos servicio creado y dejamos al cliente decidir si reintenta crear el detalle
    }
  }

  return servicio;
}

// ACTUALIZAR SERVICIO
export async function updateServicio(num: number, patch: Partial<Omit<ServicioTecnico, "NUM_SER">>) {
  const res = await fetch(`${API}/servicios-tecnicos/${num}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json", ...getAuthHeaders() },
    body: JSON.stringify(patch),
  });
  return handleJson(res) as Promise<ServicioTecnico>;
}

// CAMBIAR ESTADO
export async function updateServicioEstado(num: number, estado: ServicioTecnico["EST_SER"]) {
  const res = await fetch(`${API}/servicios-tecnicos/${num}/estado`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json", ...getAuthHeaders() },
    body: JSON.stringify({ estado }),
  });
  return handleJson(res) as Promise<{ message: string }>;
}

// OBTENER SERVICIO INDIVIDUAL (con include)
export async function fetchServicio(num: number) {
  const res = await fetch(`${API}/servicios-tecnicos/${num}`, {
    headers: { ...getAuthHeaders() },
    cache: "no-store",
  });
  return handleJson(res) as Promise<ServicioTecnico>;
}

// OBTENER SOLO DETALLE
export async function fetchServicioDetalle(num: number) {
  const res = await fetch(`${API}/servicios-tecnicos/${num}/detalle`, {
    headers: { ...getAuthHeaders() },
    cache: "no-store",
  });
  return handleJson(res) as Promise<ServicioDetalle>;
}

// UPSERT DETALLE (crea o actualiza)
export async function upsertServicioDetalle(num: number, detalle: ServicioDetalle) {
  const res = await fetch(`${API}/servicios-tecnicos/${num}/detalle`, {
    method: "PUT",
    headers: { "Content-Type": "application/json", ...getAuthHeaders() },
    body: JSON.stringify(detalle),
  });
  return handleJson(res) as Promise<ServicioDetalle>;
}