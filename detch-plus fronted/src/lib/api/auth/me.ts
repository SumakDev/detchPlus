import { apiClient } from "../../apiClient";

export type MeUser = {
  ID_USU: number;
  ID_ROL: number;
  USR_USU?: string;
  COR_USU?: string;
  NOM_USU?: string;
  APE_USU?: string;
  AVA_USU?: string | null;
};

export async function getMe(): Promise<{ user: MeUser }> {
  return apiClient.get("/auth/me");
}