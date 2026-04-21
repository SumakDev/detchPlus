const API = process.env.NEXT_PUBLIC_API_URL || "";

// Login: acepta usuario o email en "identifier"
export async function loginApi(identifier: string, password: string) {
  const res = await fetch(`${API}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ usuario: identifier, password }),
  });
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
  // Ahora el backend devuelve { token, session_id, expires_at, user }
  return json as { token: string; session_id?: string; expires_at?: string; user?: any };
}

function getAuthHeaders(): Record<string, string> {
  if (typeof window === "undefined") return {};
  const token = localStorage.getItem("auth_token");
  return token ? { Authorization: `Bearer ${token}` } : {};
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

// Logout: cierra la sesión en backend
export async function logoutApi() {
  const session_id = typeof window !== "undefined" ? localStorage.getItem("session_id") : undefined;
  const res = await fetch(`${API}/auth/logout`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...getAuthHeaders() },
    body: JSON.stringify({ session_id }), // opcional; backend usa jti del token
  });
  return handleJson(res);
}
// Registro: requiere usuario, email, password, nombres, apellidos y aceptaTerminos
export async function registerApi(params: {
  usuario: string;
  email: string;
  password: string;
  nombres: string;
  apellidos: string;
  aceptaTerminos: boolean;
}) {
  const res = await fetch(`${API}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(params),
  });
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
  return json as { token?: string; user?: any };
}