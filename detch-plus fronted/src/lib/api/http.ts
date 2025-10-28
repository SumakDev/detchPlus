export async function apiFetch(input: RequestInfo | URL, init?: RequestInit) {
  const res = await fetch(input, init);
  if (res.status === 401 || res.status === 403) {
    if (typeof window !== "undefined") {
      localStorage.removeItem("auth_token");
      localStorage.removeItem("session_id");
      localStorage.removeItem("auth_user");
      window.location.replace("/");
    }
    // lanza para cortar la ejecución
    const text = await res.text();
    const err: any = new Error(text || `HTTP ${res.status}`);
    err.status = res.status;
    throw err;
  }
  return res;
}