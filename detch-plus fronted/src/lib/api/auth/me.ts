const API = process.env.NEXT_PUBLIC_API_URL || "";

function getAuthHeaders(): Record<string, string> {
  if (typeof window === "undefined") return {};
  const token = localStorage.getItem("auth_token");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export type MeUser = {
  ID_USU: number;
  ID_ROL: number;
  USR_USU?: string; // USR_USU
  COR_USU?: string; // COR_USU
  NOM_USU?: string;
  APE_USU?: string;
  AVA_USU?: string | null;
  EMAIL?: string;
  USUARIO?: string;
};

export async function getMe(): Promise<{ user: MeUser }> {
  const res = await fetch(`${API}/auth/me`, { headers: { ...getAuthHeaders() }, cache: "no-store" });
  if (!res.ok) throw new Error("No autenticado");
  return res.json();
}