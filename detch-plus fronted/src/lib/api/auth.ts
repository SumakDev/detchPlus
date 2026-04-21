import { apiClient } from "../apiClient";

export async function loginApi(identifier: string, password: string) {
  return apiClient.post("/auth/login", { usuario: identifier, password }) as Promise<{ token: string; user?: any }>;
}

export async function registerApi(params: {
  usuario: string;
  email: string;
  password: string;
  nombres: string;
  apellidos: string;
  aceptaTerminos: boolean;
}) {
  return apiClient.post("/auth/register", params) as Promise<{ token?: string; user?: any }>;
}