import { apiClient } from "../apiClient";
import { Usuario } from "@/types/usuario";

export type RolOption = { ID_ROL: number; NOM_ROL: string; DES_ROL?: string };

export async function fetchUsuarios(params?: { q?: string; rol?: number; est?: string }) {
  const qs = new URLSearchParams();
  if (params?.q) qs.set("q", params.q);
  if (params?.rol) qs.set("rol", String(params.rol));
  if (params?.est) qs.set("est", params.est);
  return apiClient.get(`/usuarios${qs.toString() ? `?${qs.toString()}` : ""}`) as Promise<Usuario[]>;
}

export async function fetchRoles(): Promise<RolOption[]> {
  return apiClient.get("/roles");
}

export async function updateUsuarioRol(id: number, ID_ROL: number) {
  return apiClient.put(`/usuarios/${id}`, { ID_ROL }) as Promise<Usuario>;
}

export async function updateUsuarioEstado(id: number, EST_USU: Usuario["EST_USU"]) {
  return apiClient.put(`/usuarios/${id}`, { EST_USU }) as Promise<Usuario & { message?: string }>;
}