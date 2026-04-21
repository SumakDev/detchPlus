const API = process.env.NEXT_PUBLIC_API_URL || "";

export function getAuthHeaders(): Record<string, string> {
  if (typeof window === "undefined") return {};
  const token = localStorage.getItem("auth_token");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export function filesBaseUrl(): string {
  if (!API) return "";
  return API.replace(/\/api\/?$/, "") + "/uploads";
}

export async function handleJson(res: Response): Promise<any> {
  const text = await res.text();
  let json: any = null;
  try { json = text ? JSON.parse(text) : null; } catch {}
  if (!res.ok) {
    const msg =
      (json?.error && typeof json.error === "string" && json.error) ||
      (json?.message && typeof json.message === "string" && json.message) ||
      text || `HTTP ${res.status}`;
    const err = new Error(msg) as Error & { status?: number; details?: any };
    err.status = res.status;
    err.details = json?.details;
    throw err;
  }
  return json;
}

export const apiClient = {
  baseUrl: API,

  async get(path: string, options?: RequestInit): Promise<any> {
    const res = await fetch(`${API}${path}`, {
      headers: { ...getAuthHeaders() },
      cache: "no-store",
      ...options,
    });
    return handleJson(res);
  },

  async post(path: string, body: unknown, isFormData = false): Promise<any> {
    const res = await fetch(`${API}${path}`, {
      method: "POST",
      headers: isFormData
        ? { ...getAuthHeaders() }
        : { "Content-Type": "application/json", ...getAuthHeaders() },
      body: isFormData ? (body as FormData) : JSON.stringify(body),
    });
    return handleJson(res);
  },

  async put(path: string, body: unknown, isFormData = false): Promise<any> {
    const res = await fetch(`${API}${path}`, {
      method: "PUT",
      headers: isFormData
        ? { ...getAuthHeaders() }
        : { "Content-Type": "application/json", ...getAuthHeaders() },
      body: isFormData ? (body as FormData) : JSON.stringify(body),
    });
    return handleJson(res);
  },

  async patch(path: string, body: unknown): Promise<any> {
    const res = await fetch(`${API}${path}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", ...getAuthHeaders() },
      body: JSON.stringify(body),
    });
    return handleJson(res);
  },

  async delete(path: string): Promise<any> {
    const res = await fetch(`${API}${path}`, {
      method: "DELETE",
      headers: { ...getAuthHeaders() },
    });
    return handleJson(res);
  },
};
