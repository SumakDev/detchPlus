const API = process.env.NEXT_PUBLIC_API_URL || "";

function getAuthHeaders(): Record<string, string> {
  if (typeof window === "undefined") return {};
  const token = localStorage.getItem("auth_token");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function get(path: string) {
  const res = await fetch(`${API}${path}`, { headers: { ...getAuthHeaders() }, cache: "no-store" });
  const text = await res.text();
  let json: any = null;
  try { json = text ? JSON.parse(text) : null; } catch {}
  if (!res.ok) throw new Error(json?.error || json?.message || text || `HTTP ${res.status}`);
  return json;
}

export async function fetchCategorias() {
  return get(`/catalogos/categorias`) as Promise<Array<{ ID_CAT: number; NOM_CAT: string; DES_CAT?: string }>>;
}

export async function fetchMarcas() {
  return get(`/catalogos/marcas`) as Promise<Array<{ ID_MAR: number; NOM_MAR: string }>>;
}

export async function fetchModelosByMarca(idMarca: number) {
  return get(`/catalogos/modelos?idMarca=${encodeURIComponent(idMarca)}`) as Promise<
    Array<{ ID_MOD: string; NOM_MOD: string; ID_MAR: number }>
  >;
}