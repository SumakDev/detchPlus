export type MeProfile = {
  ID_USU: number;
  USR_USU: string;
  COR_USU?: string | null;
  NOM_USU?: string | null;
  APE_USU?: string | null;
  TIPO_PERSONA: "CLIENTE" | "EMPLEADO";
  ID_PERSONA: string;
  ID_ROL: number;
  EST_USU?: string;
  AVA_USU?: string | null;
};