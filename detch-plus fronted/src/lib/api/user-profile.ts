import type { MeProfile } from "@/types/meProfile";

const API = process.env.NEXT_PUBLIC_API_URL || "";

function getAuthHeaders(): HeadersInit {
  if (typeof window === "undefined") return {};
  const token = localStorage.getItem("auth_token");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

function filesBaseUrl() {
  if (!API) return "";
  return API.replace(/\/api\/?$/, "") + "/uploads";
}
function absolutize(url?: string | null) {
  if (!url) return undefined;
  if (/^https?:\/\//i.test(url)) return url;
  return `${filesBaseUrl()}/${url}`;
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



export async function getProfile() {
  const res = await fetch(`${API}/perfil/me`, { headers: { ...getAuthHeaders() }, cache: "no-store" });
  const data = (await handleJson(res)) as { user: MeProfile };
  if (data?.user) data.user.AVA_USU = absolutize(data.user.AVA_USU) as any;
  return data;
}

export async function updateProfile(patch: Partial<Pick<MeProfile, "NOM_USU" | "APE_USU" | "COR_USU" | "USR_USU">>) {
  const res = await fetch(`${API}/perfil/me`, {
    method: "PUT",
    headers: { "Content-Type": "application/json", ...getAuthHeaders() },
    body: JSON.stringify(patch),
  });
  const data = (await handleJson(res)) as { user: MeProfile };
  if (data?.user) data.user.AVA_USU = absolutize(data.user.AVA_USU) as any;
  return data;
}

export async function changePassword(current_password: string, new_password: string) {
  const res = await fetch(`${API}/perfil/me/password`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json", ...getAuthHeaders() },
    body: JSON.stringify({ current_password, new_password }),
  });
  return handleJson(res) as Promise<{ message: string }>;
}

export async function updateAvatar(file: File) {
  const fd = new FormData();
  fd.append("avatar", file);
  const res = await fetch(`${API}/perfil/me/avatar`, {
    method: "POST",
    headers: { ...getAuthHeaders() }, // no content-type manual
    body: fd,
  });
  const data = (await handleJson(res)) as { user: MeProfile };
  if (data?.user) data.user.AVA_USU = absolutize(data.user.AVA_USU) as any;
  return data;
}