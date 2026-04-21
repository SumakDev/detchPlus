export type Observacion = {
  ID_OBS: number;
  TIP_OBS: "CLIENTE" | "PRODUCTO" | "SERVICIO" | "GENERAL";
  DES_OBS: string;
  FEC_OBS: string;
  CED_CLI?: string | null;
  CED_EMP: string;
  NUM_REF_OBS?: string | null;
};