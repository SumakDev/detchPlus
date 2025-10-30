export type Usuario = {
  ID_USU: number;
  USR_USU: string;
  COR_USU: string;
  NOM_USU: string;
  APE_USU: string;
  TIPO_PERSONA?: string | null;
  ID_PERSONA?: string | null;
  AVA_USU?: string | null;
  ID_ROL: number;
  EST_USU: "ACTIVO" | "INACTIVO" | "BLOQUEADO" | "PEND_VER";
  rol?: { ID_ROL: number; NOM_ROL: string };
};