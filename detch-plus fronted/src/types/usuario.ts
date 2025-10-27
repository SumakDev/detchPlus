export type Usuario = {
  ID_USU: number;
  USR_USU: string;
  COR_USU: string;
  NOM_USU: string;
  APE_USU: string;
  ID_ROL: number;
  EST_USU: "ACTIVO" | "INACTIVO" | "BLOQUEADO" | "PEND_VER";
  rol?: { ID_ROL: number; NOM_ROL: string };
};