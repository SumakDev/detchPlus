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
  return json as { token: string; user?: any };
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
  return json as { token?: string; user?: any; emailPreview?: string; message?: string };
}

// Recuperar contraseña (solicitar correo)
export async function forgotPasswordApi(email: string) {
  const res = await fetch(`${API}/auth/forgot-password`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email }),
  });
  const text = await res.text();
  let json: any = null;
  try { json = text ? JSON.parse(text) : null; } catch {}
  if (!res.ok) {
    const msg =
      (json?.error && typeof json.error === "string" && json.error) ||
      (json?.message && typeof json.message === "string" && json.message) ||
      text || `HTTP ${res.status}`;
    throw new Error(msg);
  }
  return json as { message: string; emailPreview?: string };
}

// Restablecer contraseña con token
export async function resetPasswordApi(token: string, password: string) {
  const res = await fetch(`${API}/auth/reset-password`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ token, password }),
  });
  const text = await res.text();
  let json: any = null;
  try { json = text ? JSON.parse(text) : null; } catch {}
  if (!res.ok) {
    const msg =
      (json?.error && typeof json.error === "string" && json.error) ||
      (json?.message && typeof json.message === "string" && json.message) ||
      text || `HTTP ${res.status}`;
    throw new Error(msg);
  }
  return json as { message: string };
}

// Verificar correo electrónico
export async function verifyEmailApi(token: string) {
  const res = await fetch(`${API}/auth/verify-email?token=${encodeURIComponent(token)}`, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  });
  const text = await res.text();
  let json: any = null;
  try { json = text ? JSON.parse(text) : null; } catch {}
  if (!res.ok) {
    const msg =
      (json?.error && typeof json.error === "string" && json.error) ||
      (json?.message && typeof json.message === "string" && json.message) ||
      text || `HTTP ${res.status}`;
    throw new Error(msg);
  }
  return json as { message: string; user?: any };
}