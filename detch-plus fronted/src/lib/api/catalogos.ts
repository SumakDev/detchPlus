import { apiClient } from "../apiClient";

export async function fetchCategorias() {
  return apiClient.get("/catalogos/categorias") as Promise<Array<{ ID_CAT: number; NOM_CAT: string; DES_CAT?: string }>>;
}

export async function fetchMarcas() {
  return apiClient.get("/catalogos/marcas") as Promise<Array<{ ID_MAR: number; NOM_MAR: string }>>;
}

export async function fetchModelosByMarca(idMarca: number) {
  return apiClient.get(`/catalogos/modelos?idMarca=${encodeURIComponent(idMarca)}`) as Promise<
    Array<{ ID_MOD: string; NOM_MOD: string; ID_MAR: number }>
  >;
}