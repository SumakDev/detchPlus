import { apiClient } from "../apiClient";
import { Tecnico } from "@/types/tecnico";

export async function fetchTecnicos(params?: { q?: string; act?: "true" | "false" }) {
  const qs = new URLSearchParams();
  if (params?.q) qs.set("q", params.q);
  if (params?.act) qs.set("act", params.act);
  return apiClient.get(`/tecnicos${qs.toString() ? `?${qs.toString()}` : ""}`) as Promise<Tecnico[]>;
}

export async function createTecnico(body: Omit<Tecnico, "ID_TEC" | "FEC_CRE_TEC">) {
  return apiClient.post("/tecnicos", body) as Promise<Tecnico>;
}

export async function updateTecnico(id: number, patch: Partial<Omit<Tecnico, "ID_TEC" | "FEC_CRE_TEC">>) {
  return apiClient.put(`/tecnicos/${id}`, patch) as Promise<Tecnico>;
}

export async function patchTecnicoEstado(id: number, activo: boolean) {
  return apiClient.patch(`/tecnicos/${id}/estado`, { activo }) as Promise<{ message: string; EST_TEC: boolean }>;
}